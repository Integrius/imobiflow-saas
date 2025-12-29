'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  imovelId: string;
  fotos: string[];
  onUploadSuccess: (novaFoto: string) => void;
  onDeleteSuccess: (index: number) => void;
  onReorderSuccess: (newOrder: string[]) => void;
}

export default function ImageUpload({
  imovelId,
  fotos,
  onUploadSuccess,
  onDeleteSuccess,
  onReorderSuccess
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Verifica se é um arquivo sendo arrastado (contém "Files" no tipo)
    const hasFiles = Array.from(e.dataTransfer.types).includes('Files');

    // Não ativa a área de upload se estamos arrastando uma foto existente
    if (draggedIndex !== null || !hasFiles) {
      return;
    }

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    // Se estamos arrastando uma foto existente, não faz upload
    if (draggedIndex !== null) {
      return;
    }

    // Upload de novo arquivo
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validação de tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo inválido. Use JPG, PNG ou WebP');
      return;
    }

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenant_id');

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };

      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/imoveis/${imovelId}/upload-foto`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload');
      }

      const data = await response.json();
      onUploadSuccess(data.url);
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      alert(error.message || 'Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenant_id');

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };

      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/imoveis/${imovelId}/fotos/${index}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir foto');
      }

      onDeleteSuccess(index);
    } catch (error: any) {
      console.error('Erro ao excluir foto:', error);
      alert(error.message || 'Erro ao excluir foto');
    }
  };

  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handlePhotoDragLeave = () => {
    setDragOverIndex(null);
  };

  const handlePhotoDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Cria novo array com a ordem reordenada
    const newOrder = [...fotos];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    // Atualiza visualmente primeiro (otimista)
    onReorderSuccess(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Salva no backend
    try {
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenant_id');

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/imoveis/${imovelId}/reorder-fotos`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ fotos: newOrder }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao reordenar fotos');
      }
    } catch (error: any) {
      console.error('Erro ao reordenar fotos:', error);
      alert(error.message || 'Erro ao reordenar fotos');
      // Reverte para a ordem original em caso de erro
      onReorderSuccess(fotos);
    }
  };

  const handlePhotoDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
        Fotos do Imóvel
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-[#8FD14F] bg-[#DFF9C7]'
            : 'border-[rgba(169,126,111,0.3)] bg-white hover:border-[#8FD14F]/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD14F] mb-4"></div>
            <p className="text-[#2C2C2C] font-medium">Enviando foto...</p>
          </div>
        ) : (
          <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <svg
              className="mx-auto h-12 w-12 text-[#A97E6F]"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-[#2C2C2C] font-medium">
              Clique para enviar ou arraste e solte
            </p>
            <p className="mt-1 text-xs text-[#8B7F76]">
              PNG, JPG, WebP até 5MB
            </p>
          </div>
        )}
      </div>

      {/* Gallery */}
      {fotos && fotos.length > 0 && (
        <div>
          <p className="text-sm text-[#8B7F76] mb-3">
            Arraste as fotos para reordenar. A primeira foto será a principal.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto, index) => (
              <div
                key={`${foto}-${index}`}
                draggable
                onDragStart={(e) => handlePhotoDragStart(e, index)}
                onDragOver={(e) => handlePhotoDragOver(e, index)}
                onDragLeave={handlePhotoDragLeave}
                onDrop={(e) => handlePhotoDrop(e, index)}
                onDragEnd={handlePhotoDragEnd}
                className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                  draggedIndex === index
                    ? 'opacity-50 border-[#8FD14F] scale-95'
                    : dragOverIndex === index
                    ? 'border-[#8FD14F] border-dashed scale-105'
                    : 'border-[rgba(169,126,111,0.2)] hover:border-[#8FD14F]'
                }`}
              >
                <img
                  src={foto}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF6B6B] hover:bg-[#FF006E] text-white px-4 py-2 rounded-lg font-bold z-10"
                  >
                    Excluir
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-[#8FD14F] text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                    Principal
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

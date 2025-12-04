'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';

interface Imovel {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  valor: number;
  area?: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO';
  fotos?: string[];
  proprietario_id: string;
  proprietario?: {
    nome: string;
  };
}

interface ImovelForm {
  titulo: string;
  descricao: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  valor: string;
  area: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  status: string;
  proprietario_id: string;
  fotos: string;
}

interface Proprietario {
  id: string;
  nome: string;
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingImovel, setEditingImovel] = useState<Imovel | null>(null);
  const [deletingImovel, setDeletingImovel] = useState<Imovel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<ImovelForm>({
    titulo: '',
    descricao: '',
    tipo: 'APARTAMENTO',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    valor: '',
    area: '',
    quartos: '',
    banheiros: '',
    vagas: '',
    status: 'DISPONIVEL',
    proprietario_id: '',
    fotos: '',
  });

  useEffect(() => {
    loadImoveis();
    loadProprietarios();
  }, []);

  const loadImoveis = async () => {
    try {
      const response = await api.get('/imoveis');
      setImoveis(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar imóveis:', error);
      toast.error('Erro ao carregar imóveis');
    } finally {
      setLoading(false);
    }
  };

  const loadProprietarios = async () => {
    try {
      const response = await api.get('/proprietarios');
      setProprietarios(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar proprietários:', error);
    }
  };

  const openCreateModal = () => {
    setEditingImovel(null);
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'APARTAMENTO',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      valor: '',
      area: '',
      quartos: '',
      banheiros: '',
      vagas: '',
      status: 'DISPONIVEL',
      proprietario_id: '',
      fotos: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (imovel: Imovel) => {
    setEditingImovel(imovel);
    setFormData({
      titulo: imovel.titulo,
      descricao: imovel.descricao || '',
      tipo: imovel.tipo,
      endereco: imovel.endereco,
      cidade: imovel.cidade,
      estado: imovel.estado,
      cep: imovel.cep,
      valor: imovel.valor.toString(),
      area: imovel.area?.toString() || '',
      quartos: imovel.quartos?.toString() || '',
      banheiros: imovel.banheiros?.toString() || '',
      vagas: imovel.vagas?.toString() || '',
      status: imovel.status,
      proprietario_id: imovel.proprietario_id,
      fotos: imovel.fotos?.join('\n') || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        valor: parseFloat(formData.valor),
        area: formData.area ? parseFloat(formData.area) : undefined,
        quartos: formData.quartos ? parseInt(formData.quartos) : undefined,
        banheiros: formData.banheiros ? parseInt(formData.banheiros) : undefined,
        vagas: formData.vagas ? parseInt(formData.vagas) : undefined,
        fotos: formData.fotos ? formData.fotos.split('\n').filter(url => url.trim()) : [],
      };

      if (editingImovel) {
        await api.put(`/imoveis/${editingImovel.id}`, payload);
        toast.success('Imóvel atualizado com sucesso!');
      } else {
        await api.post('/imoveis', payload);
        toast.success('Imóvel cadastrado com sucesso!');
      }
      setModalOpen(false);
      loadImoveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar imóvel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingImovel) return;
    setSubmitting(true);

    try {
      await api.delete(`/imoveis/${deletingImovel.id}`);
      toast.success('Imóvel excluído com sucesso!');
      setDeleteModalOpen(false);
      setDeletingImovel(null);
      loadImoveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir imóvel');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredImoveis = imoveis.filter(
    (imovel) =>
      imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Imóveis</h2>
          <p className="text-sm text-gray-600 mt-1">{imoveis.length} imóveis cadastrados</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Novo Imóvel
        </button>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por título, endereço ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImoveis.length === 0 ? (
          <div className="col-span-full bg-white shadow rounded-lg p-12 text-center text-gray-500">
            {searchTerm ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}
          </div>
        ) : (
          filteredImoveis.map((imovel) => (
            <div key={imovel.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {imovel.fotos && imovel.fotos.length > 0 ? (
                  <img
                    src={imovel.fotos[0]}
                    alt={imovel.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-gray-400">Imagem indisponível</span>';
                    }}
                  />
                ) : (
                  <span className="text-gray-400">Sem imagem</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {imovel.titulo}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{imovel.tipo}</p>
                <p className="text-sm text-gray-600 mb-2">{imovel.endereco}</p>
                <p className="text-xs text-gray-500 mb-3">{imovel.cidade} - {imovel.estado}</p>

                <div className="flex gap-3 text-xs text-gray-600 mb-3">
                  {imovel.area && <span>{imovel.area}m²</span>}
                  {imovel.quartos && <span>{imovel.quartos} quartos</span>}
                  {imovel.banheiros && <span>{imovel.banheiros} banheiros</span>}
                  {imovel.vagas && <span>{imovel.vagas} vagas</span>}
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-blue-600">
                    R$ {Number(imovel.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    imovel.status === 'DISPONIVEL' ? 'bg-green-100 text-green-800' :
                    imovel.status === 'VENDIDO' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {imovel.status}
                  </span>
                </div>

                {imovel.proprietario && (
                  <p className="text-xs text-gray-500 mb-3">
                    Proprietário: {imovel.proprietario.nome}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(imovel)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setDeletingImovel(imovel);
                      setDeleteModalOpen(true);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingImovel ? 'Editar Imóvel' : 'Novo Imóvel'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="APARTAMENTO">Apartamento</option>
                <option value="CASA">Casa</option>
                <option value="TERRENO">Terreno</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="RURAL">Rural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="RESERVADO">Reservado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proprietário *
              </label>
              <select
                required
                value={formData.proprietario_id}
                onChange={(e) => setFormData({ ...formData, proprietario_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {proprietarios.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço *
              </label>
              <input
                type="text"
                required
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <input
                type="text"
                required
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="UF"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP *
              </label>
              <input
                type="text"
                required
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área (m²)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quartos
              </label>
              <input
                type="number"
                min="0"
                value={formData.quartos}
                onChange={(e) => setFormData({ ...formData, quartos: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banheiros
              </label>
              <input
                type="number"
                min="0"
                value={formData.banheiros}
                onChange={(e) => setFormData({ ...formData, banheiros: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vagas de Garagem
              </label>
              <input
                type="number"
                min="0"
                value={formData.vagas}
                onChange={(e) => setFormData({ ...formData, vagas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URLs das Fotos (uma por linha)
              </label>
              <textarea
                rows={4}
                value={formData.fotos}
                onChange={(e) => setFormData({ ...formData, fotos: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole URLs de imagens, uma por linha. Upload de arquivos será implementado futuramente.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja excluir o imóvel <strong>{deletingImovel?.titulo}</strong>?
          </p>
          <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Imóveis</h2>
          <p className="text-sm text-slate-300 mt-2 font-medium">
            <span className="text-blue-400 text-lg font-bold">{imoveis.length}</span> imóveis cadastrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 border-2 border-blue-500"
          style={{
            boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          + Novo Imóvel
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por título, endereço ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm text-base text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImoveis.length === 0 ? (
          <div className="col-span-full bg-slate-700 shadow-xl rounded-2xl p-12 text-center text-slate-400 border-2 border-slate-600">
            <div className="text-lg font-medium">{searchTerm ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}</div>
            <p className="text-sm text-slate-500 mt-2">Clique em &ldquo;+ Novo Imóvel&rdquo; para adicionar</p>
          </div>
        ) : (
          filteredImoveis.map((imovel) => (
            <div key={imovel.id} className="bg-slate-700 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-slate-600">
              <div className="h-56 bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center overflow-hidden relative">
                {imovel.fotos && imovel.fotos.length > 0 ? (
                  <img
                    src={imovel.fotos[0]}
                    alt={imovel.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="flex flex-col items-center justify-center h-full"><span class="text-6xl mb-2">🏠</span><span class="text-gray-500 font-semibold">Imagem indisponível</span></div>';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-7xl mb-3">🏠</span>
                    <span className="text-gray-500 font-semibold">Sem imagem</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 backdrop-blur-sm ${
                    imovel.status === 'DISPONIVEL' ? 'bg-green-100/90 text-green-800 border-green-300' :
                    imovel.status === 'VENDIDO' ? 'bg-gray-100/90 text-gray-800 border-gray-300' :
                    'bg-yellow-100/90 text-yellow-800 border-yellow-300'
                  }`}>
                    {imovel.status}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-slate-100 mb-1">
                    {imovel.titulo}
                  </h3>
                  <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider bg-blue-900/60 px-2 py-1 rounded-md inline-block border border-blue-500/50">{imovel.tipo}</p>
                </div>
                <p className="text-sm text-slate-200 mb-1 font-medium">📍 {imovel.endereco}</p>
                <p className="text-xs text-slate-400 mb-4">{imovel.cidade} - {imovel.estado}</p>

                <div className="flex flex-wrap gap-2 text-xs text-slate-200 mb-4">
                  {imovel.area && (
                    <span className="px-2 py-1 bg-slate-600 rounded-md font-bold border border-slate-500">📐 {imovel.area}m²</span>
                  )}
                  {imovel.quartos && (
                    <span className="px-2 py-1 bg-slate-600 rounded-md font-bold border border-slate-500">🛏️ {imovel.quartos} quartos</span>
                  )}
                  {imovel.banheiros && (
                    <span className="px-2 py-1 bg-slate-600 rounded-md font-bold border border-slate-500">🚿 {imovel.banheiros} banheiros</span>
                  )}
                  {imovel.vagas && (
                    <span className="px-2 py-1 bg-slate-600 rounded-md font-bold border border-slate-500">🚗 {imovel.vagas} vagas</span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-400">
                    R$ {Number(imovel.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {imovel.proprietario && (
                  <p className="text-xs text-slate-400 mb-4 font-medium">
                    👤 Proprietário: <span className="font-bold text-slate-200">{imovel.proprietario.nome}</span>
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(imovel)}
                    className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => {
                      setDeletingImovel(imovel);
                      setDeleteModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    🗑️ Excluir
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

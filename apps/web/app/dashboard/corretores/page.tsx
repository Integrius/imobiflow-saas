'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import EmptyState, { EmptyStateIcons } from '@/components/EmptyState';
import { formatPhone, unformatNumbers } from '@/lib/formatters';

interface Corretor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  creci: string;
  especialidade?: string;
  comissao?: number;
}

interface CorretorForm {
  nome: string;
  email: string;
  telefone: string;
  creci: string;
  especialidade: string;
  comissao: string;
}

interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  status: string;
  preco: number;
  fotoPrincipal: string | null;
  endereco: any;
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCorretor, setEditingCorretor] = useState<Corretor | null>(null);
  const [deletingCorretor, setDeletingCorretor] = useState<Corretor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dados' | 'imoveis'>('dados');
  const [corretorImoveis, setCorretorImoveis] = useState<Imovel[]>([]);
  const [loadingImoveis, setLoadingImoveis] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>(null);

  const [formData, setFormData] = useState<CorretorForm>({
    nome: '',
    email: '',
    telefone: '',
    creci: '',
    especialidade: '',
    comissao: '',
  });

  useEffect(() => {
    loadCorretores();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && modalOpen) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, modalOpen]);

  const loadCorretores = async () => {
    try {
      const response = await api.get('/corretores');
      setCorretores(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar corretores:', error);
      toast.error('Erro ao carregar corretores');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCorretor(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      creci: '',
      especialidade: '',
      comissao: '',
    });
    setOriginalFormData(null);
    setHasUnsavedChanges(false);
    setModalOpen(true);
  };

  const handleFormChange = (field: string, value: any) => {
    // Aplica formatação automática para telefone
    if (field === 'telefone') {
      value = formatPhone(value);
    }

    setFormData({ ...formData, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges && editingCorretor) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente sair sem salvar?')) {
        setModalOpen(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setModalOpen(false);
    }
  };

  const loadCorretorImoveis = async (corretorId: string) => {
    setLoadingImoveis(true);
    try {
      const response = await api.get(`/corretores/${corretorId}/imoveis`);
      setCorretorImoveis(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar imóveis do corretor:', error);
      toast.error('Erro ao carregar imóveis');
      setCorretorImoveis([]);
    } finally {
      setLoadingImoveis(false);
    }
  };

  const openEditModal = (corretor: Corretor) => {
    setEditingCorretor(corretor);
    const formDataToSet = {
      nome: corretor.nome,
      email: corretor.email,
      telefone: formatPhone(corretor.telefone),
      creci: corretor.creci,
      especialidade: corretor.especialidade || '',
      comissao: corretor.comissao?.toString() || '',
    };
    setFormData(formDataToSet);
    setOriginalFormData({ ...formDataToSet });
    setHasUnsavedChanges(false);
    setActiveTab('dados');
    setCorretorImoveis([]);
    setModalOpen(true);
    loadCorretorImoveis(corretor.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Remove formatação do telefone antes de enviar
      const payload = {
        ...formData,
        telefone: unformatNumbers(formData.telefone),
        comissao: formData.comissao ? parseFloat(formData.comissao) : undefined,
      };

      if (editingCorretor) {
        await api.put(`/corretores/${editingCorretor.id}`, payload);
        toast.success('Corretor atualizado com sucesso!');
      } else {
        await api.post('/corretores', payload);
        toast.success('Corretor cadastrado com sucesso!');
      }
      setHasUnsavedChanges(false);
      setModalOpen(false);
      loadCorretores();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar corretor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCorretor) return;
    setSubmitting(true);

    try {
      await api.delete(`/corretores/${deletingCorretor.id}`);
      toast.success('Corretor excluído com sucesso!');
      setDeleteModalOpen(false);
      setDeletingCorretor(null);
      loadCorretores();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir corretor');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCorretores = corretores.filter(
    (corretor) =>
      corretor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corretor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corretor.creci.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD14F]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-[#2C2C2C] tracking-tight">Corretores</h2>
          <p className="text-sm text-[#8B7F76] mt-2 font-medium">
            <span className="text-[#7FB344] text-lg font-bold">{corretores.length}</span> corretores cadastrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 btn-primary"
          style={{
            boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          + Novo Corretor
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por nome, email ou CRECI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-modern"
        />
      </div>

      {/* Tabela */}
      <div className="card-warm shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-600">
          <thead className="bg-gradient-to-r from-[#A97E6F] to-[#8B6F5C]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">CRECI</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Comissão</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[rgba(169,126,111,0.1)]">
            {filteredCorretores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4">
                  <EmptyState
                    icon={EmptyStateIcons.UserGroup}
                    title={searchTerm ? 'Nenhum corretor encontrado' : 'Nenhum corretor cadastrado'}
                    description={searchTerm
                      ? 'Tente ajustar os filtros de busca ou limpar a pesquisa.'
                      : 'Comece adicionando seu primeiro corretor à equipe. Eles poderão gerenciar leads e imóveis.'
                    }
                    actionLabel={!searchTerm ? 'Novo Corretor' : undefined}
                    onAction={!searchTerm ? openCreateModal : undefined}
                  />
                </td>
              </tr>
            ) : (
              filteredCorretores.map((corretor, index) => (
                <tr key={corretor.id} className={`hover:bg-[#F4E2CE] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-white/70'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#2C2C2C]">
                    {corretor.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8B7F76]">{corretor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8B7F76]">
                    <span className="px-2 py-1 bg-blue-900/60 text-blue-200 rounded-md font-mono text-xs font-bold border border-blue-500/50">{corretor.creci}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8B7F76] font-medium">{formatPhone(corretor.telefone)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8B7F76]">
                    {corretor.comissao ? (
                      <span className="px-3 py-1 bg-green-900/60 text-green-200 rounded-full font-bold text-xs border-2 border-green-500/50">
                        {corretor.comissao}%
                      </span>
                    ) : (
                      <span className="text-[#8B7F76]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(corretor)}
                      className="text-[#7FB344] hover:text-[#006D77] mr-4 font-bold hover:underline transition-all"
                    >
                      👁️ Consultar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCorretor(corretor);
                        setDeleteModalOpen(true);
                      }}
                      className="text-[#FF6B6B] hover:text-[#FF006E] font-bold hover:underline transition-all"
                    >
                      🗑️ Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingCorretor ? 'Consultar Corretor' : 'Novo Corretor'}
        size="lg"
      >
        {/* Abas - apenas quando editando */}
        {editingCorretor && (
          <div className="flex border-b border-[rgba(169,126,111,0.3)] mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('dados')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'dados'
                  ? 'border-b-4 border-[#8FD14F] text-[#8FD14F]'
                  : 'text-[#8B7F76] hover:text-[#7FB344]'
              }`}
            >
              📋 Dados
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('imoveis')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'imoveis'
                  ? 'border-b-4 border-[#8FD14F] text-[#8FD14F]'
                  : 'text-[#8B7F76] hover:text-[#7FB344]'
              }`}
            >
              🏘️ Imóveis ({corretorImoveis.length})
            </button>
          </div>
        )}

        {/* Conteúdo da aba Dados */}
        {activeTab === 'dados' && (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => handleFormChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                required
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) => handleFormChange('telefone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2">
                CRECI *
              </label>
              <input
                type="text"
                required
                value={formData.creci}
                onChange={(e) => handleFormChange('creci', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2">
                Comissão (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.comissao}
                onChange={(e) => handleFormChange('comissao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2">
                Especialidade
              </label>
              <input
                type="text"
                value={formData.especialidade}
                onChange={(e) => handleFormChange('especialidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Imóveis comerciais, Apartamentos de luxo..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[rgba(169,126,111,0.2)] mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 text-[#A97E6F] border-2 border-[#A97E6F] rounded-lg hover:bg-[#A97E6F] hover:text-white font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#8FD14F] to-[#006D77] text-white rounded-lg hover:shadow-lg font-bold transition-all disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
        )}

        {/* Conteúdo da aba Imóveis */}
        {activeTab === 'imoveis' && editingCorretor && (
          <div className="space-y-4">
            {loadingImoveis ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD14F]"></div>
              </div>
            ) : corretorImoveis.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#8B7F76] text-lg">Nenhum imóvel sob responsabilidade deste corretor</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {corretorImoveis.map((imovel) => (
                  <div
                    key={imovel.id}
                    className="flex gap-4 p-4 border-2 border-[rgba(169,126,111,0.2)] rounded-lg hover:border-[#8FD14F] hover:shadow-lg transition-all bg-white"
                  >
                    {/* Foto */}
                    {imovel.fotoPrincipal ? (
                      <img
                        src={imovel.fotoPrincipal}
                        alt={imovel.titulo}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-4xl">🏘️</span>
                      </div>
                    )}

                    {/* Informações */}
                    <div className="flex-1">
                      <h4 className="font-bold text-[#2C2C2C] text-lg">{imovel.titulo}</h4>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="px-2 py-1 bg-[#A97E6F]/20 text-[#A97E6F] rounded-md font-bold">
                          {imovel.tipo}
                        </span>
                        <span className={`px-2 py-1 rounded-md font-bold ${
                          imovel.status === 'DISPONIVEL'
                            ? 'bg-[#8FD14F]/20 text-[#4A6B29]'
                            : imovel.status === 'RESERVADO'
                            ? 'bg-[#FFB627]/20 text-[#FFB627]'
                            : 'bg-[#FF6B6B]/20 text-[#FF006E]'
                        }`}>
                          {imovel.status}
                        </span>
                      </div>
                      <p className="text-[#8FD14F] font-bold text-xl mt-2">
                        R$ {imovel.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {imovel.endereco && (
                        <p className="text-[#8B7F76] text-sm mt-1">
                          📍 {imovel.endereco.cidade}, {imovel.endereco.estado}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[#2C2C2C] text-base">
            Tem certeza que deseja excluir o corretor <strong className="text-[#A97E6F]">{deletingCorretor?.nome}</strong>?
          </p>
          <p className="text-sm text-[#8B7F76]">Esta ação não pode ser desfeita.</p>

          <div className="flex justify-end gap-3 pt-6 border-t border-[rgba(169,126,111,0.2)] mt-6">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-6 py-2.5 text-[#A97E6F] border-2 border-[#A97E6F] rounded-lg hover:bg-[#A97E6F] hover:text-white font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF006E] font-bold transition-all disabled:opacity-50"
            >
              {submitting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

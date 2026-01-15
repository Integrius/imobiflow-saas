'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import EmptyState, { EmptyStateIcons } from '@/components/EmptyState';
import CorretorStatusLed from '@/components/CorretorStatusLed';
import { formatPhone, unformatNumbers } from '@/lib/formatters';

interface Corretor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  creci: string;
  especialidade?: string;
  comissao?: number;
  ativo?: boolean;
  primeiro_acesso?: boolean;
  status_conta?: 'ATIVO' | 'SUSPENSO' | 'CANCELADO';
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

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  temperatura: 'QUENTE' | 'MORNO' | 'FRIO';
  origem?: string;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<'dados' | 'imoveis' | 'clientes'>('dados');
  const [corretorImoveis, setCorretorImoveis] = useState<Imovel[]>([]);
  const [loadingImoveis, setLoadingImoveis] = useState(false);
  const [corretorLeads, setCorretorLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>(null);

  // Estados para cálculo de comissões
  const [selectedCorretores, setSelectedCorretores] = useState<string[]>([]);
  const [comissoesModalOpen, setComissoesModalOpen] = useState(false);
  const [comissoesData, setComissoesData] = useState<any>(null);
  const [loadingComissoes, setLoadingComissoes] = useState(false);

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

  const loadCorretorLeads = async (corretorId: string) => {
    setLoadingLeads(true);
    try {
      const response = await api.get(`/leads?corretor_id=${corretorId}`);
      setCorretorLeads(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar leads do corretor:', error);
      toast.error('Erro ao carregar leads');
      setCorretorLeads([]);
    } finally {
      setLoadingLeads(false);
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
    setCorretorLeads([]);
    setModalOpen(true);
    loadCorretorImoveis(corretor.id);
    loadCorretorLeads(corretor.id);
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

  // Funções de seleção de corretores
  const toggleCorretorSelection = (corretorId: string) => {
    setSelectedCorretores(prev =>
      prev.includes(corretorId)
        ? prev.filter(id => id !== corretorId)
        : [...prev, corretorId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCorretores.length === filteredCorretores.length) {
      setSelectedCorretores([]);
    } else {
      setSelectedCorretores(filteredCorretores.map(c => c.id));
    }
  };

  // Função para calcular comissões
  const calcularComissoes = async () => {
    if (selectedCorretores.length === 0) {
      toast.error('Selecione pelo menos um corretor');
      return;
    }

    try {
      setLoadingComissoes(true);
      const response = await api.post('/comissoes/calcular', {
        corretor_ids: selectedCorretores
      });

      setComissoesData(response.data);
      setComissoesModalOpen(true);
    } catch (error: any) {
      console.error('Erro ao calcular comissões:', error);
      toast.error(error.response?.data?.error || 'Erro ao calcular comissões');
    } finally {
      setLoadingComissoes(false);
    }
  };

  // Função para ativar corretor(es)
  const ativarCorretores = async () => {
    if (selectedCorretores.length === 0) {
      toast.error('Selecione pelo menos um corretor');
      return;
    }

    if (!confirm(`Deseja ativar ${selectedCorretores.length} corretor(es)?`)) {
      return;
    }

    try {
      await api.patch('/corretores/bulk-status', {
        corretor_ids: selectedCorretores,
        status: 'ATIVO',
        ativo: true
      });

      toast.success(`${selectedCorretores.length} corretor(es) ativado(s) com sucesso`);
      loadCorretores();
      setSelectedCorretores([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao ativar corretores');
    }
  };

  // Função para suspender corretor(es)
  const suspenderCorretores = async () => {
    if (selectedCorretores.length === 0) {
      toast.error('Selecione pelo menos um corretor');
      return;
    }

    if (!confirm(`Deseja suspender ${selectedCorretores.length} corretor(es)? Eles não poderão fazer login.`)) {
      return;
    }

    try {
      await api.patch('/corretores/bulk-status', {
        corretor_ids: selectedCorretores,
        status: 'SUSPENSO',
        ativo: false
      });

      toast.success(`${selectedCorretores.length} corretor(es) suspenso(s) com sucesso`);
      loadCorretores();
      setSelectedCorretores([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao suspender corretores');
    }
  };

  // Função para cancelar corretor(es)
  const cancelarCorretores = async () => {
    if (selectedCorretores.length === 0) {
      toast.error('Selecione pelo menos um corretor');
      return;
    }

    if (!confirm(`ATENÇÃO: Deseja cancelar ${selectedCorretores.length} corretor(es)? Isso bloqueará o acesso permanentemente.`)) {
      return;
    }

    try {
      await api.patch('/corretores/bulk-status', {
        corretor_ids: selectedCorretores,
        status: 'CANCELADO',
        ativo: false
      });

      toast.success(`${selectedCorretores.length} corretor(es) cancelado(s) com sucesso`);
      loadCorretores();
      setSelectedCorretores([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cancelar corretores');
    }
  };

  // Função para reenviar credenciais
  const reenviarCredenciais = async () => {
    if (selectedCorretores.length === 0) {
      toast.error('Selecione pelo menos um corretor');
      return;
    }

    if (!confirm(`Deseja reenviar email e WhatsApp de boas-vindas para ${selectedCorretores.length} corretor(es)?`)) {
      return;
    }

    try {
      await api.post('/corretores/bulk-resend-credentials', {
        corretor_ids: selectedCorretores
      });

      toast.success(`Credenciais reenviadas para ${selectedCorretores.length} corretor(es)`);
      setSelectedCorretores([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao reenviar credenciais');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-4xl font-bold text-[#064E3B] tracking-tight">Corretores</h2>
            <p className="text-sm text-[#4B5563] mt-2 font-medium">
              <span className="text-[#00C48C] text-lg font-bold">{corretores.length}</span> corretores cadastrados
            </p>
          </div>
        </div>

        {/* Painel de Controle */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border-2 border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Painel de Controle</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Botão: Ativar */}
            <button
              onClick={ativarCorretores}
              disabled={selectedCorretores.length === 0}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#00C48C] to-[#00A374] text-white hover:scale-105'
              }`}
              style={{
                boxShadow: selectedCorretores.length > 0
                  ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
                  : 'none'
              }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                Ativar {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}
              </span>
            </button>

            {/* Botão: Suspender */}
            <button
              onClick={suspenderCorretores}
              disabled={selectedCorretores.length === 0}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF9500] to-[#FF7A00] text-white hover:scale-105'
              }`}
              style={{
                boxShadow: selectedCorretores.length > 0
                  ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
                  : 'none'
              }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 ring-2 ring-white"></span>
                Suspender {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}
              </span>
            </button>

            {/* Botão: Cancelar */}
            <button
              onClick={cancelarCorretores}
              disabled={selectedCorretores.length === 0}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white hover:scale-105'
              }`}
              style={{
                boxShadow: selectedCorretores.length > 0
                  ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
                  : 'none'
              }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-white"></span>
                Cancelar {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}
              </span>
            </button>

            {/* Botão: Reenviar Credenciais */}
            <button
              onClick={reenviarCredenciais}
              disabled={selectedCorretores.length === 0}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#059669] to-[#047857] text-white hover:scale-105'
              }`}
              style={{
                boxShadow: selectedCorretores.length > 0
                  ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
                  : 'none'
              }}
            >
              📧 Reenviar {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}
            </button>

            {/* Botão: Calcular Comissões */}
            <button
              onClick={calcularComissoes}
              disabled={selectedCorretores.length === 0 || loadingComissoes}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0 || loadingComissoes
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FFB627] to-[#FF9500] text-white hover:scale-105'
              }`}
              style={{
                boxShadow: selectedCorretores.length > 0 && !loadingComissoes
                  ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
                  : 'none'
              }}
            >
              {loadingComissoes ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Calculando...
                </span>
              ) : (
                <>💰 Comissões {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}</>
              )}
            </button>

            {/* Botão: Novo Corretor */}
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 btn-primary text-sm"
              style={{
                boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              + Novo Corretor
            </button>
          </div>
        </div>
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
      <div className="card-clean shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-600">
          <thead className="bg-gradient-to-r from-[#059669] to-[#059669]">
            <tr>
              <th className="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={selectedCorretores.length === filteredCorretores.length && filteredCorretores.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-[#00C48C] bg-white border-gray-300 rounded focus:ring-[#00C48C] cursor-pointer"
                />
              </th>
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
                <td colSpan={7} className="px-6 py-4">
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
                <tr key={corretor.id} className={`hover:bg-[#F9FAFB] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-white/70'}`}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCorretores.includes(corretor.id)}
                      onChange={() => toggleCorretorSelection(corretor.id)}
                      className="w-5 h-5 text-[#00C48C] bg-gray-100 border-gray-300 rounded focus:ring-[#00C48C] cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#064E3B]">
                    <div className="flex items-center gap-3">
                      <CorretorStatusLed
                        ativo={corretor.ativo ?? true}
                        primeiroAcesso={corretor.primeiro_acesso ?? false}
                        statusConta={corretor.status_conta}
                      />
                      <span>{corretor.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{corretor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                    <span className="px-2 py-1 bg-[#059669]/20 text-[#059669] rounded-md font-mono text-xs font-bold border border-[#059669]/50">{corretor.creci}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563] font-medium">{formatPhone(corretor.telefone)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                    {corretor.comissao ? (
                      <span className="px-3 py-1 bg-[#00C48C]/20 text-[#00C48C] rounded-full font-bold text-xs border-2 border-[#00C48C]/50">
                        {corretor.comissao}%
                      </span>
                    ) : (
                      <span className="text-[#4B5563]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(corretor)}
                      className="text-[#00C48C] hover:text-[#059669] mr-4 font-bold hover:underline transition-all"
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
        {/* Resumo de Vinculações - apenas quando editando */}
        {editingCorretor && (
          <div className="bg-gradient-to-r from-[#F0FDF4] to-[#EFF6FF] p-4 rounded-lg border-2 border-[#00C48C]/30 mb-6">
            <div className="flex items-center gap-4 justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00C48C]">{corretorLeads.length}</div>
                <div className="text-xs text-[#4B5563] font-medium">Clientes</div>
              </div>
              <div className="h-10 w-px bg-[#00C48C]/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#059669]">{corretorImoveis.length}</div>
                <div className="text-xs text-[#4B5563] font-medium">Imóveis</div>
              </div>
            </div>
          </div>
        )}

        {/* Abas - apenas quando editando */}
        {editingCorretor && (
          <div className="flex border-b border-gray-300 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('dados')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'dados'
                  ? 'border-b-4 border-[#00C48C] text-[#00C48C]'
                  : 'text-[#4B5563] hover:text-[#00C48C]'
              }`}
            >
              📋 Dados
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('imoveis')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'imoveis'
                  ? 'border-b-4 border-[#00C48C] text-[#00C48C]'
                  : 'text-[#4B5563] hover:text-[#00C48C]'
              }`}
            >
              🏘️ Imóveis ({corretorImoveis.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clientes')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'clientes'
                  ? 'border-b-4 border-[#00C48C] text-[#00C48C]'
                  : 'text-[#4B5563] hover:text-[#00C48C]'
              }`}
            >
              👥 Clientes ({corretorLeads.length})
            </button>
          </div>
        )}

        {/* Conteúdo da aba Dados */}
        {activeTab === 'dados' && (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => handleFormChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                required
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) => handleFormChange('telefone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                CRECI *
              </label>
              <input
                type="text"
                required
                value={formData.creci}
                onChange={(e) => handleFormChange('creci', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                Comissão (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.comissao}
                onChange={(e) => handleFormChange('comissao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                Especialidade
              </label>
              <input
                type="text"
                value={formData.especialidade}
                onChange={(e) => handleFormChange('especialidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                placeholder="Ex: Imóveis comerciais, Apartamentos de luxo..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 text-[#059669] border-2 border-[#059669] rounded-lg hover:bg-[#059669] hover:text-white font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#00C48C] to-[#059669] text-white rounded-lg hover:shadow-lg font-bold transition-all disabled:opacity-50"
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C]"></div>
              </div>
            ) : corretorImoveis.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#4B5563] text-lg">Nenhum imóvel sob responsabilidade deste corretor</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {corretorImoveis.map((imovel) => (
                  <div
                    key={imovel.id}
                    className="flex gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#00C48C] hover:shadow-lg transition-all bg-white"
                  >
                    {/* Foto */}
                    {imovel.fotoPrincipal ? (
                      <img
                        src={imovel.fotoPrincipal}
                        alt={imovel.titulo}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-[#F9FAFB] rounded-lg flex items-center justify-center border-2 border-[#059669]/20">
                        <span className="text-4xl">🏘️</span>
                      </div>
                    )}

                    {/* Informações */}
                    <div className="flex-1">
                      <h4 className="font-bold text-[#064E3B] text-lg">{imovel.titulo}</h4>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="px-2 py-1 bg-[#059669]/20 text-[#059669] rounded-md font-bold">
                          {imovel.tipo}
                        </span>
                        <span className={`px-2 py-1 rounded-md font-bold ${
                          imovel.status === 'DISPONIVEL'
                            ? 'bg-[#00C48C]/20 text-[#4A6B29]'
                            : imovel.status === 'RESERVADO'
                            ? 'bg-[#FFB627]/20 text-[#FFB627]'
                            : 'bg-[#FF6B6B]/20 text-[#FF006E]'
                        }`}>
                          {imovel.status}
                        </span>
                      </div>
                      <p className="text-[#00C48C] font-bold text-xl mt-2">
                        R$ {imovel.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {imovel.endereco && (
                        <p className="text-[#4B5563] text-sm mt-1">
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

        {/* Conteúdo da aba Clientes */}
        {activeTab === 'clientes' && editingCorretor && (
          <div className="space-y-4">
            {loadingLeads ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C]"></div>
              </div>
            ) : corretorLeads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#4B5563] text-lg">Nenhum cliente vinculado a este corretor</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {corretorLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#00C48C] hover:shadow-lg transition-all bg-white"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#00C48C] to-[#4A6B29] rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {lead.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-[#064E3B] text-lg">{lead.nome}</h4>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          lead.temperatura === 'QUENTE'
                            ? 'bg-[#FF6B6B]/20 text-[#FF006E]'
                            : lead.temperatura === 'MORNO'
                            ? 'bg-[#FFB627]/20 text-[#FFB627]'
                            : 'bg-[#059669]/20 text-[#059669]'
                        }`}>
                          {lead.temperatura === 'QUENTE' ? '🔥 QUENTE' : lead.temperatura === 'MORNO' ? '🌡️ MORNO' : '❄️ FRIO'}
                        </span>
                      </div>

                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[#4B5563]">📧</span>
                          <span className="text-[#4B5563] text-sm">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#4B5563]">📱</span>
                          <span className="text-[#4B5563] text-sm">{lead.telefone}</span>
                        </div>
                      </div>

                      {lead.origem && (
                        <p className="text-[#4B5563] text-xs mt-2">
                          📍 Origem: {lead.origem}
                        </p>
                      )}

                      <p className="text-[#9CA3AF] text-xs mt-1">
                        ⏰ Cadastrado em: {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </p>
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
          <p className="text-[#064E3B] text-base">
            Tem certeza que deseja excluir o corretor <strong className="text-[#059669]">{deletingCorretor?.nome}</strong>?
          </p>
          <p className="text-sm text-[#4B5563]">Esta ação não pode ser desfeita.</p>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-6 py-2.5 text-[#059669] border-2 border-[#059669] rounded-lg hover:bg-[#059669] hover:text-white font-bold transition-all"
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

      {/* Modal de Resultados de Comissões */}
      <Modal
        isOpen={comissoesModalOpen}
        onClose={() => {
          setComissoesModalOpen(false);
          setComissoesData(null);
        }}
        title="💰 Relatório de Comissões"
      >
        {comissoesData && (
          <div className="space-y-6">
            {/* Resumo Geral */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#00C48C]/10 to-[#00C48C]/5 border-2 border-[#00C48C]/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-600 font-semibold mb-1">Corretores</p>
                <p className="text-2xl font-bold text-[#00C48C]">{comissoesData.total_corretores}</p>
              </div>
              <div className="bg-gradient-to-br from-[#059669]/10 to-[#059669]/5 border-2 border-[#059669]/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-600 font-semibold mb-1">Negociações</p>
                <p className="text-2xl font-bold text-[#059669]">{comissoesData.total_negociacoes}</p>
              </div>
              <div className="bg-gradient-to-br from-[#FFB627]/10 to-[#FFB627]/5 border-2 border-[#FFB627]/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-600 font-semibold mb-1">Total Comissões</p>
                <p className="text-2xl font-bold text-[#FFB627]">
                  R$ {comissoesData.comissoes.reduce((sum: number, c: any) => sum + c.total_comissao, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Lista de Comissões por Corretor */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {comissoesData.comissoes.map((corretor: any) => (
                <div key={corretor.corretor_id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#00C48C]/50 transition-colors">
                  {/* Header do Corretor */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{corretor.corretor_nome}</h3>
                      <p className="text-xs text-gray-500">{corretor.corretor_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold">Total Comissão</p>
                      <p className="text-xl font-bold text-[#FFB627]">
                        R$ {corretor.total_comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Stats do Corretor */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600">Total em Vendas</p>
                      <p className="text-sm font-bold text-gray-900">
                        R$ {corretor.total_vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center">
                      <p className="text-xs text-gray-600">Negociações Fechadas</p>
                      <p className="text-sm font-bold text-gray-900">{corretor.negociacoes.length}</p>
                    </div>
                  </div>

                  {/* Lista de Negociações */}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-[#00C48C] hover:text-[#059669]">
                      Ver {corretor.negociacoes.length} negociação(ões) →
                    </summary>
                    <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
                      {corretor.negociacoes.map((neg: any) => (
                        <div key={neg.id} className="text-xs bg-gray-50 rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[#059669] font-bold">{neg.codigo}</span>
                            <span className="text-gray-500">
                              {new Date(neg.data_fechamento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900">{neg.imovel_titulo}</p>
                          <p className="text-gray-600">Cliente: {neg.lead_nome}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-700">Valor: <strong>R$ {neg.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                            <span className="text-[#FFB627] font-bold">Comissão: R$ {neg.valor_comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>

            {/* Botão Fechar */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setComissoesModalOpen(false);
                  setComissoesData(null);
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

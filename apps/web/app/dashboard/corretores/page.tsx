'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import EmptyState, { EmptyStateIcons } from '@/components/EmptyState';
import CorretorStatusLed from '@/components/CorretorStatusLed';
import { formatPhone, unformatNumbers } from '@/lib/formatters';
import {
  Mail,
  Coins,
  Search,
  Crown,
  ClipboardList,
  Home,
  Eye,
  Trash2,
  Building2,
  Users,
  MapPin,
  Flame,
  Thermometer,
  Snowflake,
  Smartphone,
  Clock,
  DollarSign,
} from 'lucide-react';

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
  tipo?: 'ADMIN' | 'GESTOR' | 'CORRETOR';
}

interface CorretorForm {
  nome: string;
  email: string;
  telefone: string;
  creci: string;
  especialidade: string;
  comissao: string;
  tipo: 'ADMIN' | 'GESTOR' | 'CORRETOR';
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
    tipo: 'CORRETOR',
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
      tipo: 'CORRETOR',
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
      tipo: corretor.tipo || 'CORRETOR',
    };
    setFormData(formDataToSet as CorretorForm);
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
        tipo: formData.tipo,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-content tracking-tight">Corretores</h2>
            <p className="text-sm text-content-secondary mt-1 font-medium">
              <span className="text-brand text-lg font-bold">{corretores.length}</span> corretores cadastrados
            </p>
          </div>
        </div>

        {/* Painel de Controle */}
        <div className="bg-surface-secondary rounded-xl p-4 border border-edge-light">
          <h3 className="text-sm font-bold text-content-secondary uppercase tracking-wide mb-3">Painel de Controle</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Botão: Ativar */}
            <button
              onClick={ativarCorretores}
              disabled={selectedCorretores.length === 0}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0
                  ? 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
                  : 'bg-brand hover:bg-brand/90 text-white hover:scale-105'
              }`}
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
                  ? 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-300 ring-2 ring-white"></span>
                Suspender {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}
              </span>
            </button>

            {/* Botão: Cancelar */}
            <button
              onClick={cancelarCorretores}
              disabled={selectedCorretores.length === 0}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0
                  ? 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-300 ring-2 ring-white"></span>
                Cancelar {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}
              </span>
            </button>

            {/* Botão: Reenviar Credenciais */}
            <button
              onClick={reenviarCredenciais}
              disabled={selectedCorretores.length === 0}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0
                  ? 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
                  : 'bg-brand hover:bg-brand/90 text-white hover:scale-105'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5"><Mail className="w-4 h-4" /> Reenviar {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}</span>
            </button>

            {/* Botão: Calcular Comissões */}
            <button
              onClick={calcularComissoes}
              disabled={selectedCorretores.length === 0 || loadingComissoes}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                selectedCorretores.length === 0 || loadingComissoes
                  ? 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105'
              }`}
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
                <><DollarSign className="w-4 h-4 inline mr-1" /> Comissões {selectedCorretores.length > 0 && `(${selectedCorretores.length})`}</>
              )}
            </button>

            {/* Botão: Novo Corretor */}
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 btn-primary text-sm"
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
          placeholder="Buscar por nome, email ou CRECI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 border border-edge rounded-lg text-sm font-medium text-content bg-surface placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {/* Tabela */}
      <div className="bg-surface rounded-xl border-2 border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-edge">
          <thead className="bg-surface-tertiary">
            <tr>
              <th className="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={selectedCorretores.length === filteredCorretores.length && filteredCorretores.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-brand bg-surface border-edge rounded focus:ring-brand/30 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-content uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-content uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-content uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-content uppercase tracking-wider">CRECI</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-content uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-content uppercase tracking-wider">Comissão</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-content uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-edge-light">
            {filteredCorretores.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4">
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
                <tr key={corretor.id} className={`hover:bg-surface-secondary transition-colors ${index % 2 === 0 ? 'bg-surface' : 'bg-surface/70'}`}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCorretores.includes(corretor.id)}
                      onChange={() => toggleCorretorSelection(corretor.id)}
                      className="w-5 h-5 text-brand bg-surface-secondary border-edge rounded focus:ring-brand/30 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-content">
                    <div className="flex items-center gap-3">
                      <CorretorStatusLed
                        ativo={corretor.ativo ?? true}
                        primeiroAcesso={corretor.primeiro_acesso ?? false}
                        statusConta={corretor.status_conta}
                      />
                      <span>{corretor.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      corretor.tipo === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : corretor.tipo === 'GESTOR'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-surface-tertiary text-content-secondary border border-edge'
                    }`}>
                      {corretor.tipo === 'ADMIN' ? 'Admin' : corretor.tipo === 'GESTOR' ? 'Gestor' : 'Corretor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary font-medium">{corretor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                    <span className="px-2 py-1 bg-brand-light text-brand rounded-md font-mono text-xs font-bold border border-brand/30">{corretor.creci}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary font-semibold">{formatPhone(corretor.telefone)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                    {corretor.comissao ? (
                      <span className="px-3 py-1 bg-brand-light text-brand rounded-full font-bold text-xs border border-brand/30">
                        {corretor.comissao}%
                      </span>
                    ) : (
                      <span className="text-content-tertiary font-medium">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(corretor)}
                      className="text-brand hover:text-brand/80 mr-4 font-bold hover:underline transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-0.5" /> Consultar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCorretor(corretor);
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 font-bold hover:underline transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline mr-0.5" /> Excluir
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
          <div className="bg-surface-secondary p-4 rounded-lg border border-edge-light mb-6">
            <div className="flex items-center gap-4 justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand">{corretorLeads.length}</div>
                <div className="text-xs text-content-secondary font-medium">Clientes</div>
              </div>
              <div className="h-10 w-px bg-edge"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand">{corretorImoveis.length}</div>
                <div className="text-xs text-content-secondary font-medium">Imóveis</div>
              </div>
            </div>
          </div>
        )}

        {/* Abas - apenas quando editando */}
        {editingCorretor && (
          <div className="flex border-b border-edge mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('dados')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'dados'
                  ? 'border-b-4 border-brand text-brand'
                  : 'text-content-tertiary hover:text-brand'
              }`}
            >
              <ClipboardList className="w-4 h-4 inline mr-1" /> Dados
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('imoveis')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'imoveis'
                  ? 'border-b-4 border-brand text-brand'
                  : 'text-content-tertiary hover:text-brand'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-1" /> Imóveis ({corretorImoveis.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clientes')}
              className={`px-6 py-3 font-bold transition-all ${
                activeTab === 'clientes'
                  ? 'border-b-4 border-brand text-brand'
                  : 'text-content-tertiary hover:text-brand'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" /> Clientes ({corretorLeads.length})
            </button>
          </div>
        )}

        {/* Conteúdo da aba Dados */}
        {activeTab === 'dados' && (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-content mb-2">
                Categoria *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => handleFormChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
              >
                <option value="CORRETOR">Corretor</option>
                <option value="GESTOR">Gestor</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <p className="text-xs text-content-tertiary mt-1">
                {formData.tipo === 'CORRETOR' && 'Acesso apenas aos próprios leads e imóveis'}
                {formData.tipo === 'GESTOR' && 'Pode gerenciar corretores e ver todos os dados'}
                {formData.tipo === 'ADMIN' && 'Acesso total ao sistema, incluindo configurações'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-content mb-2">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => handleFormChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-content mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-content mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                required
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) => handleFormChange('telefone', e.target.value)}
                className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-content mb-2">
                CRECI *
              </label>
              <input
                type="text"
                required
                value={formData.creci}
                onChange={(e) => handleFormChange('creci', e.target.value)}
                className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-content mb-2">
                Comissão (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.comissao}
                onChange={(e) => handleFormChange('comissao', e.target.value)}
                className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-content mb-2">
                Especialidade
              </label>
              <input
                type="text"
                value={formData.especialidade}
                onChange={(e) => handleFormChange('especialidade', e.target.value)}
                className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                placeholder="Ex: Imóveis comerciais, Apartamentos de luxo..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-edge mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 text-content-secondary border border-edge rounded-lg hover:bg-surface-secondary font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-bold transition-all disabled:opacity-50"
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
              </div>
            ) : corretorImoveis.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-content-secondary text-lg">Nenhum imóvel sob responsabilidade deste corretor</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {corretorImoveis.map((imovel) => (
                  <div
                    key={imovel.id}
                    className="flex gap-4 p-4 border border-edge-light rounded-lg hover:border-brand/30 hover:bg-surface-secondary transition-all bg-surface"
                  >
                    {/* Foto */}
                    {imovel.fotoPrincipal ? (
                      <img
                        src={imovel.fotoPrincipal}
                        alt={imovel.titulo}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-surface-tertiary rounded-lg flex items-center justify-center border border-edge-light">
                        <Building2 className="w-10 h-10 text-content-tertiary" />
                      </div>
                    )}

                    {/* Informações */}
                    <div className="flex-1">
                      <h4 className="font-bold text-content text-lg">{imovel.titulo}</h4>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="px-2 py-1 bg-brand-light text-brand rounded-md font-bold">
                          {imovel.tipo}
                        </span>
                        <span className={`px-2 py-1 rounded-md font-bold ${
                          imovel.status === 'DISPONIVEL'
                            ? 'bg-emerald-100 text-emerald-700'
                            : imovel.status === 'RESERVADO'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {imovel.status}
                        </span>
                      </div>
                      <p className="text-brand font-bold text-xl mt-2">
                        R$ {imovel.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {imovel.endereco && (
                        <p className="text-content-secondary text-sm mt-1">
                          <MapPin className="w-3.5 h-3.5 inline mr-0.5" /> {imovel.endereco.cidade}, {imovel.endereco.estado}
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
              </div>
            ) : corretorLeads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-content-secondary text-lg">Nenhum cliente vinculado a este corretor</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {corretorLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex gap-4 p-4 border border-edge-light rounded-lg hover:border-brand/30 hover:bg-surface-secondary transition-all bg-surface"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {lead.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-content text-lg">{lead.nome}</h4>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          lead.temperatura === 'QUENTE'
                            ? 'bg-red-100 text-red-700'
                            : lead.temperatura === 'MORNO'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {lead.temperatura}
                        </span>
                      </div>

                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-content-tertiary" />
                          <span className="text-content-secondary text-sm">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-3.5 h-3.5 text-content-tertiary" />
                          <span className="text-content-secondary text-sm">{lead.telefone}</span>
                        </div>
                      </div>

                      {lead.origem && (
                        <p className="text-content-secondary text-xs mt-2">
                          <MapPin className="w-3.5 h-3.5 inline mr-0.5" /> Origem: {lead.origem}
                        </p>
                      )}

                      <p className="text-content-tertiary text-xs mt-1">
                        Cadastrado em: {new Date(lead.created_at).toLocaleDateString('pt-BR')}
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
          <p className="text-content text-base">
            Tem certeza que deseja excluir o corretor <strong className="text-brand">{deletingCorretor?.nome}</strong>?
          </p>
          <p className="text-sm text-content-secondary">Esta ação não pode ser desfeita.</p>

          <div className="flex justify-end gap-3 pt-6 border-t border-edge mt-6">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-6 py-2.5 text-content-secondary border border-edge rounded-lg hover:bg-surface-secondary font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold transition-all disabled:opacity-50"
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
        title="Relatório de Comissões"
      >
        {comissoesData && (
          <div className="space-y-6">
            {/* Resumo Geral */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-secondary border border-edge-light rounded-lg p-4 text-center">
                <p className="text-xs text-content-secondary font-bold mb-1">Corretores</p>
                <p className="text-3xl font-bold text-brand">{comissoesData.total_corretores}</p>
              </div>
              <div className="bg-surface-secondary border border-edge-light rounded-lg p-4 text-center">
                <p className="text-xs text-content-secondary font-bold mb-1">Negociações</p>
                <p className="text-3xl font-bold text-brand">{comissoesData.total_negociacoes}</p>
              </div>
              <div className="bg-surface-secondary border border-edge-light rounded-lg p-4 text-center">
                <p className="text-xs text-content-secondary font-bold mb-1">Total Comissões</p>
                <p className="text-3xl font-bold text-amber-500">
                  R$ {comissoesData.comissoes.reduce((sum: number, c: any) => sum + c.total_comissao, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Lista de Comissões por Corretor */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {comissoesData.comissoes.map((corretor: any) => (
                <div key={corretor.corretor_id} className="border border-edge-light rounded-lg p-4 hover:border-brand/30 transition-colors">
                  {/* Header do Corretor */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-content">{corretor.corretor_nome}</h3>
                      <p className="text-xs text-content-tertiary">{corretor.corretor_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-content-secondary font-semibold">Total Comissão</p>
                      <p className="text-xl font-bold text-amber-500">
                        R$ {corretor.total_comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Stats do Corretor */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-surface-secondary rounded p-2 text-center">
                      <p className="text-xs text-content-secondary font-semibold">Total em Vendas</p>
                      <p className="text-sm font-bold text-content">
                        R$ {corretor.total_vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-surface-secondary rounded p-2 text-center">
                      <p className="text-xs text-content-secondary font-semibold">Negociações Fechadas</p>
                      <p className="text-sm font-bold text-content">{corretor.negociacoes.length}</p>
                    </div>
                  </div>

                  {/* Lista de Negociações */}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-brand hover:text-brand/80">
                      Ver {corretor.negociacoes.length} negociação(ões) →
                    </summary>
                    <div className="mt-3 space-y-2 pl-4 border-l-2 border-edge-light">
                      {corretor.negociacoes.map((neg: any) => (
                        <div key={neg.id} className="text-xs bg-surface-secondary rounded p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-brand font-bold">{neg.codigo}</span>
                            <span className="text-content-tertiary">
                              {new Date(neg.data_fechamento).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="font-semibold text-content">{neg.imovel_titulo}</p>
                          <p className="text-content-secondary">Cliente: {neg.lead_nome}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-content-secondary">Valor: <strong>R$ {neg.valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                            <span className="text-amber-500 font-bold">Comissão: R$ {neg.valor_comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>

            {/* Botão Fechar */}
            <div className="flex justify-end pt-4 border-t border-edge">
              <button
                onClick={() => {
                  setComissoesModalOpen(false);
                  setComissoesData(null);
                }}
                className="px-6 py-2.5 text-content-secondary border border-edge rounded-lg hover:bg-surface-secondary font-bold transition-all"
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

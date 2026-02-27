'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import RegistrarAtividade from '@/components/RegistrarAtividade';
import TimelineInteracoes from '@/components/TimelineInteracoes';
import { formatPhone, unformatNumbers } from '@/lib/formatters';
import ReportDownloadButton from '@/components/ReportDownloadButton';
import Link from 'next/link';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: 'QUENTE' | 'MORNO' | 'FRIO';
  origem?: string;
  interesse?: any;
  observacoes?: string;
  corretor?: {
    id: string;
    user: {
      nome: string;
      email: string;
    };
  } | null;
  negociacoes?: Array<{
    id: string;
    imovel: {
      id: string;
      codigo: string;
      tipo: string;
    };
  }>;
}

interface LeadDetails {
  totalPropostas: number;
}

interface LeadForm {
  nome: string;
  email: string;
  telefone: string;
  status: string;
  origem: string;
  perfil: 'PROPRIETARIO' | 'INTERESSADO';
  interesse: {
    tipo_imovel: string[];
    finalidade: 'VENDA' | 'LOCACAO';
    forma_pagamento: string[];
  };
  observacoes: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [leadDetails, setLeadDetails] = useState<LeadDetails>({ totalPropostas: 0 });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState<LeadForm>({
    nome: '',
    email: '',
    telefone: '',
    status: 'FRIO',
    origem: 'SITE',
    perfil: 'INTERESSADO',
    interesse: {
      tipo_imovel: [],
      finalidade: 'VENDA',
      forma_pagamento: [],
    },
    observacoes: '',
  });

  useEffect(() => {
    loadLeads();
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

  const loadLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    if (field === 'telefone') {
      value = formatPhone(value);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: { ...(formData as any)[parent], [child]: value }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    setHasUnsavedChanges(true);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges && editingLead) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente sair sem salvar?')) {
        setModalOpen(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setModalOpen(false);
    }
  };

  const loadLeadDetails = async (leadId: string) => {
    setLoadingDetails(true);
    try {
      const leadResponse = await api.get(`/leads/${leadId}`);
      const fullLead = leadResponse.data;
      setEditingLead(fullLead);

      const propostasResponse = await api.get(`/propostas/lead/${leadId}`);
      const propostas = Array.isArray(propostasResponse.data) ? propostasResponse.data : [];
      setLeadDetails({ totalPropostas: propostas.length });
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do lead:', error);
      toast.error('Erro ao carregar detalhes');
      setLeadDetails({ totalPropostas: 0 });
    } finally {
      setLoadingDetails(false);
    }
  };

  const openCreateModal = () => {
    setEditingLead(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      status: 'FRIO',
      origem: 'SITE',
      perfil: 'INTERESSADO',
      interesse: {
        tipo_imovel: [],
        finalidade: 'VENDA',
        forma_pagamento: [],
      },
      observacoes: '',
    });
    setOriginalFormData(null);
    setHasUnsavedChanges(false);
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    const interesseData = typeof lead.interesse === 'string' ? JSON.parse(lead.interesse) : (lead.interesse || {});
    const formDataToSet = {
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      status: lead.status,
      origem: lead.origem || 'SITE',
      perfil: interesseData.perfil || 'INTERESSADO',
      interesse: {
        tipo_imovel: interesseData.tipo_imovel || [],
        finalidade: interesseData.finalidade || 'VENDA',
        forma_pagamento: interesseData.forma_pagamento || [],
      },
      observacoes: lead.observacoes || '',
    };
    setFormData(formDataToSet);
    setOriginalFormData({ ...formDataToSet });
    setHasUnsavedChanges(false);
    setModalOpen(true);
    loadLeadDetails(lead.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        telefone: unformatNumbers(formData.telefone),
      };

      if (editingLead) {
        await api.put(`/leads/${editingLead.id}`, payload);
        toast.success('Lead atualizado com sucesso!');
      } else {
        await api.post('/leads', payload);
        toast.success('Lead cadastrado com sucesso!');
      }
      setHasUnsavedChanges(false);
      setModalOpen(false);
      loadLeads();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLead) return;
    setSubmitting(true);

    try {
      await api.delete(`/leads/${deletingLead.id}`);
      toast.success('Lead excluído com sucesso!');
      setDeleteModalOpen(false);
      setDeletingLead(null);
      loadLeads();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir lead');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.includes(searchTerm)
  );

  // Contadores por status
  const leadsQuentes = leads.filter(l => l.status === 'QUENTE').length;
  const leadsMornos = leads.filter(l => l.status === 'MORNO').length;
  const leadsFrios = leads.filter(l => l.status === 'FRIO').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content">Clientes</h1>
        <button
          onClick={openCreateModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex gap-2 hover:bg-green-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Cliente
        </button>
      </div>

      {/* KPIs - Cards minimalistas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-edge-light">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wide">Total</span>
          <div className="text-3xl font-bold text-content mt-1">{leads.length}</div>
        </div>
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-edge-light">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Quentes</span>
          <div className="text-3xl font-bold text-red-600 mt-1">{leadsQuentes}</div>
        </div>
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-edge-light">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Mornos</span>
          <div className="text-3xl font-bold text-amber-600 mt-1">{leadsMornos}</div>
        </div>
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-edge-light">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Frios</span>
          <div className="text-3xl font-bold text-blue-600 mt-1">{leadsFrios}</div>
        </div>
      </div>

      {/* Layout Assimétrico: Coluna Principal (70%) + Sidebar (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coluna Principal - Tabela de Leads */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barra de busca e ações */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-content-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-edge rounded-lg text-sm font-medium text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent placeholder:text-content-tertiary placeholder:font-normal"
              />
            </div>
            <Link
              href="/dashboard/leads/importar"
              className="px-4 py-2.5 border border-edge text-content-secondary rounded-lg hover:bg-surface-secondary transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importar
            </Link>
            <ReportDownloadButton
              reportType="leads"
              label="PDF"
              className="bg-surface-secondary hover:bg-surface-tertiary text-content-secondary font-semibold"
            />
          </div>

          {/* Tabela */}
          <div className="bg-surface rounded-xl shadow-sm border border-edge-light overflow-hidden">
            <table className="min-w-full divide-y divide-edge">
              <thead className="bg-surface-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-content uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-content uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-content uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-content uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-edge-light">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-content-secondary">
                      <div className="text-lg font-semibold">{searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</div>
                      <p className="text-sm mt-1 font-medium">Clique em &quot;Novo Cliente&quot; para adicionar</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-surface-secondary transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-content">{lead.nome}</div>
                        <div className="text-xs font-medium text-content-secondary">{lead.origem || 'Site'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-content">{lead.email}</div>
                        <div className="text-xs font-medium text-content-secondary">{formatPhone(lead.telefone)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            lead.status === 'QUENTE'
                              ? 'bg-red-100 text-red-700'
                              : lead.status === 'MORNO'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openEditModal(lead)}
                          className="text-green-600 hover:text-green-800 font-semibold mr-3"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => {
                            setDeletingLead(lead);
                            setDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar - Sofia Insights e Ações */}
        <div className="space-y-6">
          {/* Widget Sofia */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-1 shadow-lg text-white">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base">Sofia Insights</h3>
              </div>
              {leadsQuentes > 0 ? (
                <p className="text-sm font-medium opacity-95 mb-3">
                  &quot;Você tem {leadsQuentes} cliente{leadsQuentes > 1 ? 's' : ''} quente{leadsQuentes > 1 ? 's' : ''} aguardando contato. Priorize-os!&quot;
                </p>
              ) : leadsMornos > 0 ? (
                <p className="text-sm font-medium opacity-95 mb-3">
                  &quot;{leadsMornos} cliente{leadsMornos > 1 ? 's' : ''} morno{leadsMornos > 1 ? 's' : ''} pode{leadsMornos > 1 ? 'm' : ''} esfriar. Faça um follow-up.&quot;
                </p>
              ) : (
                <p className="text-sm font-medium opacity-95 mb-3">
                  &quot;Sua base está organizada. Continue captando novos clientes!&quot;
                </p>
              )}
              <button
                onClick={openCreateModal}
                className="w-full py-2 bg-white text-indigo-600 font-bold text-sm rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Adicionar Cliente
              </button>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-surface p-5 rounded-xl shadow-sm border border-edge-light">
            <h3 className="font-bold text-content text-sm mb-3">Ações Rápidas</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/leads/importar"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-content hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-content-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Importar CSV
              </Link>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-content hover:bg-surface-secondary rounded-lg transition-colors w-full text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-content-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Cadastrar Manualmente
              </button>
            </div>
          </div>

          {/* Resumo por Origem */}
          <div className="bg-surface p-5 rounded-xl shadow-sm border border-edge-light">
            <h3 className="font-bold text-content text-sm mb-3">Por Origem</h3>
            <div className="space-y-2.5 text-sm">
              {['SITE', 'WHATSAPP', 'INDICACAO', 'REDES_SOCIAIS', 'TELEFONE'].map(origem => {
                const count = leads.filter(l => l.origem === origem).length;
                if (count === 0) return null;
                return (
                  <div key={origem} className="flex justify-between items-center">
                    <span className="font-medium text-content-secondary">{origem.replace('_', ' ')}</span>
                    <span className="font-bold text-content">{count}</span>
                  </div>
                );
              })}
              {leads.filter(l => !l.origem).length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-content-secondary">Não definido</span>
                  <span className="font-bold text-content">{leads.filter(l => !l.origem).length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingLead ? 'Detalhes do Cliente' : 'Novo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-content border-b border-edge-light pb-2">Dados Básicos</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-content-secondary uppercase mb-1.5">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => handleFormChange('nome', e.target.value)}
                  className="w-full px-3 py-2.5 border border-edge rounded-lg text-sm font-medium text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary uppercase mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2.5 border border-edge rounded-lg text-sm font-medium text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary uppercase mb-1.5">Telefone *</label>
                <input
                  type="tel"
                  required
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => handleFormChange('telefone', e.target.value)}
                  className="w-full px-3 py-2.5 border border-edge rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand/30 focus:border-transparent placeholder:font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary uppercase mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-edge rounded-lg text-sm font-medium text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  <option value="FRIO">Frio</option>
                  <option value="MORNO">Morno</option>
                  <option value="QUENTE">Quente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary uppercase mb-1.5">Origem</label>
                <select
                  value={formData.origem}
                  onChange={(e) => handleFormChange('origem', e.target.value)}
                  className="w-full px-3 py-2.5 border border-edge rounded-lg text-sm font-medium text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  <option value="SITE">Site</option>
                  <option value="INDICACAO">Indicação</option>
                  <option value="TELEFONE">Telefone</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="REDES_SOCIAIS">Redes Sociais</option>
                </select>
              </div>
            </div>
          </div>

          {/* Perfil do Cliente */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-content border-b border-edge-light pb-2">Perfil do Cliente</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-content-secondary uppercase mb-2">Tipo *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.perfil === 'PROPRIETARIO'
                      ? 'bg-green-50 border-green-500 text-green-800'
                      : 'bg-surface border-edge text-content hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="perfil"
                      value="PROPRIETARIO"
                      checked={formData.perfil === 'PROPRIETARIO'}
                      onChange={(e) => handleFormChange('perfil', e.target.value as any)}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-semibold">Proprietário</span>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.perfil === 'INTERESSADO'
                      ? 'bg-green-50 border-green-500 text-green-800'
                      : 'bg-surface border-edge text-content hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="perfil"
                      value="INTERESSADO"
                      checked={formData.perfil === 'INTERESSADO'}
                      onChange={(e) => handleFormChange('perfil', e.target.value as any)}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-semibold">Interessado</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-content-secondary uppercase mb-2">Finalidade *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.interesse.finalidade === 'VENDA'
                      ? 'bg-green-50 border-green-500 text-green-800'
                      : 'bg-surface border-edge text-content hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="finalidade"
                      value="VENDA"
                      checked={formData.interesse.finalidade === 'VENDA'}
                      onChange={(e) => handleFormChange('interesse.finalidade', e.target.value as any)}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-semibold">{formData.perfil === 'PROPRIETARIO' ? 'Vender' : 'Comprar'}</span>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.interesse.finalidade === 'LOCACAO'
                      ? 'bg-green-50 border-green-500 text-green-800'
                      : 'bg-surface border-edge text-content hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="finalidade"
                      value="LOCACAO"
                      checked={formData.interesse.finalidade === 'LOCACAO'}
                      onChange={(e) => handleFormChange('interesse.finalidade', e.target.value as any)}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-sm font-semibold">Alugar</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-content-secondary uppercase mb-2">Formas de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {['À Vista', 'Financiamento Bancário', 'Carta de Crédito', 'Consórcio', 'Permuta'].map((forma) => (
                    <label key={forma} className="flex items-center p-2.5 bg-surface border border-edge rounded-lg hover:border-brand/30 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.interesse.forma_pagamento.includes(forma)}
                        onChange={(e) => {
                          const novasFormas = e.target.checked
                            ? [...formData.interesse.forma_pagamento, forma]
                            : formData.interesse.forma_pagamento.filter(f => f !== forma);
                          handleFormChange('interesse.forma_pagamento', novasFormas);
                        }}
                        className="mr-2 text-green-600"
                      />
                      <span className="text-sm font-medium text-content-secondary">{forma}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-content border-b border-edge-light pb-2">Observações</h4>
            <textarea
              rows={3}
              value={formData.observacoes}
              onChange={(e) => handleFormChange('observacoes', e.target.value)}
              placeholder="Informações adicionais sobre o lead..."
              className="w-full px-3 py-2.5 border border-edge rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand/30 focus:border-transparent placeholder:text-content-tertiary placeholder:font-normal"
            />
          </div>

          {/* Vinculações e Ações - Apenas quando editando */}
          {editingLead && (
            <>
              {/* Ações Rápidas */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                <h4 className="text-sm font-bold text-content mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Ações Rápidas
                </h4>
                <div className="flex gap-3 flex-wrap">
                  <RegistrarAtividade
                    leadId={editingLead.id}
                    leadNome={editingLead.nome}
                    onSuccess={() => {
                      toast.success('Atividade registrada!');
                      loadLeads();
                    }}
                  />
                  <a
                    href={`https://wa.me/55${editingLead.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Vinculações */}
              <div className="bg-surface-secondary p-4 rounded-xl border border-edge-light">
                <h4 className="text-sm font-bold text-content mb-3">Informações</h4>

                {loadingDetails ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface p-3 rounded-lg border border-edge-light">
                      <div className="text-xs font-bold text-content-secondary uppercase mb-1">Corretor</div>
                      {editingLead.corretor ? (
                        <div className="text-sm font-semibold text-content">{editingLead.corretor.user.nome}</div>
                      ) : (
                        <div className="text-sm font-medium text-content-tertiary">Não atribuído</div>
                      )}
                    </div>

                    <div className="bg-surface p-3 rounded-lg border border-edge-light">
                      <div className="text-xs font-bold text-content-secondary uppercase mb-1">Negociações</div>
                      <div className="text-xl font-bold text-green-600">
                        {editingLead.negociacoes?.length || 0}
                      </div>
                    </div>

                    <div className="bg-surface p-3 rounded-lg border border-edge-light">
                      <div className="text-xs font-bold text-content-secondary uppercase mb-1">Propostas</div>
                      <div className="text-xl font-bold text-green-600">
                        {leadDetails.totalPropostas}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline de Interações */}
              <div className="bg-surface p-4 rounded-xl border border-edge-light">
                <TimelineInteracoes
                  leadId={editingLead.id}
                  leadNome={editingLead.nome}
                  maxItems={20}
                  showHeader={true}
                  onInteracaoAdded={() => {
                    loadLeads();
                  }}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-edge-light">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2.5 text-sm font-semibold text-content-secondary border border-edge rounded-lg hover:bg-surface-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
          <p className="text-content-secondary text-sm font-medium">
            Tem certeza que deseja excluir o cliente <strong className="text-content">{deletingLead?.nome}</strong>?
          </p>
          <p className="text-xs font-medium text-content-tertiary">Esta ação não pode ser desfeita.</p>

          <div className="flex justify-end gap-3 pt-4 border-t border-edge-light">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-content-secondary border border-edge rounded-lg hover:bg-surface-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

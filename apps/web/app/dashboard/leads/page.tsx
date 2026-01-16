'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import RegistrarAtividade from '@/components/RegistrarAtividade';
import { formatPhone, unformatNumbers } from '@/lib/formatters';

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
  perfil: 'PROPRIETARIO' | 'INTERESSADO'; // Proprietário (fornecedor) ou Interessado (comprador)
  interesse: {
    tipo_imovel: string[];
    finalidade: 'VENDA' | 'LOCACAO'; // Vender/Alugar ou Comprar/Alugar
    forma_pagamento: string[]; // À vista, Financiamento, Carta de Crédito, etc
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
    // Aplica formatação automática para telefone
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
      // Buscar lead completo com relacionamentos
      const leadResponse = await api.get(`/leads/${leadId}`);
      const fullLead = leadResponse.data;

      // Atualizar editingLead com dados completos
      setEditingLead(fullLead);

      // Buscar total de propostas do lead
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

    // Carregar detalhes completos do lead
    loadLeadDetails(lead.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Remove formatação do telefone antes de enviar
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-[#064E3B] tracking-tight">Leads</h2>
          <p className="text-sm text-[#4B5563] mt-2 font-medium">
            <span className="text-[#00C48C] text-lg font-bold">{leads.length}</span> leads cadastrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary"
        >
          + Novo Lead
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-modern"
        />
      </div>

      {/* Tabela */}
      <div className="card-clean shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-[rgba(169,126,111,0.2)]">
          <thead className="bg-gradient-to-r from-[#059669] to-[#059669]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[rgba(169,126,111,0.1)]">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#4B5563]">
                  <div className="text-lg font-medium">{searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead cadastrado'}</div>
                  <p className="text-sm text-[#4B5563] mt-2">Clique em &ldquo;+ Novo Lead&rdquo; para adicionar</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, index) => (
                <tr key={lead.id} className={`hover:bg-[#F9FAFB] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F6F8]'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#064E3B]">
                    {lead.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563] font-medium">{formatPhone(lead.telefone)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${
                        lead.status === 'QUENTE'
                          ? 'bg-[#FF6B6B]/10 text-[#FF006E] border-[#FF006E]/50'
                          : lead.status === 'MORNO'
                          ? 'bg-[#FFB627]/10 text-[#FFB627] border-[#FFB627]/50'
                          : 'bg-[#059669]/10 text-[#059669] border-[#059669]/50'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(lead)}
                      className="text-[#00C48C] hover:text-[#059669] mr-4 font-bold hover:underline transition-all"
                    >
                      👁️ Consultar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingLead(lead);
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
        title={editingLead ? 'Consultar Lead' : 'Novo Lead'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h4 className="text-md font-bold text-[#064E3B] border-b border-gray-200 pb-2">Dados Básicos</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-[#064E3B] mb-2">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => handleFormChange('nome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#064E3B] mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#064E3B] mb-2">Telefone *</label>
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
                <label className="block text-sm font-bold text-[#064E3B] mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                >
                  <option value="FRIO">Frio</option>
                  <option value="MORNO">Morno</option>
                  <option value="QUENTE">Quente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#064E3B] mb-2">Origem</label>
                <select
                  value={formData.origem}
                  onChange={(e) => handleFormChange('origem', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
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
            <h4 className="text-md font-bold text-[#064E3B] border-b border-gray-200 pb-2">Perfil do Cliente</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-[#064E3B] mb-2">O cliente é: *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.perfil === 'PROPRIETARIO'
                      ? 'bg-[#F0FDF4] border-[#00C48C] text-[#064E3B]'
                      : 'bg-white border-gray-200 text-[#064E3B] hover:border-[#00C48C]/50'
                  }`}>
                    <input
                      type="radio"
                      name="perfil"
                      value="PROPRIETARIO"
                      checked={formData.perfil === 'PROPRIETARIO'}
                      onChange={(e) => handleFormChange('perfil', e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="font-medium">🏠 Proprietário (quer vender/alugar)</span>
                  </label>
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.perfil === 'INTERESSADO'
                      ? 'bg-[#F0FDF4] border-[#00C48C] text-[#064E3B]'
                      : 'bg-white border-gray-200 text-[#064E3B] hover:border-[#00C48C]/50'
                  }`}>
                    <input
                      type="radio"
                      name="perfil"
                      value="INTERESSADO"
                      checked={formData.perfil === 'INTERESSADO'}
                      onChange={(e) => handleFormChange('perfil', e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="font-medium">👤 Interessado (quer comprar/alugar)</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-[#064E3B] mb-2">Finalidade: *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.interesse.finalidade === 'VENDA'
                      ? 'bg-[#F0FDF4] border-[#00C48C] text-[#064E3B]'
                      : 'bg-white border-gray-200 text-[#064E3B] hover:border-[#00C48C]/50'
                  }`}>
                    <input
                      type="radio"
                      name="finalidade"
                      value="VENDA"
                      checked={formData.interesse.finalidade === 'VENDA'}
                      onChange={(e) => handleFormChange('interesse.finalidade', e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="font-medium">💰 {formData.perfil === 'PROPRIETARIO' ? 'Vender' : 'Comprar'}</span>
                  </label>
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.interesse.finalidade === 'LOCACAO'
                      ? 'bg-[#F0FDF4] border-[#00C48C] text-[#064E3B]'
                      : 'bg-white border-gray-200 text-[#064E3B] hover:border-[#00C48C]/50'
                  }`}>
                    <input
                      type="radio"
                      name="finalidade"
                      value="LOCACAO"
                      checked={formData.interesse.finalidade === 'LOCACAO'}
                      onChange={(e) => handleFormChange('interesse.finalidade', e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="font-medium">🔑 Alugar</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-[#064E3B] mb-2">Formas de Pagamento Aceitas/Desejadas:</label>
                <div className="grid grid-cols-2 gap-2">
                  {['À Vista', 'Financiamento Bancário', 'Carta de Crédito', 'Consórcio', 'Permuta'].map((forma) => (
                    <label key={forma} className="flex items-center p-2 bg-white border border-gray-200 rounded-lg hover:border-[#00C48C]/50 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.interesse.forma_pagamento.includes(forma)}
                        onChange={(e) => {
                          const novasFormas = e.target.checked
                            ? [...formData.interesse.forma_pagamento, forma]
                            : formData.interesse.forma_pagamento.filter(f => f !== forma);
                          handleFormChange('interesse.forma_pagamento', novasFormas);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-[#064E3B] font-medium">{forma}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h4 className="text-md font-bold text-[#064E3B] border-b border-gray-200 pb-2">Observações</h4>
            <textarea
              rows={3}
              value={formData.observacoes}
              onChange={(e) => handleFormChange('observacoes', e.target.value)}
              placeholder="Informações adicionais sobre o lead..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Vinculações e Ações - Apenas quando editando */}
          {editingLead && (
            <>
              {/* Ações Rápidas */}
              <div className="bg-gradient-to-r from-[#FFB627]/10 to-[#FF6B6B]/10 p-4 rounded-lg border-2 border-[#FFB627]/30">
                <h4 className="text-md font-bold text-[#064E3B] border-b border-[#FFB627]/30 pb-2 mb-3 flex items-center gap-2">
                  ⚡ Ações Rápidas
                </h4>
                <div className="flex gap-3 flex-wrap">
                  <RegistrarAtividade
                    leadId={editingLead.id}
                    leadNome={editingLead.nome}
                    onSuccess={() => {
                      toast.success('Atividade registrada! Lead atualizado.');
                      loadLeads();
                    }}
                  />
                  <a
                    href={`https://wa.me/55${editingLead.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-lg hover:shadow-md transition-all hover:scale-105"
                  >
                    <span>💬</span>
                    <span>Abrir WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Vinculações */}
              <div className="space-y-4 bg-gradient-to-r from-[#F0FDF4] to-[#EFF6FF] p-4 rounded-lg border-2 border-[#00C48C]/30">
                <h4 className="text-md font-bold text-[#064E3B] border-b border-[#00C48C]/30 pb-2 flex items-center gap-2">
                  🔗 Vinculações
                </h4>

                {loadingDetails ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C48C]"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {/* Corretor Responsável */}
                    <div className="bg-white p-3 rounded-lg border-2 border-[#A97E6F]/30">
                      <div className="text-xs font-bold text-[#4B5563] mb-1">👤 CORRETOR</div>
                      {editingLead.corretor ? (
                        <div>
                          <div className="text-sm font-bold text-[#064E3B]">{editingLead.corretor.user.nome}</div>
                          <div className="text-xs text-[#4B5563]">{editingLead.corretor.user.email}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-[#9CA3AF]">Não atribuído</div>
                      )}
                    </div>

                    {/* Imóveis de Interesse */}
                    <div className="bg-white p-3 rounded-lg border-2 border-[#059669]/30">
                      <div className="text-xs font-bold text-[#4B5563] mb-1">🏘️ IMÓVEIS</div>
                      <div className="text-2xl font-bold text-[#059669]">
                        {editingLead.negociacoes?.length || 0}
                      </div>
                      <div className="text-xs text-[#4B5563]">negociações ativas</div>
                    </div>

                    {/* Total de Propostas */}
                    <div className="bg-white p-3 rounded-lg border-2 border-[#00C48C]/30">
                      <div className="text-xs font-bold text-[#4B5563] mb-1">📋 PROPOSTAS</div>
                      <div className="text-2xl font-bold text-[#00C48C]">
                        {leadDetails.totalPropostas}
                      </div>
                      <div className="text-xs text-[#4B5563]">propostas feitas</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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
            Tem certeza que deseja excluir o lead <strong className="text-[#059669]">{deletingLead?.nome}</strong>?
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
    </div>
  );
}

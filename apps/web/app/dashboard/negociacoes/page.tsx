'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import { formatCurrencyInput, formatCurrencyForEdit, parseCurrency } from '@/lib/formatters';

interface Negociacao {
  id: string;
  codigo: string;
  lead_id: string;
  imovel_id: string;
  corretor_id?: string;
  status: 'PROPOSTA' | 'EM_ANDAMENTO' | 'FECHADA' | 'CANCELADA';
  valor_proposta: number;
  valor_final?: number;
  percentual_comissao: number;
  data_inicio: string;
  data_conclusao?: string;
  observacoes?: string;
  lead?: {
    nome: string;
  };
  imovel?: {
    titulo: string;
  };
  corretor?: {
    nome: string;
  };
}

interface NegociacaoForm {
  lead_id: string;
  imovel_id: string;
  corretor_id: string;
  status: string;
  valor_proposta: string;
  valor_final: string;
  percentual_comissao: string;
  data_inicio: string;
  data_conclusao: string;
  observacoes: string;
}

interface Lead {
  id: string;
  nome: string;
}

interface Imovel {
  id: string;
  titulo: string;
  valor?: number;
  preco?: number;
  fotos?: string[];
  proprietario?: {
    nome: string;
  };
  corretor_responsavel?: {
    user: {
      nome: string;
    };
  };
}

interface Corretor {
  id: string;
  nome: string;
}

export default function NegociacoesPage() {
  const [negociacoes, setNegociacoes] = useState<Negociacao[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingNegociacao, setEditingNegociacao] = useState<Negociacao | null>(null);
  const [deletingNegociacao, setDeletingNegociacao] = useState<Negociacao | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [selectedImovelDetails, setSelectedImovelDetails] = useState<Imovel | null>(null);
  const [bestOffer, setBestOffer] = useState<any>(null);
  const [myOffer, setMyOffer] = useState<any>(null);
  const [totalPropostas, setTotalPropostas] = useState(0);
  const [loadingPropostas, setLoadingPropostas] = useState(false);

  const [formData, setFormData] = useState<NegociacaoForm>({
    lead_id: '',
    imovel_id: '',
    corretor_id: '',
    status: 'PROPOSTA',
    valor_proposta: '',
    valor_final: '',
    percentual_comissao: '5',
    data_inicio: new Date().toISOString().split('T')[0],
    data_conclusao: '',
    observacoes: '',
  });

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadAll = async () => {
    await Promise.all([
      loadNegociacoes(),
      loadLeads(),
      loadImoveis(),
      loadCorretores(),
    ]);
  };

  const loadNegociacoes = async () => {
    try {
      const response = await api.get('/negociacoes');
      // API retorna { data: [...], meta: {...} }
      const negociacoesData = response.data.data || response.data;
      setNegociacoes(Array.isArray(negociacoesData) ? negociacoesData : []);
    } catch (error: any) {
      console.error('Erro ao carregar negociações:', error);
      toast.error('Erro ao carregar negociações');
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await api.get('/leads');
      // API retorna { data: [...], meta: {...} }
      const leadsData = response.data.data || response.data;
      setLeads(Array.isArray(leadsData) ? leadsData : []);
    } catch (error: any) {
      console.error('Erro ao carregar leads:', error);
    }
  };

  const loadImoveis = async () => {
    try {
      const response = await api.get('/imoveis');
      // API retorna { data: [...], meta: {...} }
      const imoveisData = response.data.data || response.data;
      setImoveis(Array.isArray(imoveisData) ? imoveisData : []);
    } catch (error: any) {
      console.error('Erro ao carregar imóveis:', error);
    }
  };

  const loadCorretores = async () => {
    try {
      const response = await api.get('/corretores');
      setCorretores(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar corretores:', error);
    }
  };

  const loadImovelDetails = async (imovelId: string, leadId?: string) => {
    try {
      // Carregar detalhes do imóvel
      const response = await api.get(`/imoveis/${imovelId}`);
      const imovelData = response.data;
      setSelectedImovelDetails(imovelData);

      // Carregar total de propostas do imóvel
      setLoadingPropostas(true);
      try {
        const propostasResponse = await api.get(`/propostas/imovel/${imovelId}`);
        const propostas = Array.isArray(propostasResponse.data) ? propostasResponse.data : [];
        setTotalPropostas(propostas.length);
      } catch (error) {
        console.log('Erro ao carregar propostas do imóvel');
        setTotalPropostas(0);
      } finally {
        setLoadingPropostas(false);
      }

      // Carregar melhor oferta para o imóvel
      try {
        const bestOfferResponse = await api.get(`/propostas/imovel/${imovelId}/best-offer`);
        setBestOffer(bestOfferResponse.data.bestOffer);
      } catch (error) {
        console.log('Nenhuma oferta encontrada para este imóvel');
        setBestOffer(null);
      }

      // Carregar oferta do usuário atual (se lead_id fornecido)
      if (leadId) {
        try {
          const myOfferResponse = await api.get(`/propostas/imovel/${imovelId}/my-offer?lead_id=${leadId}`);
          const userOffer = myOfferResponse.data.myOffer;
          setMyOffer(userOffer);

          // Se já tem proposta do sistema de lances, SEMPRE usar esse valor
          if (userOffer && userOffer.valor) {
            setFormData(prev => ({
              ...prev,
              valor_proposta: formatCurrencyForEdit(userOffer.valor)
            }));
          }
        } catch (error) {
          console.log('Usuário ainda não fez proposta para este imóvel');
          setMyOffer(null);

          // Auto-preencher com o valor do imóvel se não tem proposta E campo está vazio
          const valorImovel = imovelData.valor || imovelData.preco || 0;
          if (valorImovel > 0 && !formData.valor_proposta) {
            setFormData(prev => ({
              ...prev,
              valor_proposta: formatCurrencyForEdit(valorImovel)
            }));
          }
        }
      } else {
        // Auto-preencher com o valor do imóvel
        const valorImovel = imovelData.valor || imovelData.preco || 0;
        if (valorImovel > 0 && !formData.valor_proposta) {
          setFormData(prev => ({
            ...prev,
            valor_proposta: formatCurrencyForEdit(valorImovel)
          }));
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do imóvel:', error);
      setSelectedImovelDetails(null);
      setBestOffer(null);
      setMyOffer(null);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges && editingNegociacao) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente sair sem salvar?')) {
        setModalOpen(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setModalOpen(false);
    }
  };

  const openCreateModal = () => {
    setEditingNegociacao(null);
    setSelectedImovelDetails(null);
    setBestOffer(null);
    setMyOffer(null);
    setFormData({
      lead_id: '',
      imovel_id: '',
      corretor_id: '',
      status: 'PROPOSTA',
      valor_proposta: '',
      valor_final: '',
      percentual_comissao: '5',
      data_inicio: new Date().toISOString().split('T')[0],
      data_conclusao: '',
      observacoes: '',
    });
    setOriginalFormData(null);
    setHasUnsavedChanges(false);
    setModalOpen(true);
  };

  const openEditModal = async (negociacao: Negociacao) => {
    setEditingNegociacao(negociacao);

    const formDataToSet = {
      lead_id: negociacao.lead_id,
      imovel_id: negociacao.imovel_id,
      corretor_id: negociacao.corretor_id || '',
      status: negociacao.status,
      valor_proposta: formatCurrencyForEdit(negociacao.valor_proposta),
      valor_final: formatCurrencyForEdit(negociacao.valor_final),
      percentual_comissao: negociacao.percentual_comissao?.toString() || '5',
      data_inicio: negociacao.data_inicio ? negociacao.data_inicio.split('T')[0] : new Date().toISOString().split('T')[0],
      data_conclusao: negociacao.data_conclusao ? negociacao.data_conclusao.split('T')[0] : '',
      observacoes: negociacao.observacoes || '',
    };
    setFormData(formDataToSet);
    setOriginalFormData({ ...formDataToSet });
    setHasUnsavedChanges(false);

    // Carregar detalhes do imóvel com lead_id APÓS definir formData
    if (negociacao.imovel_id && negociacao.lead_id) {
      await loadImovelDetails(negociacao.imovel_id, negociacao.lead_id);
    }

    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        valor_proposta: parseCurrency(formData.valor_proposta),
        valor_final: formData.valor_final ? parseCurrency(formData.valor_final) : undefined,
        percentual_comissao: parseFloat(formData.percentual_comissao),
        data_conclusao: formData.data_conclusao || undefined,
        corretor_id: formData.corretor_id || undefined,
      };

      // Sempre criar/atualizar proposta no sistema de lances
      if (formData.lead_id && formData.imovel_id && formData.valor_proposta) {
        try {
          await api.post('/propostas', {
            lead_id: formData.lead_id,
            imovel_id: formData.imovel_id,
            corretor_id: formData.corretor_id || undefined,
            valor: parseCurrency(formData.valor_proposta),
            observacoes: formData.observacoes,
          });
        } catch (error: any) {
          console.error('Erro ao salvar proposta:', error);
          // Continua mesmo se falhar, pois a negociação ainda será salva
        }
      }

      if (editingNegociacao) {
        await api.put(`/negociacoes/${editingNegociacao.id}`, payload);
        toast.success('Negociação atualizada com sucesso!');
      } else {
        await api.post('/negociacoes', payload);
        toast.success('Negociação cadastrada com sucesso!');
      }
      setHasUnsavedChanges(false);
      setModalOpen(false);
      setBestOffer(null);
      setMyOffer(null);
      setSelectedImovelDetails(null);
      loadNegociacoes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar negociação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingNegociacao) return;
    setSubmitting(true);

    try {
      await api.delete(`/negociacoes/${deletingNegociacao.id}`);
      toast.success('Negociação excluída com sucesso!');
      setDeleteModalOpen(false);
      setDeletingNegociacao(null);
      loadNegociacoes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir negociação');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNegociacoes = negociacoes.filter(
    (negociacao) =>
      negociacao.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      negociacao.lead?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      negociacao.imovel?.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PROPOSTA': 'Proposta',
      'EM_ANDAMENTO': 'Em Andamento',
      'FECHADA': 'Fechada',
      'CANCELADA': 'Cancelada',
    };
    return labels[status] || status;
  };

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
          <h2 className="text-4xl font-bold text-[#0A2540] tracking-tight">Negociações</h2>
          <p className="text-sm text-[#4B5563] mt-2 font-medium">
            <span className="text-[#00C48C] text-lg font-bold">{negociacoes.length}</span> negociações cadastradas
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 btn-primary"
          style={{
            boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          + Nova Negociação
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por código, cliente ou imóvel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-modern"
        />
      </div>

      {/* Tabela */}
      <div className="card-clean shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-600">
          <thead className="bg-gradient-to-r from-[#3B82F6] to-[#3B82F6]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Imóvel</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Corretor</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Valor Proposta</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[rgba(169,126,111,0.1)]">
            {filteredNegociacoes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#4B5563]">
                  <div className="text-lg font-medium">{searchTerm ? 'Nenhuma negociação encontrada' : 'Nenhuma negociação cadastrada'}</div>
                  <p className="text-sm text-[#4B5563] mt-2">Clique em &ldquo;+ Nova Negociação&rdquo; para adicionar</p>
                </td>
              </tr>
            ) : (
              filteredNegociacoes.map((negociacao, index) => (
                <tr key={negociacao.id} className={`hover:bg-[#F9FAFB] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-white/70'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0A2540]">
                    <span className="px-2 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded-md font-mono text-xs border border-[#3B82F6]/50">{negociacao.codigo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563] font-medium">
                    👤 {negociacao.lead?.nome || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563] font-medium">
                    🏠 {negociacao.imovel?.titulo || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                    {negociacao.corretor?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100 font-bold">
                    R$ {Number(negociacao.valor_proposta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${
                      negociacao.status === 'FECHADA' ? 'bg-[#00C48C]/20 text-[#00C48C] border-[#00C48C]/50' :
                      negociacao.status === 'CANCELADA' ? 'bg-[#FF6B6B]/20 text-[#FF006E] border-[#FF006E]/50' :
                      negociacao.status === 'EM_ANDAMENTO' ? 'bg-[#FFB627]/20 text-[#FFB627] border-[#FFB627]/50' :
                      'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/50'
                    }`}>
                      {getStatusLabel(negociacao.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(negociacao)}
                      className="text-[#00C48C] hover:text-[#3B82F6] mr-4 font-bold hover:underline transition-all"
                    >
                      👁️ Consultar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingNegociacao(negociacao);
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
        title={editingNegociacao ? 'Consultar Negociação' : 'Nova Negociação'}
        size="xl"
      >
        {/* Vinculações - Apenas quando editando e tem imóvel selecionado */}
        {editingNegociacao && selectedImovelDetails && (
          <div className="bg-gradient-to-r from-[#F0FDF4] to-[#EFF6FF] p-4 rounded-lg border-2 border-[#00C48C]/30 mb-6">
            <h4 className="text-md font-bold text-[#0A2540] border-b border-[#00C48C]/30 pb-2 mb-3 flex items-center gap-2">
              🔗 Vinculações
            </h4>

            {loadingPropostas ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C48C]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* Proprietário */}
                <div className="bg-white p-3 rounded-lg border-2 border-[#FFB627]/30">
                  <div className="text-xs font-bold text-[#4B5563] mb-1">🏠 PROPRIETÁRIO</div>
                  {selectedImovelDetails.proprietario ? (
                    <div className="text-sm font-bold text-[#0A2540]">{selectedImovelDetails.proprietario.nome}</div>
                  ) : (
                    <div className="text-sm text-[#9CA3AF]">Não informado</div>
                  )}
                </div>

                {/* Corretor */}
                <div className="bg-white p-3 rounded-lg border-2 border-[#A97E6F]/30">
                  <div className="text-xs font-bold text-[#4B5563] mb-1">👤 CORRETOR</div>
                  {selectedImovelDetails.corretor_responsavel ? (
                    <div className="text-sm font-bold text-[#0A2540]">{selectedImovelDetails.corretor_responsavel.user.nome}</div>
                  ) : (
                    <div className="text-sm text-[#9CA3AF]">Não atribuído</div>
                  )}
                </div>

                {/* Total de Propostas */}
                <div className="bg-white p-3 rounded-lg border-2 border-[#00C48C]/30">
                  <div className="text-xs font-bold text-[#4B5563] mb-1">📋 PROPOSTAS</div>
                  <div className="text-2xl font-bold text-[#00C48C]">
                    {totalPropostas}
                  </div>
                  <div className="text-xs text-[#4B5563]">no imóvel</div>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fotos do Imóvel - Exibir apenas se houver imóvel selecionado */}
          {selectedImovelDetails && selectedImovelDetails.fotos && selectedImovelDetails.fotos.length > 0 && (
            <div className="bg-gradient-to-br from-[#F9FAFB]/30 to-white border-2 border-[#3B82F6]/20 rounded-xl p-4">
              <h4 className="text-sm font-bold text-[#0A2540] mb-3 flex items-center gap-2">
                🏠 Fotos do Imóvel
              </h4>
              <div className="flex gap-3">
                {/* Primeira foto - maior (2/3 do espaço) */}
                <div className="w-2/3">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg border-2 border-[#00C48C]/30">
                    <img
                      src={selectedImovelDetails.fotos[0]}
                      alt="Foto principal do imóvel"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#00C48C] text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                      Principal
                    </div>
                  </div>
                </div>

                {/* Segunda e terceira fotos - menores (1/3 do espaço, empilhadas) */}
                <div className="flex flex-col gap-3 w-1/3">
                  {selectedImovelDetails.fotos[1] && (
                    <div className="relative flex-1 rounded-lg overflow-hidden shadow-md border border-[#3B82F6]/20">
                      <img
                        src={selectedImovelDetails.fotos[1]}
                        alt="Foto 2 do imóvel"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {selectedImovelDetails.fotos[2] && (
                    <div className="relative flex-1 rounded-lg overflow-hidden shadow-md border border-[#3B82F6]/20">
                      <img
                        src={selectedImovelDetails.fotos[2]}
                        alt="Foto 3 do imóvel"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              {selectedImovelDetails.fotos.length > 3 && (
                <p className="text-xs text-[#4B5563] mt-2 text-center">
                  +{selectedImovelDetails.fotos.length - 3} foto(s) adicional(is)
                </p>
              )}
            </div>
          )}

          {/* Formulário */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1">
                Cliente (Lead) *
              </label>
              <select
                required
                value={formData.lead_id}
                onChange={(e) => handleFormChange('lead_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1">
                Imóvel *
              </label>
              <select
                required
                value={formData.imovel_id}
                onChange={(e) => {
                  const imovelId = e.target.value;
                  handleFormChange('imovel_id', imovelId);
                  if (imovelId) {
                    loadImovelDetails(imovelId, formData.lead_id);
                  } else {
                    setSelectedImovelDetails(null);
                    setBestOffer(null);
                    setMyOffer(null);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {imoveis.map((imovel) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1">
                Corretor
              </label>
              <select
                value={formData.corretor_id}
                onChange={(e) => handleFormChange('corretor_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Nenhum</option>
                {corretores.map((corretor) => (
                  <option key={corretor.id} value={corretor.id}>
                    {corretor.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PROPOSTA">Proposta</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="FECHADA">Fechada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            {/* Valor Pedido */}
            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-1">
                Valor pedido *
              </label>
              <input
                type="text"
                required
                value={formData.valor_proposta}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value);
                  handleFormChange('valor_proposta', formatted);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-lg"
                placeholder="0,00"
              />
            </div>

            {/* Melhor Proposta - Sempre mostra */}
            <div className="bg-gradient-to-r from-[#00C48C]/10 to-[#00C48C]/5 border-2 border-[#00C48C]/30 rounded-lg p-3">
              <label className="block text-sm font-bold text-[#0A2540] mb-1 flex items-center gap-2">
                🏆 Melhor proposta
              </label>
              {bestOffer ? (
                <>
                  <div className="text-2xl font-bold text-[#00C48C]">
                    R$ {formatCurrencyForEdit(bestOffer.valor)}
                  </div>
                  {bestOffer.lead && (
                    <p className="text-xs text-[#4B5563] mt-1">
                      Oferta de: {bestOffer.lead.nome}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[#4B5563] italic">
                  Ainda sem interessados
                </p>
              )}
            </div>

            {/* Valor Proposto - Nova seção vazia */}
            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-1">
                Valor proposto
              </label>
              <input
                type="text"
                value={formData.valor_final}
                onChange={(e) => {
                  const formatted = formatCurrencyInput(e.target.value);
                  handleFormChange('valor_final', formatted);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                % Comissão *
              </label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                max="100"
                value={formData.percentual_comissao}
                onChange={(e) => handleFormChange('percentual_comissao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                required
                value={formData.data_inicio}
                onChange={(e) => handleFormChange('data_inicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2540] mb-1">
                Data de Conclusão
              </label>
              <input
                type="date"
                value={formData.data_conclusao}
                onChange={(e) => handleFormChange('data_conclusao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#0A2540] mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={formData.observacoes}
                onChange={(e) => handleFormChange('observacoes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-[#0A2540] border border-gray-300 rounded-lg hover:bg-[#F9FAFB] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-[#00C48C] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
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
            Tem certeza que deseja excluir a negociação <strong>{deletingNegociacao?.codigo}</strong>?
          </p>
          <p className="text-sm text-[#4B5563]">Esta ação não pode ser desfeita.</p>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-[#0A2540] border border-gray-300 rounded-lg hover:bg-[#F9FAFB] transition-all"
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

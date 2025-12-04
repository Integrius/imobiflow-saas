'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';

interface Negociacao {
  id: string;
  codigo: string;
  lead_id: string;
  imovel_id: string;
  corretor_id?: string;
  status: 'PROPOSTA' | 'EM_ANDAMENTO' | 'FECHADA' | 'CANCELADA';
  valor_proposta: number;
  valor_final?: number;
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

  const [formData, setFormData] = useState<NegociacaoForm>({
    lead_id: '',
    imovel_id: '',
    corretor_id: '',
    status: 'PROPOSTA',
    valor_proposta: '',
    valor_final: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_conclusao: '',
    observacoes: '',
  });

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setNegociacoes(Array.isArray(response.data) ? response.data : []);
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
      setLeads(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar leads:', error);
    }
  };

  const loadImoveis = async () => {
    try {
      const response = await api.get('/imoveis');
      setImoveis(Array.isArray(response.data) ? response.data : []);
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

  const openCreateModal = () => {
    setEditingNegociacao(null);
    setFormData({
      lead_id: '',
      imovel_id: '',
      corretor_id: '',
      status: 'PROPOSTA',
      valor_proposta: '',
      valor_final: '',
      data_inicio: new Date().toISOString().split('T')[0],
      data_conclusao: '',
      observacoes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (negociacao: Negociacao) => {
    setEditingNegociacao(negociacao);
    setFormData({
      lead_id: negociacao.lead_id,
      imovel_id: negociacao.imovel_id,
      corretor_id: negociacao.corretor_id || '',
      status: negociacao.status,
      valor_proposta: negociacao.valor_proposta.toString(),
      valor_final: negociacao.valor_final?.toString() || '',
      data_inicio: negociacao.data_inicio.split('T')[0],
      data_conclusao: negociacao.data_conclusao ? negociacao.data_conclusao.split('T')[0] : '',
      observacoes: negociacao.observacoes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        valor_proposta: parseFloat(formData.valor_proposta),
        valor_final: formData.valor_final ? parseFloat(formData.valor_final) : undefined,
        data_conclusao: formData.data_conclusao || undefined,
        corretor_id: formData.corretor_id || undefined,
      };

      if (editingNegociacao) {
        await api.put(`/negociacoes/${editingNegociacao.id}`, payload);
        toast.success('Negociação atualizada com sucesso!');
      } else {
        await api.post('/negociacoes', payload);
        toast.success('Negociação cadastrada com sucesso!');
      }
      setModalOpen(false);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Negociações</h2>
          <p className="text-sm text-slate-300 mt-2 font-medium">
            <span className="text-blue-400 text-lg font-bold">{negociacoes.length}</span> negociações cadastradas
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 border-2 border-blue-500"
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
          className="w-full px-5 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm text-base text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Tabela */}
      <div className="bg-slate-700 shadow-xl rounded-2xl overflow-hidden border-2 border-slate-600">
        <table className="min-w-full divide-y divide-slate-600">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Imóvel</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Corretor</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Valor Proposta</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-slate-700 divide-y divide-slate-600">
            {filteredNegociacoes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  <div className="text-lg font-medium">{searchTerm ? 'Nenhuma negociação encontrada' : 'Nenhuma negociação cadastrada'}</div>
                  <p className="text-sm text-slate-500 mt-2">Clique em &ldquo;+ Nova Negociação&rdquo; para adicionar</p>
                </td>
              </tr>
            ) : (
              filteredNegociacoes.map((negociacao, index) => (
                <tr key={negociacao.id} className={`hover:bg-slate-600 transition-colors ${index % 2 === 0 ? 'bg-slate-700' : 'bg-slate-700/70'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-100">
                    <span className="px-2 py-1 bg-blue-900/60 text-blue-200 rounded-md font-mono text-xs border border-blue-500/50">{negociacao.codigo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                    👤 {negociacao.lead?.nome || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                    🏠 {negociacao.imovel?.titulo || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {negociacao.corretor?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100 font-bold">
                    R$ {Number(negociacao.valor_proposta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${
                      negociacao.status === 'FECHADA' ? 'bg-green-900/60 text-green-200 border-green-500/50' :
                      negociacao.status === 'CANCELADA' ? 'bg-red-900/60 text-red-200 border-red-500/50' :
                      negociacao.status === 'EM_ANDAMENTO' ? 'bg-yellow-900/60 text-yellow-200 border-yellow-500/50' :
                      'bg-blue-900/60 text-blue-200 border-blue-500/50'
                    }`}>
                      {getStatusLabel(negociacao.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(negociacao)}
                      className="text-blue-400 hover:text-blue-300 mr-4 font-bold hover:underline transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingNegociacao(negociacao);
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-400 hover:text-red-300 font-bold hover:underline transition-all"
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
        onClose={() => setModalOpen(false)}
        title={editingNegociacao ? 'Editar Negociação' : 'Nova Negociação'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente (Lead) *
              </label>
              <select
                required
                value={formData.lead_id}
                onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imóvel *
              </label>
              <select
                required
                value={formData.imovel_id}
                onChange={(e) => setFormData({ ...formData, imovel_id: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corretor
              </label>
              <select
                value={formData.corretor_id}
                onChange={(e) => setFormData({ ...formData, corretor_id: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PROPOSTA">Proposta</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="FECHADA">Fechada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor da Proposta (R$) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.valor_proposta}
                onChange={(e) => setFormData({ ...formData, valor_proposta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Final (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_final}
                onChange={(e) => setFormData({ ...formData, valor_final: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                required
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Conclusão
              </label>
              <input
                type="date"
                value={formData.data_conclusao}
                onChange={(e) => setFormData({ ...formData, data_conclusao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
            Tem certeza que deseja excluir a negociação <strong>{deletingNegociacao?.codigo}</strong>?
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

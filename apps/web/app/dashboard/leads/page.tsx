'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: 'QUENTE' | 'MORNO' | 'FRIO';
  origem?: string;
  interesse?: any;
  observacoes?: string;
}

interface LeadForm {
  nome: string;
  email: string;
  telefone: string;
  status: string;
  origem: string;
  interesse: {
    tipo_imovel: string[];
    finalidade: string;
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

  const [formData, setFormData] = useState<LeadForm>({
    nome: '',
    email: '',
    telefone: '',
    status: 'FRIO',
    origem: 'SITE',
    interesse: {
      tipo_imovel: [],
      finalidade: 'COMPRA',
    },
    observacoes: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
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
      interesse: {
        tipo_imovel: [],
        finalidade: 'COMPRA',
      },
      observacoes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      status: lead.status,
      origem: lead.origem || 'SITE',
      interesse: lead.interesse || {
        tipo_imovel: [],
        finalidade: 'COMPRA',
      },
      observacoes: lead.observacoes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead.id}`, formData);
        toast.success('Lead atualizado com sucesso!');
      } else {
        await api.post('/leads', formData);
        toast.success('Lead cadastrado com sucesso!');
      }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Leads</h2>
          <p className="text-sm text-slate-300 mt-2 font-medium">
            <span className="text-blue-400 text-lg font-bold">{leads.length}</span> leads cadastrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 border-2 border-blue-500"
          style={{
            boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
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
          className="w-full px-5 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm text-base text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Tabela */}
      <div className="bg-slate-700 shadow-xl rounded-2xl overflow-hidden border-2 border-slate-600">
        <table className="min-w-full divide-y divide-slate-600">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-slate-700 divide-y divide-slate-600">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <div className="text-lg font-medium">{searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead cadastrado'}</div>
                  <p className="text-sm text-slate-500 mt-2">Clique em &ldquo;+ Novo Lead&rdquo; para adicionar</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, index) => (
                <tr key={lead.id} className={`hover:bg-slate-600 transition-colors ${index % 2 === 0 ? 'bg-slate-700' : 'bg-slate-700/70'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-100">
                    {lead.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">{lead.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${
                        lead.status === 'QUENTE'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : lead.status === 'MORNO'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(lead)}
                      className="text-blue-400 hover:text-blue-300 mr-4 font-bold hover:underline transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingLead(lead);
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
        title={editingLead ? 'Editar Lead' : 'Novo Lead'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                required
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="FRIO">Frio</option>
                <option value="MORNO">Morno</option>
                <option value="QUENTE">Quente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
              <select
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SITE">Site</option>
                <option value="INDICACAO">Indicação</option>
                <option value="TELEFONE">Telefone</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="REDES_SOCIAIS">Redes Sociais</option>
              </select>
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
            Tem certeza que deseja excluir o lead <strong>{deletingLead?.nome}</strong>?
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

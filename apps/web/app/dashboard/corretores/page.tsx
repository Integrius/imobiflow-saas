'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';

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

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCorretor, setEditingCorretor] = useState<Corretor | null>(null);
  const [deletingCorretor, setDeletingCorretor] = useState<Corretor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    setModalOpen(true);
  };

  const openEditModal = (corretor: Corretor) => {
    setEditingCorretor(corretor);
    setFormData({
      nome: corretor.nome,
      email: corretor.email,
      telefone: corretor.telefone,
      creci: corretor.creci,
      especialidade: corretor.especialidade || '',
      comissao: corretor.comissao?.toString() || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        comissao: formData.comissao ? parseFloat(formData.comissao) : undefined,
      };

      if (editingCorretor) {
        await api.put(`/corretores/${editingCorretor.id}`, payload);
        toast.success('Corretor atualizado com sucesso!');
      } else {
        await api.post('/corretores', payload);
        toast.success('Corretor cadastrado com sucesso!');
      }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Corretores</h2>
          <p className="text-sm text-slate-300 mt-2 font-medium">
            <span className="text-blue-400 text-lg font-bold">{corretores.length}</span> corretores cadastrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 border-2 border-blue-500"
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
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">CRECI</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Comissão</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-slate-700 divide-y divide-slate-600">
            {filteredCorretores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <div className="text-lg font-medium">{searchTerm ? 'Nenhum corretor encontrado' : 'Nenhum corretor cadastrado'}</div>
                  <p className="text-sm text-slate-500 mt-2">Clique em &ldquo;+ Novo Corretor&rdquo; para adicionar</p>
                </td>
              </tr>
            ) : (
              filteredCorretores.map((corretor, index) => (
                <tr key={corretor.id} className={`hover:bg-slate-600 transition-colors ${index % 2 === 0 ? 'bg-slate-700' : 'bg-slate-700/70'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-100">
                    {corretor.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{corretor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <span className="px-2 py-1 bg-blue-900/60 text-blue-200 rounded-md font-mono text-xs font-bold border border-blue-500/50">{corretor.creci}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">{corretor.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {corretor.comissao ? (
                      <span className="px-3 py-1 bg-green-900/60 text-green-200 rounded-full font-bold text-xs border-2 border-green-500/50">
                        {corretor.comissao}%
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(corretor)}
                      className="text-blue-400 hover:text-blue-300 mr-4 font-bold hover:underline transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCorretor(corretor);
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
        title={editingCorretor ? 'Editar Corretor' : 'Novo Corretor'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CRECI *
              </label>
              <input
                type="text"
                required
                value={formData.creci}
                onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comissão (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.comissao}
                onChange={(e) => setFormData({ ...formData, comissao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidade
              </label>
              <input
                type="text"
                value={formData.especialidade}
                onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Imóveis comerciais, Apartamentos de luxo..."
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
            Tem certeza que deseja excluir o corretor <strong>{deletingCorretor?.nome}</strong>?
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

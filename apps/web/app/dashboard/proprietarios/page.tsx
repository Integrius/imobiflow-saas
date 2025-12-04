'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';

interface Proprietario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  tipo: 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
  endereco?: string;
}

interface ProprietarioForm {
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  tipo: string;
  endereco: string;
}

export default function ProprietariosPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProprietario, setEditingProprietario] = useState<Proprietario | null>(null);
  const [deletingProprietario, setDeletingProprietario] = useState<Proprietario | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<ProprietarioForm>({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    tipo: 'PESSOA_FISICA',
    endereco: '',
  });

  useEffect(() => {
    loadProprietarios();
  }, []);

  const loadProprietarios = async () => {
    try {
      const response = await api.get('/proprietarios');
      setProprietarios(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar proprietários:', error);
      toast.error('Erro ao carregar proprietários');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProprietario(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf_cnpj: '',
      tipo: 'PESSOA_FISICA',
      endereco: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (proprietario: Proprietario) => {
    setEditingProprietario(proprietario);
    setFormData({
      nome: proprietario.nome,
      email: proprietario.email,
      telefone: proprietario.telefone,
      cpf_cnpj: proprietario.cpf_cnpj,
      tipo: proprietario.tipo,
      endereco: proprietario.endereco || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingProprietario) {
        await api.put(`/proprietarios/${editingProprietario.id}`, formData);
        toast.success('Proprietário atualizado com sucesso!');
      } else {
        await api.post('/proprietarios', formData);
        toast.success('Proprietário cadastrado com sucesso!');
      }
      setModalOpen(false);
      loadProprietarios();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar proprietário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProprietario) return;
    setSubmitting(true);

    try {
      await api.delete(`/proprietarios/${deletingProprietario.id}`);
      toast.success('Proprietário excluído com sucesso!');
      setDeleteModalOpen(false);
      setDeletingProprietario(null);
      loadProprietarios();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir proprietário');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProprietarios = proprietarios.filter(
    (proprietario) =>
      proprietario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proprietario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proprietario.cpf_cnpj.includes(searchTerm)
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
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Proprietários</h2>
          <p className="text-sm text-slate-300 mt-2 font-medium">
            <span className="text-blue-400 text-lg font-bold">{proprietarios.length}</span> proprietários cadastrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 border-2 border-blue-500"
          style={{
            boxShadow: 'inset 0 -2px 4px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          + Novo Proprietário
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por nome, email ou CPF/CNPJ..."
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
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">CPF/CNPJ</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-slate-700 divide-y divide-slate-600">
            {filteredProprietarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <div className="text-lg font-medium">{searchTerm ? 'Nenhum proprietário encontrado' : 'Nenhum proprietário cadastrado'}</div>
                  <p className="text-sm text-slate-500 mt-2">Clique em &ldquo;+ Novo Proprietário&rdquo; para adicionar</p>
                </td>
              </tr>
            ) : (
              filteredProprietarios.map((proprietario, index) => (
                <tr key={proprietario.id} className={`hover:bg-slate-600 transition-colors ${index % 2 === 0 ? 'bg-slate-700' : 'bg-slate-700/70'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-100">
                    {proprietario.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{proprietario.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <span className="px-2 py-1 bg-slate-600 text-slate-200 rounded-md font-mono text-xs font-bold border border-slate-500">{proprietario.cpf_cnpj}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${
                      proprietario.tipo === 'PESSOA_FISICA'
                        ? 'bg-blue-900/60 text-blue-200 border-blue-500/50'
                        : 'bg-purple-900/60 text-purple-200 border-purple-500/50'
                    }`}>
                      {proprietario.tipo === 'PESSOA_FISICA' ? '👤 Pessoa Física' : '🏢 Pessoa Jurídica'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">{proprietario.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(proprietario)}
                      className="text-blue-400 hover:text-blue-300 mr-4 font-bold hover:underline transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingProprietario(proprietario);
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
        title={editingProprietario ? 'Editar Proprietário' : 'Novo Proprietário'}
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
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PESSOA_FISICA">Pessoa Física</option>
                <option value="PESSOA_JURIDICA">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.tipo === 'PESSOA_FISICA' ? 'CPF *' : 'CNPJ *'}
              </label>
              <input
                type="text"
                required
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={formData.tipo === 'PESSOA_FISICA' ? '000.000.000-00' : '00.000.000/0000-00'}
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

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
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
            Tem certeza que deseja excluir o proprietário <strong>{deletingProprietario?.nome}</strong>?
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

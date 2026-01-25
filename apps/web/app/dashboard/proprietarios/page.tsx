'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import { formatPhone, formatCPF, formatCNPJ, unformatNumbers } from '@/lib/formatters';

interface Proprietario {
  id: string;
  nome: string;
  cpf_cnpj: string;
  tipo_pessoa: 'FISICA' | 'JURIDICA';
  contato: {
    telefone_principal: string;
    email?: string;
  };
  endereco?: string;
  corretor?: {
    id: string;
    user: {
      nome: string;
    };
  } | null;
}

interface ProprietarioForm {
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  tipo_pessoa: string;
  endereco: string;
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

export default function ProprietariosPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProprietario, setEditingProprietario] = useState<Proprietario | null>(null);
  const [deletingProprietario, setDeletingProprietario] = useState<Proprietario | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dados' | 'imoveis'>('dados');
  const [proprietarioImoveis, setProprietarioImoveis] = useState<Imovel[]>([]);
  const [loadingImoveis, setLoadingImoveis] = useState(false);
  const [totalPropostas, setTotalPropostas] = useState(0);
  const [loadingPropostas, setLoadingPropostas] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>(null);

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const [formData, setFormData] = useState<ProprietarioForm>({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    tipo_pessoa: 'FISICA',
    endereco: '',
  });

  useEffect(() => {
    loadProprietarios();
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

  const loadProprietarios = async () => {
    try {
      const response = await api.get('/proprietarios');
      // API retorna { data: [...], meta: {...} }
      const proprietariosList = response.data.data || response.data || [];
      setProprietarios(Array.isArray(proprietariosList) ? proprietariosList : []);
    } catch (error: any) {
      console.error('Erro ao carregar proprietários:', error);
      toast.error('Erro ao carregar proprietários');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    // Aplica formatação automática para telefone e CPF/CNPJ
    if (field === 'telefone') {
      value = formatPhone(value);
    }
    if (field === 'cpf_cnpj') {
      // Aplica formatação CPF ou CNPJ dependendo do tipo de pessoa
      if (formData.tipo_pessoa === 'FISICA') {
        value = formatCPF(value);
      } else {
        value = formatCNPJ(value);
      }
    }

    setFormData({ ...formData, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges && editingProprietario) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente sair sem salvar?')) {
        setModalOpen(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setModalOpen(false);
    }
  };

  const openCreateModal = () => {
    setEditingProprietario(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf_cnpj: '',
      tipo_pessoa: 'FISICA',
      endereco: '',
    });
    setOriginalFormData(null);
    setHasUnsavedChanges(false);
    setModalOpen(true);
  };

  const loadProprietarioImoveis = async (proprietarioId: string) => {
    setLoadingImoveis(true);
    try {
      const response = await api.get(`/proprietarios/${proprietarioId}/imoveis`);
      setProprietarioImoveis(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro ao carregar imóveis do proprietário:', error);
      toast.error('Erro ao carregar imóveis');
      setProprietarioImoveis([]);
    } finally {
      setLoadingImoveis(false);
    }
  };

  const loadProprietarioPropostas = async (proprietarioId: string) => {
    setLoadingPropostas(true);
    try {
      const response = await api.get(`/proprietarios/${proprietarioId}/imoveis`);
      const imoveis = Array.isArray(response.data) ? response.data : [];

      // Buscar propostas de todos os imóveis
      let totalPropostasCount = 0;
      for (const imovel of imoveis) {
        const propostasResponse = await api.get(`/propostas/imovel/${imovel.id}`);
        const propostas = Array.isArray(propostasResponse.data) ? propostasResponse.data : [];
        totalPropostasCount += propostas.length;
      }

      setTotalPropostas(totalPropostasCount);
    } catch (error: any) {
      console.error('Erro ao carregar propostas do proprietário:', error);
      setTotalPropostas(0);
    } finally {
      setLoadingPropostas(false);
    }
  };

  const openEditModal = (proprietario: Proprietario) => {
    setEditingProprietario(proprietario);
    const formDataToSet = {
      nome: proprietario.nome,
      email: proprietario.contato?.email || '',
      telefone: formatPhone(proprietario.contato?.telefone_principal || ''),
      cpf_cnpj: proprietario.tipo_pessoa === 'FISICA'
        ? formatCPF(proprietario.cpf_cnpj)
        : formatCNPJ(proprietario.cpf_cnpj),
      tipo_pessoa: proprietario.tipo_pessoa,
      endereco: proprietario.endereco || '',
    };
    setFormData(formDataToSet);
    setOriginalFormData({ ...formDataToSet });
    setHasUnsavedChanges(false);
    setActiveTab('dados');
    setProprietarioImoveis([]);
    setTotalPropostas(0);
    setModalOpen(true);
    loadProprietarioImoveis(proprietario.id);
    loadProprietarioPropostas(proprietario.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Transformar dados do formulário para o formato da API
      const payload = {
        nome: formData.nome,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''), // Remove caracteres não numéricos
        tipo_pessoa: formData.tipo_pessoa,
        contato: {
          telefone_principal: formData.telefone.replace(/\D/g, ''),
          email: formData.email,
        },
      };

      if (editingProprietario) {
        await api.put(`/proprietarios/${editingProprietario.id}`, payload);
        toast.success('Proprietário atualizado com sucesso!');
      } else {
        await api.post('/proprietarios', payload);
        toast.success('Proprietário cadastrado com sucesso!');
      }
      setHasUnsavedChanges(false);
      setModalOpen(false);
      loadProprietarios();
    } catch (error: any) {
      console.error('Erro completo:', error);
      console.error('Resposta da API:', error.response?.data);

      // Trata erros de validação do Zod (array de erros)
      if (error.response?.data && Array.isArray(error.response.data)) {
        const zodErrors = error.response.data;
        const cpfError = zodErrors.find((e: any) => e.path?.includes('cpf_cnpj'));

        if (cpfError) {
          toast.error('CPF/CNPJ deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)');
          return;
        }

        // Mostra o primeiro erro de validação
        toast.error(zodErrors[0]?.message || 'Erro de validação dos dados');
        return;
      }

      // Captura a mensagem de erro do backend
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message;

      // Mapeamento de mensagens específicas
      if (errorMessage?.includes('CPF/CNPJ já cadastrado') ||
          errorMessage?.includes('nome e telefone')) {
        toast.error('Proprietário já cadastrado!');
      } else if (errorMessage?.includes('CPF') || errorMessage?.includes('CNPJ')) {
        toast.error('CPF/CNPJ inválido');
      } else {
        toast.error(errorMessage || 'Erro ao salvar proprietário');
      }
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
      proprietario.contato?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proprietario.cpf_cnpj.includes(searchTerm)
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
          <h2 className="text-4xl font-bold text-[#064E3B] tracking-tight">Proprietários</h2>
          <p className="text-sm text-[#374151] mt-2 font-semibold">
            <span className="text-[#00C48C] text-lg font-bold">{proprietarios.length}</span> proprietários cadastrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 btn-primary"
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
          className="input-modern"
        />
      </div>

      {/* Tabela */}
      <div className="card-clean shadow-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-600">
          <thead className="bg-gradient-to-r from-[#059669] to-[#059669]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">CPF/CNPJ</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[rgba(169,126,111,0.1)]">
            {filteredProprietarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#4B5563]">
                  <div className="text-lg font-medium">{searchTerm ? 'Nenhum proprietário encontrado' : 'Nenhum proprietário cadastrado'}</div>
                  <p className="text-sm text-[#4B5563] mt-2">Clique em &ldquo;+ Novo Proprietário&rdquo; para adicionar</p>
                </td>
              </tr>
            ) : (
              filteredProprietarios.map((proprietario, index) => (
                <tr key={proprietario.id} className={`hover:bg-[#F9FAFB] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-white/70'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#064E3B]">
                    {proprietario.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] font-medium">{proprietario.contato?.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] font-medium">
                    <span className="px-2 py-1 bg-slate-600 text-slate-200 rounded-md font-mono text-xs font-bold border border-slate-500">{proprietario.cpf_cnpj}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] font-medium">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 ${
                      proprietario.tipo_pessoa === 'FISICA'
                        ? 'bg-[#059669]/20 text-[#059669] border-[#059669]/50'
                        : 'bg-[#059669]/20 text-[#059669] border-[#059669]/50'
                    }`}>
                      {proprietario.tipo_pessoa === 'FISICA' ? '👤 Pessoa Física' : '🏢 Pessoa Jurídica'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#374151] font-semibold">{formatPhone(proprietario.contato?.telefone_principal || '')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(proprietario)}
                      className="text-[#00C48C] hover:text-[#059669] mr-4 font-bold hover:underline transition-all"
                    >
                      👁️ Consultar
                    </button>
                    <button
                      onClick={() => {
                        setDeletingProprietario(proprietario);
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
        title={editingProprietario ? 'Consultar Proprietário' : 'Novo Proprietário'}
        size="lg"
      >
        {/* Resumo de Vinculações - apenas quando editando */}
        {editingProprietario && (
          <div className="bg-gradient-to-r from-[#F0FDF4] to-[#EFF6FF] p-4 rounded-lg border-2 border-[#00C48C]/30 mb-6">
            {loadingImoveis || loadingPropostas ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00C48C]"></div>
              </div>
            ) : (
              <div className="flex items-center gap-4 justify-center">
                <div className="text-center">
                  <div className="text-xs text-[#374151] font-semibold mb-1">👤 CORRETOR</div>
                  {editingProprietario.corretor ? (
                    <div className="text-sm font-bold text-[#A97E6F]">{editingProprietario.corretor.user.nome}</div>
                  ) : (
                    <div className="text-sm text-[#9CA3AF]">Não atribuído</div>
                  )}
                </div>
                <div className="h-10 w-px bg-[#00C48C]/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#059669]">{proprietarioImoveis.length}</div>
                  <div className="text-xs text-[#374151] font-semibold">Imóveis</div>
                </div>
                <div className="h-10 w-px bg-[#00C48C]/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00C48C]">{totalPropostas}</div>
                  <div className="text-xs text-[#374151] font-semibold">Propostas</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Abas - apenas quando editando */}
        {editingProprietario && (
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
              🏘️ Imóveis ({proprietarioImoveis.length})
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
                Tipo *
              </label>
              <select
                value={formData.tipo_pessoa}
                onChange={(e) => handleFormChange('tipo_pessoa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              >
                <option value="FISICA">Pessoa Física</option>
                <option value="JURIDICA">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                {formData.tipo_pessoa === 'FISICA' ? 'CPF *' : 'CNPJ *'}
              </label>
              <input
                type="text"
                required
                value={formData.cpf_cnpj}
                onChange={(e) => handleFormChange('cpf_cnpj', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                placeholder={formData.tipo_pessoa === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'}
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
                value={formData.telefone}
                onChange={(e) => handleFormChange('telefone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#064E3B] mb-2">
                Endereço
              </label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => handleFormChange('endereco', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
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
        {activeTab === 'imoveis' && editingProprietario && (
          <div className="space-y-4">
            {loadingImoveis ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C48C]"></div>
              </div>
            ) : proprietarioImoveis.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#4B5563] text-lg">Nenhum imóvel registrado para este proprietário</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto space-y-3">
                {proprietarioImoveis.map((imovel) => (
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
                        <p className="text-[#374151] text-sm font-medium mt-1">
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
          <p className="text-[#064E3B] text-base">
            Tem certeza que deseja excluir o proprietário <strong className="text-[#059669]">{deletingProprietario?.nome}</strong>?
          </p>
          <p className="text-sm text-[#374151] font-medium">Esta ação não pode ser desfeita.</p>

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

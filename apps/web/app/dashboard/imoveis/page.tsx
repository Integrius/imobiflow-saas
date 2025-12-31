'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import ImageUpload from '@/components/ImageUpload';
import { formatCEP, formatCurrencyInput, formatCurrencyForEdit, parseCurrency, unformatNumbers } from '@/lib/formatters';

interface Imovel {
  id: string;
  titulo?: string;
  descricao?: string;
  tipo?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  valor?: number;
  preco?: number;
  caracteristicas?: {
    area_total?: number;
    area_construida?: number;
    quartos?: number;
    banheiros?: number;
    vagas_garagem?: number;
  };
  status?: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO';
  fotos?: string[];
  proprietario_id?: string;
  proprietario?: {
    nome: string;
  };
  corretor_responsavel?: {
    id: string;
    user: {
      nome: string;
    };
  };
  historico_corretores?: any[];
}

interface ImovelForm {
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  valor: string;
  area: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  status: string;
  proprietario_id: string;
  fotos: string;
}

interface Proprietario {
  id: string;
  nome: string;
}

interface Corretor {
  id: string;
  nome: string;
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [selectedCorretorId, setSelectedCorretorId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingImovel, setEditingImovel] = useState<Imovel | null>(null);
  const [deletingImovel, setDeletingImovel] = useState<Imovel | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>(null);

  const [formData, setFormData] = useState<ImovelForm>({
    titulo: '',
    descricao: '',
    tipo: 'APARTAMENTO',
    categoria: 'VENDA',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    valor: '',
    area: '',
    quartos: '',
    banheiros: '',
    vagas: '',
    status: 'DISPONIVEL',
    proprietario_id: '',
    fotos: '',
  });

  useEffect(() => {
    loadImoveis();
    loadProprietarios();
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

  const loadImoveis = async () => {
    try {
      const response = await api.get('/imoveis');
      const imoveis = response.data.data || response.data;
      setImoveis(Array.isArray(imoveis) ? imoveis : []);
    } catch (error: any) {
      console.error('Erro ao carregar imóveis:', error);
      toast.error('Erro ao carregar imóveis');
    } finally {
      setLoading(false);
    }
  };

  const loadProprietarios = async () => {
    try {
      const response = await api.get('/proprietarios');
      const proprietarios = response.data.data || response.data;
      setProprietarios(Array.isArray(proprietarios) ? proprietarios : []);
    } catch (error: any) {
      console.error('Erro ao carregar proprietários:', error);
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

  const handleFormChange = (field: string, value: any) => {
    // Aplica formatação automática para CEP e valor
    if (field === 'cep') {
      value = formatCEP(value);
    }
    if (field === 'valor') {
      value = formatCurrencyInput(value);
    }

    setFormData({ ...formData, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges && editingImovel) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente sair sem salvar?')) {
        setModalOpen(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setModalOpen(false);
    }
  };

  const openCreateModal = () => {
    setEditingImovel(null);
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'APARTAMENTO',
      categoria: 'VENDA',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      valor: '',
      area: '',
      quartos: '',
      banheiros: '',
      vagas: '',
      status: 'DISPONIVEL',
      proprietario_id: '',
      fotos: '',
    });
    setOriginalFormData(null);
    setHasUnsavedChanges(false);
    setModalOpen(true);
  };

  const openEditModal = (imovel: Imovel) => {
    setEditingImovel(imovel);
    const formDataToSet = {
      titulo: imovel.titulo || '',
      descricao: imovel.descricao || '',
      tipo: imovel.tipo || 'APARTAMENTO',
      categoria: 'VENDA',
      endereco: `${imovel.endereco?.logradouro || ''}, ${imovel.endereco?.numero || ''}`,
      cidade: imovel.endereco?.cidade || '',
      estado: imovel.endereco?.estado || '',
      cep: formatCEP(imovel.endereco?.cep || ''),
      valor: formatCurrencyForEdit(imovel.valor || imovel.preco),
      area: imovel.caracteristicas?.area_total?.toString() || '',
      quartos: imovel.caracteristicas?.quartos?.toString() || '',
      banheiros: imovel.caracteristicas?.banheiros?.toString() || '',
      vagas: imovel.caracteristicas?.vagas_garagem?.toString() || '',
      status: imovel.status || 'DISPONIVEL',
      proprietario_id: imovel.proprietario_id || '',
      fotos: imovel.fotos?.join('\n') || '',
    };
    setFormData(formDataToSet);
    setOriginalFormData({ ...formDataToSet });
    setHasUnsavedChanges(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Extrai logradouro e número do campo endereco
      const enderecoMatch = formData.endereco.match(/^(.*?),\s*(.*)$/);
      const logradouro = enderecoMatch ? enderecoMatch[1].trim() : formData.endereco;
      const numero = enderecoMatch ? enderecoMatch[2].trim() : '';

      const payload: any = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo: formData.tipo,
        categoria: formData.categoria,
        endereco: {
          logradouro,
          numero,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: unformatNumbers(formData.cep),
        },
        preco: parseCurrency(formData.valor),
        status: formData.status,
        proprietario_id: formData.proprietario_id,
        caracteristicas: {
          area_total: formData.area ? parseFloat(formData.area) : undefined,
          quartos: formData.quartos ? parseInt(formData.quartos) : undefined,
          banheiros: formData.banheiros ? parseInt(formData.banheiros) : undefined,
          vagas: formData.vagas ? parseInt(formData.vagas) : undefined,
        },
      };

      // Apenas incluir fotos quando estamos criando um novo imóvel
      if (!editingImovel) {
        payload.fotos = formData.fotos ? formData.fotos.split('\n').filter(url => url.trim()) : [];
      }

      if (editingImovel) {
        await api.put(`/imoveis/${editingImovel.id}`, payload);
        toast.success('Imóvel atualizado com sucesso!');
      } else {
        await api.post('/imoveis', payload);
        toast.success('Imóvel cadastrado com sucesso!');
      }
      setHasUnsavedChanges(false);
      setModalOpen(false);
      loadImoveis();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);

      // Mostrar erros de validação detalhados
      if (error.response?.data?.detalhes && Array.isArray(error.response.data.detalhes)) {
        const erros = error.response.data.detalhes
          .map((e: any) => `${e.campo}: ${e.mensagem}`)
          .join('\n');
        toast.error(`Erro de validação:\n${erros}`);
        console.error('Detalhes de validação:', error.response.data.detalhes);
      } else {
        toast.error(error.response?.data?.error || error.response?.data?.mensagem || 'Erro ao salvar imóvel');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingImovel) return;
    setSubmitting(true);

    try {
      await api.delete(`/imoveis/${deletingImovel.id}`);
      toast.success('Imóvel excluído com sucesso!');
      setDeleteModalOpen(false);
      setDeletingImovel(null);
      loadImoveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir imóvel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeCorretor = async (imovelId: string, corretorId: string) => {
    try {
      await api.put(`/imoveis/${imovelId}/corretor`, { corretor_id: corretorId });
      toast.success('Corretor alterado com sucesso!');
      loadImoveis();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao alterar corretor');
    }
  };

  const filteredImoveis = imoveis.filter(
    (imovel) =>
      imovel.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.endereco?.logradouro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.endereco?.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-4xl font-bold text-[#0A2540] tracking-tight">Imóveis</h2>
          <p className="text-sm text-[#4B5563] mt-2 font-medium">
            <span className="text-[#00C48C] text-lg font-bold">{imoveis.length}</span> imóveis cadastrados
          </p>
        </div>

        {/* Busca */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="🔍 Buscar por título, endereço ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary whitespace-nowrap"
        >
          + Novo Imóvel
        </button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImoveis.length === 0 ? (
          <div className="col-span-full card-clean p-12 text-center text-[#4B5563]">
            <div className="text-lg font-medium">{searchTerm ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}</div>
            <p className="text-sm text-[#4B5563] mt-2">Clique em &ldquo;+ Novo Imóvel&rdquo; para adicionar</p>
          </div>
        ) : (
          filteredImoveis.map((imovel) => (
            <div key={imovel.id} className="card-clean overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="h-56 bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center overflow-hidden relative">
                {imovel.fotos && imovel.fotos.length > 0 ? (
                  <img
                    src={imovel.fotos[0]}
                    alt={imovel.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="flex flex-col items-center justify-center h-full"><span class="text-6xl mb-2">🏠</span><span class="text-[#4B5563] font-semibold">Imagem indisponível</span></div>';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-7xl mb-3">🏠</span>
                    <span className="text-[#4B5563] font-semibold">Sem imagem</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 backdrop-blur-sm ${
                    imovel.status === 'DISPONIVEL' ? 'bg-[#00C48C]/90 text-white border-[#00C48C]' :
                    imovel.status === 'VENDIDO' ? 'bg-[#4B5563]/90 text-white border-[#4B5563]' :
                    'bg-[#FFB627]/90 text-white border-[#FFB627]'
                  }`}>
                    {imovel.status}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-[#0A2540] mb-1">
                    {imovel.titulo}
                  </h3>
                  <p className="text-xs font-semibold text-[#00C48C] uppercase tracking-wider bg-[#00C48C]/20 px-2 py-1 rounded-md inline-block border border-[#00C48C]/50">{imovel.tipo}</p>
                </div>
                <p className="text-sm text-[#4B5563] mb-1 font-medium">📍 {imovel.endereco?.logradouro}, {imovel.endereco?.numero}</p>
                <p className="text-xs text-[#4B5563] mb-4">{imovel.endereco?.cidade} - {imovel.endereco?.estado}</p>

                <div className="flex flex-wrap gap-2 text-xs text-[#0A2540] mb-4">
                  {imovel.caracteristicas?.area_total && (
                    <span className="px-2 py-1 bg-[#3B82F6]/20 rounded-md font-bold border border-[#3B82F6]/50">📐 {imovel.caracteristicas.area_total}m²</span>
                  )}
                  {imovel.caracteristicas?.quartos && (
                    <span className="px-2 py-1 bg-[#3B82F6]/20 rounded-md font-bold border border-[#3B82F6]/50">🛏️ {imovel.caracteristicas.quartos} quartos</span>
                  )}
                  {imovel.caracteristicas?.banheiros && (
                    <span className="px-2 py-1 bg-[#3B82F6]/20 rounded-md font-bold border border-[#3B82F6]/50">🚿 {imovel.caracteristicas.banheiros} banheiros</span>
                  )}
                  {imovel.caracteristicas?.vagas_garagem && (
                    <span className="px-2 py-1 bg-[#3B82F6]/20 rounded-md font-bold border border-[#3B82F6]/50">🚗 {imovel.caracteristicas.vagas_garagem} vagas</span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-[#00C48C]">
                    R$ {Number(imovel.valor || imovel.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Informações adicionais */}
                <div className="mb-4 space-y-2">
                  {/* Proprietário */}
                  <div className="text-sm">
                    <span className="font-bold text-[#0A2540]">Proprietário:</span>{' '}
                    <span className="text-[#4B5563]">{imovel.proprietario?.nome || 'Não informado'}</span>
                  </div>

                  {/* Corretor Responsável */}
                  <div className="text-sm">
                    <span className="font-bold text-[#0A2540]">Corretor Responsável:</span>
                    <select
                      value={imovel.corretor_responsavel?.id || ''}
                      onChange={(e) => handleChangeCorretor(imovel.id, e.target.value)}
                      className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Sem corretor</option>
                      {corretores.map(corretor => (
                        <option key={corretor.id} value={corretor.id}>
                          {corretor.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Botão Nova Proposta */}
                <button
                  onClick={() => window.location.href = `/dashboard/negociacoes?imovel=${imovel.id}&proprietario=${imovel.proprietario_id}&corretor=${imovel.corretor_responsavel?.id || ''}`}
                  className="w-full mb-3 px-4 py-2.5 text-sm bg-gradient-to-r from-[#FFB627] to-[#FF006E] text-white rounded-lg hover:shadow-lg font-bold transition-all"
                >
                  💼 Nova Proposta
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(imovel)}
                    className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-[#00C48C] to-[#3B82F6] text-white rounded-lg hover:shadow-lg font-bold transition-all"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => {
                      setDeletingImovel(imovel);
                      setDeleteModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF006E] font-bold transition-all"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingImovel ? 'Editar Imóvel' : 'Novo Imóvel'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => handleFormChange('titulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Tipo *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleFormChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="APARTAMENTO">Apartamento</option>
                <option value="CASA">Casa</option>
                <option value="TERRENO">Terreno</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="RURAL">Rural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="RESERVADO">Reservado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Proprietário *
              </label>
              <select
                required
                value={formData.proprietario_id}
                onChange={(e) => handleFormChange('proprietario_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {proprietarios.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Valor (R$) *
              </label>
              <input
                type="text"
                required
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => handleFormChange('valor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Endereço *
              </label>
              <input
                type="text"
                required
                value={formData.endereco}
                onChange={(e) => handleFormChange('endereco', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={formData.cidade}
                onChange={(e) => handleFormChange('cidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Estado *
              </label>
              <input
                type="text"
                required
                value={formData.estado}
                onChange={(e) => handleFormChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="UF"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                CEP *
              </label>
              <input
                type="text"
                required
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => handleFormChange('cep', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Área (m²)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.area}
                onChange={(e) => handleFormChange('area', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Quartos
              </label>
              <input
                type="number"
                min="0"
                value={formData.quartos}
                onChange={(e) => handleFormChange('quartos', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Banheiros
              </label>
              <input
                type="number"
                min="0"
                value={formData.banheiros}
                onChange={(e) => handleFormChange('banheiros', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Vagas de Garagem
              </label>
              <input
                type="number"
                min="0"
                value={formData.vagas}
                onChange={(e) => handleFormChange('vagas', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#0A2540] mb-2">
                Descrição
              </label>
              <textarea
                rows={3}
                value={formData.descricao}
                onChange={(e) => handleFormChange('descricao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              {editingImovel ? (
                <ImageUpload
                  imovelId={editingImovel.id}
                  fotos={editingImovel.fotos || []}
                  onUploadSuccess={(novaFoto) => {
                    setEditingImovel({
                      ...editingImovel,
                      fotos: [...(editingImovel.fotos || []), novaFoto]
                    });
                    toast.success('Foto enviada com sucesso!');
                    loadImoveis(); // Recarrega a lista após upload
                  }}
                  onDeleteSuccess={(index) => {
                    const novasFotos = [...(editingImovel.fotos || [])];
                    novasFotos.splice(index, 1);
                    setEditingImovel({
                      ...editingImovel,
                      fotos: novasFotos
                    });
                    toast.success('Foto removida com sucesso!');
                    loadImoveis(); // Recarrega a lista após deletar
                  }}
                  onReorderSuccess={(newOrder) => {
                    setEditingImovel({
                      ...editingImovel,
                      fotos: newOrder
                    });
                    toast.success('Fotos reordenadas com sucesso!');
                    loadImoveis(); // Recarrega a lista após reordenar
                  }}
                />
              ) : (
                <div>
                  <label className="block text-sm font-bold text-[#0A2540] mb-2">
                    URLs das Fotos (uma por linha)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.fotos}
                    onChange={(e) => handleFormChange('fotos', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-[#00C48C] bg-[#F4F6F8] text-[#0A2540]"
                    placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
                  />
                  <p className="text-xs text-[#4B5563] mt-1">
                    Adicione o imóvel primeiro para fazer upload de fotos. Ou cole URLs de imagens externas.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 text-[#3B82F6] border-2 border-[#3B82F6] rounded-lg hover:bg-[#3B82F6] hover:text-white font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#00C48C] to-[#3B82F6] text-white rounded-lg hover:shadow-lg font-bold transition-all disabled:opacity-50"
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
          <p className="text-[#0A2540] text-base">
            Tem certeza que deseja excluir o imóvel <strong className="text-[#3B82F6]">{deletingImovel?.titulo}</strong>?
          </p>
          <p className="text-sm text-[#4B5563]">Esta ação não pode ser desfeita.</p>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-6 py-2.5 text-[#3B82F6] border-2 border-[#3B82F6] rounded-lg hover:bg-[#3B82F6] hover:text-white font-bold transition-all"
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

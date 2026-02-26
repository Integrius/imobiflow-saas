'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Modal from '@/components/Modal';
import ImageUpload from '@/components/ImageUpload';
import { formatCEP, formatCurrencyInput, formatCurrencyForEdit, parseCurrency, unformatNumbers } from '@/lib/formatters';
import { Building2, MapPin, Ruler, BedDouble, Bath, Car, Briefcase, Pencil, Trash2, Link2, Home, User, ClipboardList } from 'lucide-react';

// ============================================================
// Mapa de tipos por macro categoria
// ============================================================
const TIPOS_POR_MACRO: Record<string, { value: string; label: string }[]> = {
  RESIDENCIAL: [
    { value: 'APARTAMENTO', label: 'Apartamento' },
    { value: 'CASA', label: 'Casa' },
    { value: 'SOBRADO', label: 'Sobrado' },
    { value: 'COBERTURA', label: 'Cobertura' },
    { value: 'LOFT', label: 'Loft' },
    { value: 'KITNET', label: 'Kitnet' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'FLAT', label: 'Flat / Apart-hotel' },
    { value: 'CASA_DE_VILA', label: 'Casa de Vila' },
    { value: 'EDICULA', label: 'Edícula' },
  ],
  COMERCIAL: [
    { value: 'COMERCIAL', label: 'Comercial (genérico)' },
    { value: 'SALA_COMERCIAL', label: 'Sala Comercial' },
    { value: 'LAJE_CORPORATIVA', label: 'Laje Corporativa' },
    { value: 'LOJA_RUA', label: 'Loja de Rua' },
    { value: 'LOJA_SHOPPING', label: 'Loja em Shopping' },
    { value: 'CASA_COMERCIAL', label: 'Casa Comercial' },
    { value: 'QUIOSQUE', label: 'Quiosque' },
    { value: 'GALPAO', label: 'Galpão' },
    { value: 'DEPOSITO', label: 'Depósito' },
  ],
  RURAL: [
    { value: 'RURAL', label: 'Rural (genérico)' },
    { value: 'CHACARA', label: 'Chácara' },
    { value: 'FAZENDA', label: 'Fazenda' },
    { value: 'SITIO', label: 'Sítio' },
    { value: 'HARAS', label: 'Haras' },
    { value: 'GLEBA', label: 'Gleba' },
  ],
  TERRENO: [
    { value: 'TERRENO', label: 'Terreno' },
    { value: 'LOTE_CONDOMINIO', label: 'Lote em Condomínio' },
    { value: 'LOTE_RUA', label: 'Lote de Rua' },
    { value: 'TERRENO_INDUSTRIAL', label: 'Terreno Industrial' },
    { value: 'AREA_INCORPORACAO', label: 'Área para Incorporação' },
  ],
};

const TODOS_OS_TIPOS = Object.values(TIPOS_POR_MACRO).flat();

// ============================================================
// Interfaces
// ============================================================

interface Imovel {
  id: string;
  titulo?: string;
  descricao?: string;
  tipo?: string;
  categoria?: string;
  macro_categoria?: string;
  area_util?: number;
  posicao_solar?: string;
  status_mobilia?: string;
  pe_direito?: number;
  matricula?: string;
  inscricao_imobiliaria?: string;
  coordenadas_gps?: { lat: number; lng: number };
  planta_baixa_url?: string;
  descricao_amigavel?: string;
  condominio?: number;
  iptu?: number;
  aceita_permuta?: boolean;
  exclusividade?: boolean;
  destaque?: boolean;
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
    vagas?: number;
  };
  status?: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'ALUGADO' | 'INATIVO' | 'MANUTENCAO';
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
  macro_categoria: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  valor: string;
  condominio: string;
  iptu: string;
  area: string;
  area_util: string;
  pe_direito: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  posicao_solar: string;
  status_mobilia: string;
  matricula: string;
  inscricao_imobiliaria: string;
  lat: string;
  lng: string;
  planta_baixa_url: string;
  descricao_amigavel: string;
  status: string;
  proprietario_id: string;
  fotos: string;
  aceita_permuta: boolean;
  exclusividade: boolean;
  destaque: boolean;
}

interface Proprietario {
  id: string;
  nome: string;
}

interface Corretor {
  id: string;
  nome: string;
}

const FORM_INICIAL: ImovelForm = {
  titulo: '',
  descricao: '',
  tipo: 'APARTAMENTO',
  categoria: 'VENDA',
  macro_categoria: 'RESIDENCIAL',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  valor: '',
  condominio: '',
  iptu: '',
  area: '',
  area_util: '',
  pe_direito: '',
  quartos: '',
  banheiros: '',
  vagas: '',
  posicao_solar: '',
  status_mobilia: '',
  matricula: '',
  inscricao_imobiliaria: '',
  lat: '',
  lng: '',
  planta_baixa_url: '',
  descricao_amigavel: '',
  status: 'DISPONIVEL',
  proprietario_id: '',
  fotos: '',
  aceita_permuta: false,
  exclusividade: false,
  destaque: false,
};

// ============================================================
// Component
// ============================================================

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
  const [totalPropostas, setTotalPropostas] = useState(0);
  const [loadingPropostas, setLoadingPropostas] = useState(false);

  const [formData, setFormData] = useState<ImovelForm>({ ...FORM_INICIAL });

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
    if (field === 'cep') {
      value = formatCEP(value);
    }
    if (field === 'valor' || field === 'condominio' || field === 'iptu') {
      value = formatCurrencyInput(value);
    }
    // Ao mudar macro_categoria, resetar o tipo para o primeiro da categoria
    if (field === 'macro_categoria' && value && TIPOS_POR_MACRO[value]) {
      setFormData(prev => ({
        ...prev,
        macro_categoria: value,
        tipo: TIPOS_POR_MACRO[value][0].value,
      }));
      setHasUnsavedChanges(true);
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
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
    setFormData({ ...FORM_INICIAL });
    setOriginalFormData(null);
    setHasUnsavedChanges(false);
    setModalOpen(true);
  };

  const loadImovelPropostas = async (imovelId: string) => {
    setLoadingPropostas(true);
    try {
      const response = await api.get(`/propostas/imovel/${imovelId}`);
      const propostas = Array.isArray(response.data) ? response.data : [];
      setTotalPropostas(propostas.length);
    } catch (error: any) {
      console.error('Erro ao carregar propostas do imóvel:', error);
      setTotalPropostas(0);
    } finally {
      setLoadingPropostas(false);
    }
  };

  const openEditModal = (imovel: Imovel) => {
    setEditingImovel(imovel);
    const formDataToSet: ImovelForm = {
      titulo: imovel.titulo || '',
      descricao: imovel.descricao || '',
      tipo: imovel.tipo || 'APARTAMENTO',
      categoria: imovel.categoria || 'VENDA',
      macro_categoria: imovel.macro_categoria || 'RESIDENCIAL',
      endereco: `${imovel.endereco?.logradouro || ''}, ${imovel.endereco?.numero || ''}`,
      bairro: imovel.endereco?.bairro || '',
      cidade: imovel.endereco?.cidade || '',
      estado: imovel.endereco?.estado || '',
      cep: formatCEP(imovel.endereco?.cep || ''),
      valor: formatCurrencyForEdit(imovel.valor || imovel.preco),
      condominio: imovel.condominio ? formatCurrencyForEdit(imovel.condominio) : '',
      iptu: imovel.iptu ? formatCurrencyForEdit(imovel.iptu) : '',
      area: imovel.caracteristicas?.area_total?.toString() || '',
      area_util: imovel.area_util?.toString() || '',
      pe_direito: imovel.pe_direito?.toString() || '',
      quartos: imovel.caracteristicas?.quartos?.toString() || '',
      banheiros: imovel.caracteristicas?.banheiros?.toString() || '',
      vagas: (imovel.caracteristicas?.vagas_garagem ?? imovel.caracteristicas?.vagas)?.toString() || '',
      posicao_solar: imovel.posicao_solar || '',
      status_mobilia: imovel.status_mobilia || '',
      matricula: imovel.matricula || '',
      inscricao_imobiliaria: imovel.inscricao_imobiliaria || '',
      lat: imovel.coordenadas_gps?.lat?.toString() || '',
      lng: imovel.coordenadas_gps?.lng?.toString() || '',
      planta_baixa_url: imovel.planta_baixa_url || '',
      descricao_amigavel: imovel.descricao_amigavel || '',
      status: imovel.status || 'DISPONIVEL',
      proprietario_id: imovel.proprietario_id || '',
      fotos: imovel.fotos?.join('\n') || '',
      aceita_permuta: imovel.aceita_permuta || false,
      exclusividade: imovel.exclusividade || false,
      destaque: imovel.destaque || false,
    };
    setFormData(formDataToSet);
    setOriginalFormData({ ...formDataToSet });
    setHasUnsavedChanges(false);
    setModalOpen(true);

    loadImovelPropostas(imovel.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Extrai logradouro e número do campo endereco combinado
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
          bairro: formData.bairro || undefined,
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
          vagas_garagem: formData.vagas ? parseInt(formData.vagas) : undefined,
        },
        // Flags
        aceita_permuta: formData.aceita_permuta,
        exclusividade: formData.exclusividade,
        destaque: formData.destaque,
      };

      // Macro categoria
      if (formData.macro_categoria) payload.macro_categoria = formData.macro_categoria;

      // Características físicas
      if (formData.area_util) payload.area_util = parseFloat(formData.area_util);
      if (formData.pe_direito) payload.pe_direito = parseFloat(formData.pe_direito);
      if (formData.posicao_solar) payload.posicao_solar = formData.posicao_solar;
      if (formData.status_mobilia) payload.status_mobilia = formData.status_mobilia;

      // Valores adicionais
      if (formData.condominio) payload.condominio = parseCurrency(formData.condominio);
      if (formData.iptu) payload.iptu = parseCurrency(formData.iptu);

      // Documentação
      if (formData.matricula) payload.matricula = formData.matricula;
      if (formData.inscricao_imobiliaria) payload.inscricao_imobiliaria = formData.inscricao_imobiliaria;

      // GPS
      if (formData.lat && formData.lng) {
        payload.coordenadas_gps = {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        };
      }

      // Mídia
      if (formData.planta_baixa_url) payload.planta_baixa_url = formData.planta_baixa_url;

      // IA
      if (formData.descricao_amigavel) payload.descricao_amigavel = formData.descricao_amigavel;

      // Fotos apenas na criação
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

  // Tipos disponíveis baseados na macro categoria selecionada no form
  const tiposDisponiveis = formData.macro_categoria && TIPOS_POR_MACRO[formData.macro_categoria]
    ? TIPOS_POR_MACRO[formData.macro_categoria]
    : TODOS_OS_TIPOS;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'bg-emerald-500/90 text-white border-emerald-500';
      case 'VENDIDO': return 'bg-slate-500/90 text-white border-slate-500';
      case 'ALUGADO': return 'bg-blue-500/90 text-white border-blue-500';
      case 'INATIVO': return 'bg-gray-500/90 text-white border-gray-500';
      case 'MANUTENCAO': return 'bg-orange-500/90 text-white border-orange-500';
      default: return 'bg-amber-500/90 text-white border-amber-500'; // RESERVADO
    }
  };

  const getTipoLabel = (tipo?: string) => {
    const found = TODOS_OS_TIPOS.find(t => t.value === tipo);
    return found ? found.label : tipo || '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div>
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-content tracking-tight">Imóveis</h2>
          <p className="text-sm text-content-secondary mt-1 font-semibold">
            <span className="text-brand text-lg font-bold">{imoveis.length}</span> imóveis cadastrados
          </p>
        </div>

        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por título, endereço ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-edge rounded-lg text-sm text-content bg-surface placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-brand/30"
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
          <div className="col-span-full bg-surface border border-edge-light rounded-xl p-12 text-center text-content-secondary">
            <div className="text-lg font-medium">{searchTerm ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}</div>
            <p className="text-sm text-content-tertiary mt-2">Clique em &ldquo;+ Novo Imóvel&rdquo; para adicionar</p>
          </div>
        ) : (
          filteredImoveis.map((imovel) => (
            <div key={imovel.id} className="bg-surface border border-edge-light rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="h-56 bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center overflow-hidden relative">
                {imovel.fotos && imovel.fotos.length > 0 ? (
                  <img
                    src={imovel.fotos[0]}
                    alt={imovel.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="flex flex-col items-center justify-center h-full"><span class="text-slate-300 font-semibold">Imagem indisponível</span></div>';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-300 mb-3" />
                    <span className="text-slate-300 font-semibold">Sem imagem</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 backdrop-blur-sm ${getStatusColor(imovel.status)}`}>
                    {imovel.status}
                  </span>
                </div>
                {imovel.destaque && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-400/90 text-yellow-900 border border-yellow-400">
                      Destaque
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-content mb-1">
                    {imovel.titulo}
                  </h3>
                  <p className="text-xs font-semibold text-brand uppercase tracking-wider bg-brand-light px-2 py-1 rounded-md inline-block border border-brand/30">
                    {getTipoLabel(imovel.tipo)}
                  </p>
                </div>
                <p className="text-sm text-content mb-1 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-content-tertiary" />
                  {imovel.endereco?.logradouro}, {imovel.endereco?.numero}
                  {imovel.endereco?.bairro && ` — ${imovel.endereco.bairro}`}
                </p>
                <p className="text-xs text-content-secondary font-medium mb-4">{imovel.endereco?.cidade} - {imovel.endereco?.estado}</p>

                <div className="flex flex-wrap gap-2 text-xs text-brand mb-4">
                  {imovel.caracteristicas?.area_total && (
                    <span className="px-2 py-1 bg-brand-light rounded-md font-bold border border-brand/30 flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {imovel.caracteristicas.area_total}m²</span>
                  )}
                  {imovel.caracteristicas?.quartos && (
                    <span className="px-2 py-1 bg-brand-light rounded-md font-bold border border-brand/30 flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {imovel.caracteristicas.quartos} quartos</span>
                  )}
                  {imovel.caracteristicas?.banheiros && (
                    <span className="px-2 py-1 bg-brand-light rounded-md font-bold border border-brand/30 flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {imovel.caracteristicas.banheiros} ban.</span>
                  )}
                  {(imovel.caracteristicas?.vagas_garagem || imovel.caracteristicas?.vagas) && (
                    <span className="px-2 py-1 bg-brand-light rounded-md font-bold border border-brand/30 flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {imovel.caracteristicas.vagas_garagem ?? imovel.caracteristicas.vagas} vagas</span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-brand">
                    R$ {Number(imovel.valor || imovel.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Informações adicionais */}
                <div className="mb-4 space-y-2">
                  <div className="text-sm">
                    <span className="font-bold text-content">Proprietário:</span>{' '}
                    <span className="text-content-secondary font-medium">{imovel.proprietario?.nome || 'Não informado'}</span>
                  </div>

                  <div className="text-sm">
                    <span className="font-bold text-content">Corretor Responsável:</span>
                    <select
                      value={imovel.corretor_responsavel?.id || ''}
                      onChange={(e) => handleChangeCorretor(imovel.id, e.target.value)}
                      className="ml-2 px-2 py-1 border border-edge rounded-md text-sm text-content bg-surface"
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

                <button
                  onClick={() => window.location.href = `/dashboard/negociacoes?imovel=${imovel.id}&proprietario=${imovel.proprietario_id}&corretor=${imovel.corretor_responsavel?.id || ''}`}
                  className="w-full mb-3 px-4 py-2.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5 inline" /> Nova Proposta
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(imovel)}
                    className="flex-1 px-4 py-2.5 text-sm bg-brand hover:bg-brand/90 text-white rounded-lg font-bold transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5 inline" /> Editar
                  </button>
                  <button
                    onClick={() => {
                      setDeletingImovel(imovel);
                      setDeleteModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline" /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ======================================================
          Modal de Cadastro/Edição
      ====================================================== */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingImovel ? 'Editar Imóvel' : 'Novo Imóvel'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ---- Seção 1: Identificação ---- */}
          <div>
            <h4 className="text-sm font-bold text-content-secondary uppercase tracking-wider mb-3 pb-2 border-b border-edge-light">
              Identificação
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-content mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => handleFormChange('titulo', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Macro Categoria</label>
                <select
                  value={formData.macro_categoria}
                  onChange={(e) => handleFormChange('macro_categoria', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="RESIDENCIAL">Residencial</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="RURAL">Rural</option>
                  <option value="TERRENO">Terreno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleFormChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  {tiposDisponiveis.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Categoria *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleFormChange('categoria', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  <option value="VENDA">Venda</option>
                  <option value="LOCACAO">Locação</option>
                  <option value="TEMPORADA">Temporada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="VENDIDO">Vendido</option>
                  <option value="ALUGADO">Alugado</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="MANUTENCAO">Em Manutenção</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Proprietário *</label>
                <select
                  required
                  value={formData.proprietario_id}
                  onChange={(e) => handleFormChange('proprietario_id', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {proprietarios.map((prop) => (
                    <option key={prop.id} value={prop.id}>{prop.nome}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-content mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => handleFormChange('descricao', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ---- Seção 2: Endereço ---- */}
          <div>
            <h4 className="text-sm font-bold text-content-secondary uppercase tracking-wider mb-3 pb-2 border-b border-edge-light">
              Endereço
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-content mb-1">Logradouro e Número *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.endereco}
                  onChange={(e) => handleFormChange('endereco', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleFormChange('bairro', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">CEP *</label>
                <input
                  type="text"
                  required
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => handleFormChange('cep', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Cidade *</label>
                <input
                  type="text"
                  required
                  value={formData.cidade}
                  onChange={(e) => handleFormChange('cidade', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Estado *</label>
                <input
                  type="text"
                  required
                  placeholder="UF"
                  maxLength={2}
                  value={formData.estado}
                  onChange={(e) => handleFormChange('estado', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ---- Seção 3: Características ---- */}
          <div>
            <h4 className="text-sm font-bold text-content-secondary uppercase tracking-wider mb-3 pb-2 border-b border-edge-light">
              Características
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-content mb-1">Área Total (m²)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.area}
                  onChange={(e) => handleFormChange('area', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Área Útil (m²)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.area_util}
                  onChange={(e) => handleFormChange('area_util', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Pé Direito (m)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 2.80"
                  value={formData.pe_direito}
                  onChange={(e) => handleFormChange('pe_direito', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Quartos</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quartos}
                  onChange={(e) => handleFormChange('quartos', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Banheiros</label>
                <input
                  type="number"
                  min="0"
                  value={formData.banheiros}
                  onChange={(e) => handleFormChange('banheiros', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Vagas de Garagem</label>
                <input
                  type="number"
                  min="0"
                  value={formData.vagas}
                  onChange={(e) => handleFormChange('vagas', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Posição Solar</label>
                <select
                  value={formData.posicao_solar}
                  onChange={(e) => handleFormChange('posicao_solar', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  <option value="">Não informada</option>
                  <option value="NASCENTE">Nascente</option>
                  <option value="POENTE">Poente</option>
                  <option value="NASCENTE_POENTE">Nascente e Poente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Estado de Mobília</label>
                <select
                  value={formData.status_mobilia}
                  onChange={(e) => handleFormChange('status_mobilia', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                >
                  <option value="">Não informado</option>
                  <option value="VAZIO">Vazio</option>
                  <option value="SEMIMOBILIADO">Semimobiliado</option>
                  <option value="MOBILIADO">Mobiliado</option>
                  <option value="PORTEIRA_FECHADA">Porteira Fechada</option>
                </select>
              </div>
            </div>
          </div>

          {/* ---- Seção 4: Valores ---- */}
          <div>
            <h4 className="text-sm font-bold text-content-secondary uppercase tracking-wider mb-3 pb-2 border-b border-edge-light">
              Valores
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-content mb-1">Preço (R$) *</label>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => handleFormChange('valor', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Condomínio (R$)</label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={formData.condominio}
                  onChange={(e) => handleFormChange('condominio', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">IPTU/ano (R$)</label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={formData.iptu}
                  onChange={(e) => handleFormChange('iptu', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ---- Seção 5: Documentação ---- */}
          <div>
            <h4 className="text-sm font-bold text-content-secondary uppercase tracking-wider mb-3 pb-2 border-b border-edge-light">
              Documentação
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-content mb-1">Matrícula (Cartório)</label>
                <input
                  type="text"
                  placeholder="Nº da matrícula"
                  value={formData.matricula}
                  onChange={(e) => handleFormChange('matricula', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-content mb-1">Inscrição Imobiliária (IPTU)</label>
                <input
                  type="text"
                  placeholder="Código da prefeitura"
                  value={formData.inscricao_imobiliaria}
                  onChange={(e) => handleFormChange('inscricao_imobiliaria', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ---- Seção 6: Flags ---- */}
          <div>
            <h4 className="text-sm font-bold text-content-secondary uppercase tracking-wider mb-3 pb-2 border-b border-edge-light">
              Opções
            </h4>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.aceita_permuta}
                  onChange={(e) => handleFormChange('aceita_permuta', e.target.checked)}
                  className="w-4 h-4 rounded border-edge text-brand focus:ring-brand/30"
                />
                <span className="text-sm font-semibold text-content">Aceita Permuta</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.exclusividade}
                  onChange={(e) => handleFormChange('exclusividade', e.target.checked)}
                  className="w-4 h-4 rounded border-edge text-brand focus:ring-brand/30"
                />
                <span className="text-sm font-semibold text-content">Exclusividade</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.destaque}
                  onChange={(e) => handleFormChange('destaque', e.target.checked)}
                  className="w-4 h-4 rounded border-edge text-brand focus:ring-brand/30"
                />
                <span className="text-sm font-semibold text-content">Imóvel em Destaque</span>
              </label>
            </div>
          </div>

          {/* ---- Seção 7: Descrição para IA (Sofia) ---- */}
          <div>
            <h4 className="text-sm font-bold text-content-secondary uppercase tracking-wider mb-3 pb-2 border-b border-edge-light flex items-center gap-2">
              Descrição para Anúncios (Sofia IA)
            </h4>
            <textarea
              rows={3}
              placeholder="Texto otimizado para anúncios — pode ser gerado pela Sofia"
              value={formData.descricao_amigavel}
              onChange={(e) => handleFormChange('descricao_amigavel', e.target.value)}
              className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
            />
          </div>

          {/* ---- Seção 8: Mídia ---- */}
          <div>
            <h4 className="text-sm font-bold text-content-secondary uppercase tracking-wider mb-3 pb-2 border-b border-edge-light">
              Mídia
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-content mb-1">URL da Planta Baixa</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.planta_baixa_url}
                  onChange={(e) => handleFormChange('planta_baixa_url', e.target.value)}
                  className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                />
              </div>

              {editingImovel ? (
                <ImageUpload
                  imovelId={editingImovel.id}
                  fotos={editingImovel.fotos || []}
                  onUploadSuccess={(novaFoto) => {
                    setEditingImovel({ ...editingImovel, fotos: [...(editingImovel.fotos || []), novaFoto] });
                    toast.success('Foto enviada com sucesso!');
                    loadImoveis();
                  }}
                  onDeleteSuccess={(index) => {
                    const novasFotos = [...(editingImovel.fotos || [])];
                    novasFotos.splice(index, 1);
                    setEditingImovel({ ...editingImovel, fotos: novasFotos });
                    toast.success('Foto removida com sucesso!');
                    loadImoveis();
                  }}
                  onReorderSuccess={(newOrder) => {
                    setEditingImovel({ ...editingImovel, fotos: newOrder });
                    toast.success('Fotos reordenadas com sucesso!');
                    loadImoveis();
                  }}
                />
              ) : (
                <div>
                  <label className="block text-sm font-bold text-content mb-1">URLs das Fotos (uma por linha)</label>
                  <textarea
                    rows={4}
                    value={formData.fotos}
                    onChange={(e) => handleFormChange('fotos', e.target.value)}
                    className="w-full px-3 py-2 border border-edge rounded-lg text-content bg-surface-secondary focus:ring-2 focus:ring-brand/30 focus:border-transparent"
                    placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
                  />
                  <p className="text-xs text-content-tertiary mt-1">
                    Adicione o imóvel primeiro para fazer upload de fotos. Ou cole URLs de imagens externas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ---- Vinculações (apenas editando) ---- */}
          {editingImovel && (
            <div className="space-y-4 bg-surface-secondary p-4 rounded-lg border border-edge-light">
              <h4 className="text-md font-bold text-content border-b border-edge-light pb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 inline mr-1" /> Vinculações
              </h4>

              {loadingPropostas ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface p-3 rounded-lg border border-edge-light">
                    <div className="text-xs font-bold text-content-secondary mb-1"><Home className="w-3 h-3 inline mr-1" />PROPRIETÁRIO</div>
                    {editingImovel.proprietario ? (
                      <div className="text-sm font-bold text-content">{editingImovel.proprietario.nome}</div>
                    ) : (
                      <div className="text-sm text-content-tertiary font-medium">Não informado</div>
                    )}
                  </div>

                  <div className="bg-surface p-3 rounded-lg border border-edge-light">
                    <div className="text-xs font-bold text-content-secondary mb-1"><User className="w-3 h-3 inline mr-1" />CORRETOR</div>
                    {editingImovel.corretor_responsavel ? (
                      <div className="text-sm font-bold text-content">{editingImovel.corretor_responsavel.user.nome}</div>
                    ) : (
                      <div className="text-sm text-content-tertiary font-medium">Não atribuído</div>
                    )}
                  </div>

                  <div className="bg-surface p-3 rounded-lg border border-edge-light">
                    <div className="text-xs font-bold text-content-secondary mb-1"><ClipboardList className="w-3 h-3 inline mr-1" />PROPOSTAS</div>
                    <div className="text-3xl font-bold text-brand">{totalPropostas}</div>
                    <div className="text-xs text-content-tertiary font-medium">propostas recebidas</div>
                  </div>
                </div>
              )}
            </div>
          )}

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
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-content text-base font-medium">
            Tem certeza que deseja excluir o imóvel <strong className="text-brand">{deletingImovel?.titulo}</strong>?
          </p>
          <p className="text-sm text-content-secondary font-medium">Esta ação não pode ser desfeita.</p>

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
    </div>
  );
}

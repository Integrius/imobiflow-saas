import { apiClient } from './client'

export interface Endereco {
  cep: string
  logradouro?: string
  numero: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  pais?: string
  latitude?: number
  longitude?: number
}

export interface Caracteristicas {
  quartos?: number
  suites?: number
  banheiros?: number
  vagas?: number
  area_total?: number
  area_construida?: number
  andar?: number
  mobiliado?: boolean
  aceita_pets?: boolean
  possui_elevador?: boolean
  possui_piscina?: boolean
  possui_churrasqueira?: boolean
  possui_academia?: boolean
  possui_salao_festas?: boolean
}

export interface Imovel {
  id: string
  codigo: string
  tipo: 'APARTAMENTO' | 'CASA' | 'TERRENO' | 'COMERCIAL' | 'RURAL' | 'CHACARA' | 'SOBRADO' | 'COBERTURA' | 'LOFT' | 'KITNET'
  categoria: 'VENDA' | 'LOCACAO' | 'TEMPORADA'
  status: 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'ALUGADO' | 'INATIVO' | 'MANUTENCAO'
  titulo: string
  descricao: string
  endereco: Endereco
  caracteristicas: Caracteristicas
  preco: number
  condominio?: number
  iptu?: number
  proprietario_id: string
  proprietario?: {
    id: string
    nome: string
  }
  fotos: string[]
  video_url?: string
  tour_360_url?: string
  documentos: string[]
  diferenciais: string[]
  created_at: string
  updated_at: string
  publicado_em?: string
}

export interface CreateImovelData {
  codigo?: string
  tipo: string
  categoria: string
  titulo: string
  descricao: string
  endereco: Endereco
  caracteristicas: Caracteristicas
  preco: number
  condominio?: number | null
  iptu?: number | null
  proprietario_id: string
  fotos?: string[]
  documentos?: string[]
  diferenciais?: string[]
  status?: string
}

export interface FilterImoveis {
  tipo?: string
  categoria?: string
  status?: string
  preco_min?: number
  preco_max?: number
  quartos_min?: number
  vagas_min?: number
  area_min?: number
  cidade?: string
  bairro?: string
  proprietario_id?: string
  page?: number
  limit?: number
  orderBy?: 'preco_asc' | 'preco_desc' | 'data_asc' | 'data_desc'
}

export const imoveisService = {
  async list(filters?: FilterImoveis) {
    const { data } = await apiClient.get<{ data: Imovel[]; total: number; page: number; limit: number }>(
      '/api/v1/imoveis',
      { params: filters }
    )
    return data
  },

  async getById(id: string) {
    const { data } = await apiClient.get<Imovel>(`/api/v1/imoveis/${id}`)
    return data
  },

  async create(imovel: CreateImovelData) {
    const { data } = await apiClient.post<Imovel>('/api/v1/imoveis', imovel)
    return data
  },

  async update(id: string, imovel: Partial<CreateImovelData>) {
    const { data } = await apiClient.put<Imovel>(`/api/v1/imoveis/${id}`, imovel)
    return data
  },

  async delete(id: string) {
    await apiClient.delete(`/api/v1/imoveis/${id}`)
  },
}

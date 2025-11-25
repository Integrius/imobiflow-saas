import { apiClient } from './client'

export interface Corretor {
  id: string
  user_id: string
  user?: {
    id: string
    nome: string
    email: string
    ativo: boolean
  }
  creci: string
  telefone: string
  foto_url?: string
  especializacoes: string[]
  meta_mensal?: number
  meta_anual?: number
  comissao_padrao: number
  performance_score: number
  disponibilidade?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CorretorStats {
  totalNegociacoes: number
  negociacoesAbertas: number
  negociacoesEmAndamento: number
  negociacoesFechadas: number
  totalFaturado: number
  valorTotalVendas: number
  ticketMedio: number
  taxaConversao: number
  totalLeads: number
  leadsAtivos: number
  leadsConvertidos: number
  metaMensalAtingida: number
  metaAnualAtingida: number
  negociacoesPorStatus: Record<string, number>
  evolucaoMensal: Array<{
    mes: string
    negociacoes: number
    fechamentos: number
    faturamento: number
  }>
}

export interface CreateCorretorData {
  user_id: string
  creci: string
  telefone: string
  foto_url?: string
  especializacoes?: string[]
  meta_mensal?: number
  meta_anual?: number
  comissao_padrao: number
  disponibilidade?: Record<string, unknown>
}

export interface UpdateCorretorData {
  creci?: string
  telefone?: string
  foto_url?: string
  especializacoes?: string[]
  meta_mensal?: number
  meta_anual?: number
  comissao_padrao?: number
  performance_score?: number
  disponibilidade?: Record<string, unknown>
}

export interface FilterCorretores {
  page?: number
  limit?: number
  especializacao?: string
  search?: string
  ativo?: boolean
}

export const corretoresService = {
  async list(filters?: FilterCorretores) {
    const { data } = await apiClient.get<{ data: Corretor[]; total: number; page: number; limit: number }>(
      '/api/v1/corretores',
      { params: filters }
    )
    return data
  },

  async getById(id: string) {
    const { data } = await apiClient.get<Corretor>(`/api/v1/corretores/${id}`)
    return data
  },

  async getStats(id: string) {
    const { data } = await apiClient.get<CorretorStats>(`/api/v1/corretores/${id}/stats`)
    return data
  },

  async create(corretor: CreateCorretorData) {
    const { data } = await apiClient.post<Corretor>('/api/v1/corretores', corretor)
    return data
  },

  async update(id: string, corretor: UpdateCorretorData) {
    const { data } = await apiClient.put<Corretor>(`/api/v1/corretores/${id}`, corretor)
    return data
  },

  async delete(id: string) {
    await apiClient.delete(`/api/v1/corretores/${id}`)
  },
}

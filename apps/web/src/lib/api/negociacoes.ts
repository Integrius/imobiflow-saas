import { apiClient } from './client'

export type StatusNegociacao = 'CONTATO' | 'VISITA_AGENDADA' | 'VISITA_REALIZADA' | 'PROPOSTA' | 'ANALISE_CREDITO' | 'CONTRATO' | 'FECHADO' | 'PERDIDO' | 'CANCELADO'

export interface TimelineEvent {
  tipo: string
  descricao: string
  data: string
  usuario?: string
  dados?: Record<string, unknown>
}

export interface Comissao {
  corretor_id: string
  corretor?: {
    id: string
    nome: string
  }
  percentual: number
  valor?: number
}

export interface Negociacao {
  id: string
  codigo: string
  lead_id: string
  lead?: {
    id: string
    nome: string
    telefone: string
    email?: string
  }
  imovel_id: string
  imovel?: {
    id: string
    codigo: string
    titulo: string
    preco: number
  }
  corretor_id: string
  corretor?: {
    id: string
    nome: string
  }
  status: StatusNegociacao
  valor_proposta?: number
  valor_aprovado?: number
  condicoes?: Record<string, unknown>
  comissoes: Comissao[]
  valor_comissao?: number
  documentos: string[]
  contrato_url?: string
  timeline: TimelineEvent[]
  data_proposta?: string
  data_contrato?: string
  data_fechamento?: string
  motivo_perda?: string
  created_at: string
  updated_at: string
}

export interface CreateNegociacaoData {
  lead_id: string
  imovel_id: string
  corretor_id: string
  valor_proposta?: number
  observacoes?: string
}

export interface UpdateNegociacaoData {
  status?: StatusNegociacao
  valor_proposta?: number
  valor_aprovado?: number
  condicoes?: Record<string, unknown>
  motivo_perda?: string
}

export interface AddTimelineEventData {
  tipo: 'CONTATO' | 'VISITA' | 'PROPOSTA' | 'NEGOCIACAO' | 'FECHAMENTO' | 'OBSERVACAO'
  descricao: string
  dados?: Record<string, unknown>
}

export interface AddComissaoData {
  corretor_id: string
  percentual: number
  valor?: number
}

export interface FilterNegociacoes {
  page?: number
  limit?: number
  status?: StatusNegociacao
  corretor_id?: string
  lead_id?: string
  imovel_id?: string
}

export const negociacoesService = {
  async list(filters?: FilterNegociacoes) {
    const { data } = await apiClient.get<{ data: Negociacao[]; total: number; page: number; limit: number }>(
      '/api/v1/negociacoes',
      { params: filters }
    )
    return data
  },

  async getById(id: string) {
    const { data } = await apiClient.get<Negociacao>(`/api/v1/negociacoes/${id}`)
    return data
  },

  async create(negociacao: CreateNegociacaoData) {
    const { data } = await apiClient.post<Negociacao>('/api/v1/negociacoes', negociacao)
    return data
  },

  async update(id: string, negociacao: UpdateNegociacaoData) {
    const { data } = await apiClient.put<Negociacao>(`/api/v1/negociacoes/${id}`, negociacao)
    return data
  },

  async delete(id: string) {
    await apiClient.delete(`/api/v1/negociacoes/${id}`)
  },

  async addTimelineEvent(id: string, event: AddTimelineEventData) {
    const { data } = await apiClient.post<Negociacao>(`/api/v1/negociacoes/${id}/timeline`, event)
    return data
  },

  async addComissao(id: string, comissao: AddComissaoData) {
    const { data } = await apiClient.post<Negociacao>(`/api/v1/negociacoes/${id}/comissoes`, comissao)
    return data
  },

  async getByStatus() {
    const { data } = await apiClient.get<Record<StatusNegociacao, Negociacao[]>>('/api/v1/negociacoes/board')
    return data
  },
}

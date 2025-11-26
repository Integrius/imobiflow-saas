import { api } from '@/lib/api'

export interface Negociacao {
  id: string
  codigo: string
  lead_id: string
  imovel_id: string
  corretor_id: string
  status: string
  valor_proposta?: number
  timeline: Record<string, unknown>[]
  comissoes: Record<string, unknown>[]
  created_at: string
  updated_at: string
}

export const negociacoesService = {
  async getAll(params?: { page?: number; limit?: number; status?: string; corretor_id?: string }) {
    const response = await api.get('/negociacoes', { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get(`/negociacoes/${id}`)
    return response.data
  },

  async create(data: { lead_id: string; imovel_id: string; corretor_id: string; valor_proposta?: number }) {
    const response = await api.post('/negociacoes', data)
    return response.data
  },

  async update(id: string, data: { status?: string; valor_proposta?: number }) {
    const response = await api.put(`/negociacoes/${id}`, data)
    return response.data
  },

  async delete(id: string) {
    const response = await api.delete(`/negociacoes/${id}`)
    return response.data
  },

  async addTimelineEvent(id: string, evento: { tipo: string; descricao: string; dados?: Record<string, unknown> }) {
    const response = await api.post(`/negociacoes/${id}/timeline`, evento)
    return response.data
  },

  async addComissao(id: string, comissao: { corretor_id: string; percentual: number; valor?: number }) {
    const response = await api.post(`/negociacoes/${id}/comissoes`, comissao)
    return response.data
  },
}

import { api } from '@/lib/api'

export interface Lead {
  id: string
  nome: string
  email?: string
  telefone: string
  cpf?: string
  origem: string
  temperatura: 'QUENTE' | 'MORNO' | 'FRIO'
  score: number
  interesse: Record<string, unknown>
  observacoes?: string
  corretor_id?: string
  created_at: string
  updated_at: string
}

export interface CreateLeadDTO {
  nome: string
  email?: string
  telefone: string
  cpf?: string
  origem: string
  temperatura?: 'QUENTE' | 'MORNO' | 'FRIO'
  interesse: Record<string, unknown>
  observacoes?: string
  corretor_id?: string
}

export const leadsService = {
  async getAll(params?: { page?: number; limit?: number; temperatura?: string }) {
    const response = await api.get('/leads', { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get(`/leads/${id}`)
    return response.data
  },

  async create(data: CreateLeadDTO) {
    const response = await api.post('/leads', data)
    return response.data
  },

  async update(id: string, data: Partial<CreateLeadDTO>) {
    const response = await api.put(`/leads/${id}`, data)
    return response.data
  },

  async delete(id: string) {
    const response = await api.delete(`/leads/${id}`)
    return response.data
  },

  async addTimelineEvent(id: string, evento: { tipo: string; descricao: string; dados?: Record<string, unknown> }) {
    const response = await api.post(`/leads/${id}/timeline`, evento)
    return response.data
  },
}

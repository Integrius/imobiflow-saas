import apiClient from './client'

export interface Lead {
  id: string
  nome: string
  email?: string
  telefone: string
  cpf?: string
  origem: string
  score: number
  temperatura: 'QUENTE' | 'MORNO' | 'FRIO'
  interesse?: any
  corretor_id?: string
  corretor?: any
  timeline: any[]
  created_at: string
  updated_at: string
}

export interface CreateLeadDTO {
  nome: string
  email?: string
  telefone: string
  cpf?: string
  origem: string
  interesse?: any
  corretor_id?: string
}

export interface UpdateLeadDTO {
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  origem?: string
  interesse?: any
  corretor_id?: string
}

export const leadsApi = {
  list: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/api/v1/leads', {
      params: { page, limit }
    })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/leads/${id}`)
    return response.data
  },

  create: async (data: CreateLeadDTO) => {
    const response = await apiClient.post('/api/v1/leads', data)
    return response.data
  },

  update: async (id: string, data: UpdateLeadDTO) => {
    const response = await apiClient.put(`/api/v1/leads/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/leads/${id}`)
    return response.data
  }
}

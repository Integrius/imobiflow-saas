import apiClient from './client'

export interface Lead {
  id: string
  nome: string
  email?: string
  telefone: string
  origem: string
  score: number
  temperatura: 'QUENTE' | 'MORNO' | 'FRIO'
  created_at: string
  corretor?: {
    id: string
    user: {
      name: string
    }
  }
}

export const leadsApi = {
  getAll: () => apiClient.get<Lead[]>('/api/v1/leads'),
  getById: (id: string) => apiClient.get<Lead>(`/api/v1/leads/${id}`),
  create: (data: Partial<Lead>) => apiClient.post<Lead>('/api/v1/leads', data),
  update: (id: string, data: Partial<Lead>) => apiClient.put<Lead>(`/api/v1/leads/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/leads/${id}`),
}

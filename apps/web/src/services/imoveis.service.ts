import { api } from '@/lib/api'

export interface Imovel {
  id: string
  codigo: string
  tipo: string
  categoria: 'VENDA' | 'LOCACAO' | 'TEMPORADA'
  status: string
  endereco: Record<string, unknown>
  caracteristicas: Record<string, unknown>
  titulo: string
  descricao: string
  diferenciais: string[]
  fotos: string[]
  video_url?: string
  tour_360_url?: string
  preco: number
  condominio?: number
  iptu?: number
  proprietario_id: string
  created_at: string
  updated_at: string
}

export const imoveisService = {
  async getAll(params?: { page?: number; limit?: number; tipo?: string; categoria?: string; status?: string }) {
    const response = await api.get('/imoveis', { params })
    return response.data
  },

  async getById(id: string) {
    const response = await api.get(`/imoveis/${id}`)
    return response.data
  },

  async create(data: Record<string, unknown>) {
    const response = await api.post('/imoveis', data)
    return response.data
  },

  async update(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/imoveis/${id}`, data)
    return response.data
  },

  async delete(id: string) {
    const response = await api.delete(`/imoveis/${id}`)
    return response.data
  },
}

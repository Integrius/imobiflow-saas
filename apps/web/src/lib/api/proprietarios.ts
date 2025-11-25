import { apiClient } from './client'

export interface Proprietario {
  id: string
  nome: string
  cpf_cnpj: string
  tipo_pessoa: 'FISICA' | 'JURIDICA'
  email?: string
  telefone: string
  telefone_secundario?: string
  forma_pagamento: string
  percentual_comissao: number
  created_at: string
  updated_at: string
}

export const proprietariosService = {
  async list(filters?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get<{ data: Proprietario[]; total: number }>(
      '/api/v1/proprietarios',
      { params: filters }
    )
    return data
  },

  async getById(id: string) {
    const { data } = await apiClient.get<Proprietario>(`/api/v1/proprietarios/${id}`)
    return data
  },
}

import { apiClient } from './client'

interface RegisterData {
  nome: string
  email: string
  senha: string
  creci: string
  telefone: string
}

interface LoginData {
  email: string
  senha: string
}

interface AuthResponse {
  user: {
    id: string
    nome: string
    email: string
    tipo: string
  }
  token: string
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/register', data)
    return response.data
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', data)
    return response.data
  },
}

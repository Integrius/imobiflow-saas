import { api } from '@/lib/api'

export interface LoginDTO {
  email: string
  senha: string
}

export interface RegisterDTO {
  nome: string
  email: string
  senha: string
  creci: string
  telefone: string
  tipo?: 'ADMIN' | 'CORRETOR'
  especializacoes?: string[]
  comissao_padrao?: number
}

export interface AuthResponse {
  user: {
    id: string
    nome: string
    email: string
    tipo: string
  }
  token: string
}

export const authService = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/login', data)
    return response.data
  },

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await api.post('/api/v1/auth/register', data)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
  },
}

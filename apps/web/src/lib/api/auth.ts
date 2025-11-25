import { apiClient } from './client'

interface LoginRequest {
  email: string
  senha: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    nome: string
    email: string
  }
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  }
}
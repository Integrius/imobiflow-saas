'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, type AuthResponse, type RegisterDTO } from '@/services/auth.service'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nome: string
  email: string
  tipo: string
}

interface AuthContextData {
  user: User | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  register: (data: RegisterDTO) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUserFromStorage()
  }, [])

  async function loadUserFromStorage() {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const userData = await authService.getProfile()
        setUser(userData)
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, senha: string) {
    try {
      const response: AuthResponse = await authService.login({ email, senha })
      localStorage.setItem('token', response.token)
      setUser(response.user)
      router.push('/dashboard')
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  async function register(data: RegisterDTO) {
    try {
      const response: AuthResponse = await authService.register(data)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      router.push('/dashboard')
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  function logout() {
    authService.logout()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

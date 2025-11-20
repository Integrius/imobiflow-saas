'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">ImobiFlow</h1>
            <button
              onClick={logout}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Bem-vindo, {user.nome}!</h2>
          <p className="mt-2 text-gray-600">Email: {user.email}</p>
          <p className="text-gray-600">Tipo: {user.tipo}</p>
          
          <div className="mt-6">
            <p className="text-green-600 font-medium">✅ Autenticação funcionando!</p>
            <p className="mt-2 text-sm text-gray-500">
              Dashboard completo será implementado nas próximas sprints.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

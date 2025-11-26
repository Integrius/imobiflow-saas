'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { toast } from 'sonner'
import type { RegisterDTO } from '@/services/auth.service'

export default function RegistroPage() {
  const [formData, setFormData] = useState<RegisterDTO>({
    nome: '',
    email: '',
    senha: '',
    creci: '',
    telefone: '',
    tipo: 'CORRETOR',
    especializacoes: [],
    comissao_padrao: 5,
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'comissao_padrao' ? parseFloat(value) : value,
    }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      await register(formData)
      toast.success('Conta criada com sucesso!')
    } catch (error) {
      console.error('Erro no registro:', error)
      toast.error('Erro ao criar conta. Verifique os dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            ImobiFlow
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Criar nova conta
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Preencha os dados para começar a usar o sistema
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nome completo *
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                minLength={3}
                value={formData.nome}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                E-mail *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="joao@exemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Senha *
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={formData.senha}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="creci"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                CRECI *
              </label>
              <input
                id="creci"
                name="creci"
                type="text"
                required
                minLength={5}
                value={formData.creci}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="12345-J"
              />
            </div>

            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Telefone *
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                pattern="[0-9]{10,11}"
                value={formData.telefone}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="11999999999"
              />
              <p className="mt-1 text-xs text-gray-500">
                Apenas números (10 ou 11 dígitos)
              </p>
            </div>

            <div>
              <label
                htmlFor="tipo"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tipo de conta
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="CORRETOR">Corretor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="comissao_padrao"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Comissão padrão (%)
              </label>
              <input
                id="comissao_padrao"
                name="comissao_padrao"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.comissao_padrao}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="5.0"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  Já tem uma conta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Ao criar uma conta, você concorda com nossos{' '}
          <Link href="/termos" className="text-blue-600 hover:text-blue-500">
            Termos de Serviço
          </Link>{' '}
          e{' '}
          <Link href="/privacidade" className="text-blue-600 hover:text-blue-500">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  )
}

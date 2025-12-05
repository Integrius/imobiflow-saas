'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { login } from '@/lib/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, senha });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    setError('Erro ao fazer login com Google');
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="group">
            <Image
              src="/logo.svg"
              alt="Vivoly"
              width={336}
              height={83}
              className="h-[80px] w-auto group-hover:scale-105 transition-transform filter brightness-0 invert"
            />
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Transforme sua gestão imobiliária
          </h2>
          <p className="text-blue-100 text-lg">
            Sistema completo para gerenciar leads, imóveis, negociações e muito mais.
            Tudo em um só lugar, de forma simples e eficiente.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Gestão Completa</h3>
                <p className="text-blue-100 text-sm">Leads, imóveis e negociações</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Rápido e Fácil</h3>
                <p className="text-blue-100 text-sm">Interface intuitiva</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">100% Seguro</h3>
                <p className="text-blue-100 text-sm">Seus dados protegidos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Relatórios</h3>
                <p className="text-blue-100 text-sm">Acompanhe resultados</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-100 text-sm">
          © 2025 Vivoly. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-block group">
              <Image
                src="/logo.svg"
                alt="Vivoly"
                width={302}
                height={74}
                className="h-[73px] w-auto group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-slate-700">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-100 mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-slate-400">
                Entre com suas credenciais para acessar sua conta
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-900/40 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">Ou continue com</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                locale="pt-BR"
              />
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                ← Voltar para o site
              </Link>
            </div>

            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <p className="text-xs text-slate-400 text-center mb-2">Credenciais de teste:</p>
              <p className="font-mono text-sm text-slate-300 text-center">admin@vivoly.com.br</p>
              <p className="font-mono text-sm text-slate-300 text-center">admin123</p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            Ainda não tem uma conta?{' '}
            <Link href="/#pricing" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Conheça nossos planos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

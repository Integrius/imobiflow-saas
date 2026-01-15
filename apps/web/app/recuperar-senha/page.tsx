'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getSubdomain } from '@/lib/tenant';

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'token'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const subdomain = getSubdomain();
    if (!subdomain) {
      // Redirecionar para landing page se não estiver em subdomínio
      router.push('/');
    }
  }, [router]);

  const handleSolicitarToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Por favor, informe seu email');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email: email.trim() });

      setSuccess('Se o email estiver cadastrado, você receberá um código de verificação em até 5 minutos.');
      setStep('token');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao solicitar recuperação de senha');
    } finally {
      setLoading(false);
    }
  };

  const handleResetarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!token.trim() || token.length !== 6) {
      setError('Digite o código de 6 dígitos');
      return;
    }

    if (!novaSenha || novaSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        email: email.trim(),
        token: token.trim(),
        novaSenha
      });

      setSuccess('Senha resetada com sucesso! Redirecionando para login...');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao resetar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A2540] via-[#1E3A5F] to-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#00C48C] rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#059669] rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link href="/" className="mb-12">
            <h1 className="text-5xl font-black tracking-tight">
              Imobi<span className="text-[#00C48C]">Flow</span>
            </h1>
          </Link>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Recupere seu acesso
          </h2>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Não se preocupe! Vamos te ajudar a recuperar sua senha de forma rápida e segura.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00C48C]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Código por email</h3>
                <p className="text-gray-300 text-sm">Receba um código de 6 dígitos no seu email</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00C48C]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Expira em 5 minutos</h3>
                <p className="text-gray-300 text-sm">Código válido por apenas 5 minutos por segurança</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00C48C]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Nova senha segura</h3>
                <p className="text-gray-300 text-sm">Crie uma nova senha forte para proteger sua conta</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 'email' ? '🔐 Recuperar Senha' : '🔑 Digite o Código'}
              </h2>
              <p className="text-gray-600">
                {step === 'email'
                  ? 'Informe seu email para receber o código de recuperação'
                  : 'Confira seu email e digite o código de 6 dígitos'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSolicitarToken} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all outline-none"
                    placeholder="seu@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-3 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-[#00C48C] hover:text-[#00B07D] font-medium transition-colors text-sm">
                    ← Voltar para login
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetarSenha} className="space-y-6">
                <div>
                  <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-2">
                    Código de Verificação
                  </label>
                  <input
                    id="token"
                    type="text"
                    required
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all outline-none text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Digite os 6 dígitos recebidos por email</p>
                </div>

                <div>
                  <label htmlFor="novaSenha" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      id="novaSenha"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="confirmarSenha"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-3 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetando...' : 'Resetar Senha'}
                </button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setToken('');
                      setNovaSenha('');
                      setConfirmarSenha('');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm block w-full"
                  >
                    ← Voltar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

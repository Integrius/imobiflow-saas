'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
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
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpa timeout ao desmontar componente
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Limpa erro anterior e timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError('');
    setLoading(true);

    try {
      await login({ email, senha });
      setLoading(false);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao fazer login';
      console.log('🔴 ERRO DE LOGIN:', errorMessage, '- Será exibido por 15 segundos');
      setError(errorMessage);
      setLoading(false);

      // GARANTE que a mensagem fica 15 SEGUNDOS - usa ref para prevenir limpeza prematura
      errorTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Limpando mensagem de erro após 15 segundos');
        setError('');
        errorTimeoutRef.current = null;
      }, 15000); // 15 SEGUNDOS
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    // Limpa erro anterior e timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });

      if (response.data.token) {
        // Armazenar em localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Armazenar em cookie para middleware
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

        setLoading(false);
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao fazer login com Google';
      console.log('🔴 ERRO GOOGLE OAUTH:', errorMessage, '- Será exibido por 15 segundos');
      setError(errorMessage);
      setLoading(false);

      // GARANTE que a mensagem fica 15 SEGUNDOS
      errorTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Limpando mensagem de erro Google após 15 segundos');
        setError('');
        errorTimeoutRef.current = null;
      }, 15000); // 15 SEGUNDOS
    }
  }

  function handleGoogleError() {
    // Limpa erro anterior
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    const errorMessage = 'Erro ao fazer login com Google. Tente novamente.';
    console.log('🔴 ERRO GOOGLE OAUTH (callback):', errorMessage, '- Será exibido por 15 segundos');
    setError(errorMessage);

    // GARANTE que a mensagem fica 15 SEGUNDOS
    errorTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Limpando mensagem de erro Google após 15 segundos');
      setError('');
      errorTimeoutRef.current = null;
    }, 15000); // 15 SEGUNDOS
  }

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] relative overflow-hidden">
      {/* Background Gradient Mesh - Animated */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40 animate-pulse"></div>

      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#DFF9C7] rounded-full blur-3xl opacity-50 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#F4E2CE] rounded-full blur-3xl opacity-50 animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#CBEFA9] rounded-full blur-2xl opacity-40"></div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 pl-[120px] pr-12 py-12 flex-col justify-between relative z-10">
        {/* Logo */}
        <div>
          <Link href="/" className="inline-block group">
            <Image
              src="/logo.svg"
              alt="Vivoly"
              width={336}
              height={83}
              className="h-[80px] w-auto group-hover:scale-105 transition-transform drop-shadow-lg"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-8 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-[#2C2C2C] leading-tight">
              Transforme sua{' '}
              <span className="text-gradient-accent">
                gestão imobiliária
              </span>
            </h2>
            <p className="text-xl text-[#8B7F76] leading-relaxed">
              Sistema completo para gerenciar leads, imóveis e negociações.
              Tudo em um só lugar, de forma natural e eficiente.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Feature 1 */}
            <div className="card-warm group hover:scale-105 transition-transform">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-lg flex items-center justify-center flex-shrink-0 glow-green">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#2C2C2C] font-semibold text-sm">Gestão Completa</h3>
                  <p className="text-[#8B7F76] text-xs">Leads, imóveis e negociações</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card-warm group hover:scale-105 transition-transform">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#2C2C2C] font-semibold text-sm">Rápido e Fácil</h3>
                  <p className="text-[#8B7F76] text-xs">Interface intuitiva</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card-warm group hover:scale-105 transition-transform">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#2C2C2C] font-semibold text-sm">100% Seguro</h3>
                  <p className="text-[#8B7F76] text-xs">Seus dados protegidos</p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card-warm group hover:scale-105 transition-transform">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#2C2C2C] font-semibold text-sm">Relatórios</h3>
                  <p className="text-[#8B7F76] text-xs">Acompanhe resultados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8FD14F] to-[#006D77] border-2 border-[#FAF8F5]"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF006E] to-[#8FD14F] border-2 border-[#FAF8F5]"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006D77] to-[#FF006E] border-2 border-[#FAF8F5]"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A97E6F] to-[#8FD14F] border-2 border-[#FAF8F5]"></div>
            </div>
            <div>
              <div className="text-[#2C2C2C] font-semibold text-sm">500+ imobiliárias</div>
              <div className="text-[#8B7F76] text-xs">confiam no Vivoly</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[#8B7F76] text-sm">
          © 2025 Vivoly. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-md w-full animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-block group">
              <Image
                src="/logo.svg"
                alt="Vivoly"
                width={302}
                height={74}
                className="h-[73px] w-auto group-hover:scale-105 transition-transform mx-auto drop-shadow-lg"
              />
            </Link>
          </div>

          {/* Glass Card */}
          <div className="glass-card p-8 animate-slide-up">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#2C2C2C] mb-2">
                Bem-vindo de volta ✨
              </h2>
              <p className="text-[#8B7F76]">
                Entre com suas credenciais para acessar sua conta
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] text-[#FF6B6B] px-4 py-3 rounded-xl flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-modern"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-semibold text-[#2C2C2C] mb-2">
                  Senha
                </label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="input-modern"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#A97E6F] text-[#8FD14F] focus:ring-[#8FD14F] focus:ring-offset-0"
                  />
                  <span className="text-[#8B7F76]">Lembrar-me</span>
                </label>
                <Link href="/recuperar-senha" className="text-[#7FB344] hover:text-[#8FD14F] font-medium transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(169,126,111,0.2)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#FAF8F5] text-[#8B7F76]">ou continue com</span>
              </div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
                locale="pt-BR"
              />
            </div>

            {/* Sign up link */}
            <div className="mt-8 text-center">
              <p className="text-[#8B7F76] text-sm">
                Ainda não tem uma conta?{' '}
                <Link href="/register" className="text-[#7FB344] hover:text-[#8FD14F] font-semibold transition-colors">
                  Criar conta grátis →
                </Link>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#8B7F76]">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Criptografado</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(10px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

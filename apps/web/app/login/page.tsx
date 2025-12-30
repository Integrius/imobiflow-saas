'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { login, loginWithGoogle, getLastTenant, getLastLoginMethod } from '@/lib/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubdomain, setIsSubdomain] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar se está acessando via subdomínio e verificar cookie de último tenant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');

      // Se tem 3 ou mais partes e não é localhost, é um subdomínio
      const hasSubdomain = parts.length >= 3 && !hostname.includes('localhost');
      setIsSubdomain(hasSubdomain);

      // Se NÃO está em subdomínio (está no domínio base integrius.com.br)
      // Verificar se tem cookie de último tenant usado
      if (!hasSubdomain) {
        const lastTenant = getLastTenant();
        const lastMethod = getLastLoginMethod();

        if (lastTenant) {
          // Redirecionar para o subdomínio do último tenant usado
          console.log(`🔄 Redirecionando para último tenant usado: ${lastTenant} (método: ${lastMethod})`);

          // Construir URL do tenant
          const tenantUrl = `${window.location.protocol}//${lastTenant}.${hostname}`;
          window.location.href = tenantUrl;
        }
      } else {
        // Se está em subdomínio, validar se o tenant existe
        const subdomain = parts[0];

        // Validar se tenant existe antes de permitir login
        (async () => {
          try {
            await api.get(`/tenants/by-subdomain/${subdomain}`);
            // Tenant válido, pode continuar
            console.log(`✅ Tenant "${subdomain}" encontrado e válido`);
          } catch (error: any) {
            if (error.response?.status === 404) {
              setError(`A imobiliária "${subdomain}" não foi encontrada.`);
              console.error(`❌ Tenant "${subdomain}" não encontrado`);

              // Redirecionar para domínio base após 3 segundos
              setTimeout(() => {
                console.log('🔄 Redirecionando para domínio base...');
                window.location.href = 'https://integrius.com.br';
              }, 3000);
            }
          }
        })();
      }
    }
  }, []);

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

      // GARANTE que a mensagem fica 15 SEGUNDOS
      errorTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Limpando mensagem de erro após 15 segundos');
        setError('');
        errorTimeoutRef.current = null;
      }, 15000);
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
      if (!credentialResponse.credential) {
        throw new Error('Credencial do Google não recebida');
      }

      await loginWithGoogle(credentialResponse.credential);
      setLoading(false);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.error || 'Erro ao fazer login com Google';
      console.log('🔴 ERRO GOOGLE OAUTH:', errorMessage, '- Será exibido por 15 segundos');
      setError(errorMessage);
      setLoading(false);

      // GARANTE que a mensagem fica 15 SEGUNDOS
      errorTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Limpando mensagem de erro Google após 15 segundos');
        setError('');
        errorTimeoutRef.current = null;
      }, 15000);
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
    }, 15000);
  }

  return (
    <div className="min-h-screen flex bg-white relative overflow-hidden">
      {/* Subtle background decoration - Tech Clean Premium */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C48C]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3B82F6]/5 rounded-full blur-3xl"></div>

      {/* Left side - Branding - Tech Clean Premium */}
      <div className="hidden lg:flex lg:w-1/2 px-16 py-12 flex-col justify-between relative z-10 bg-gradient-to-br from-[#F4F6F8] to-white">
        {/* Logo */}
        <div>
          <Link href="/" className="inline-block group">
            <Image
              src="/logo.svg"
              alt="ImobiFlow"
              width={336}
              height={83}
              className="h-16 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-8 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-[#0A2540] leading-tight">
              Integração inteligente para{' '}
              <span className="text-[#00C48C]">
                processos imobiliários
              </span>
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Sistema completo para gerenciar leads, imóveis e negociações. Tudo em um só lugar, de forma profissional e eficiente.
            </p>
          </div>

          {/* Features Grid - Tech Clean Premium */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-[#00C48C] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#0A2540] font-semibold text-sm">Gestão Completa</h3>
                  <p className="text-gray-600 text-xs">Leads, imóveis e negociações</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#0A2540] font-semibold text-sm">Rápido e Fácil</h3>
                  <p className="text-gray-600 text-xs">Interface intuitiva</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-[#0A2540] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#0A2540] font-semibold text-sm">100% Seguro</h3>
                  <p className="text-gray-600 text-xs">Seus dados protegidos</p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-[#00C48C] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[#0A2540] font-semibold text-sm">Relatórios</h3>
                  <p className="text-gray-600 text-xs">Acompanhe resultados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof - Clean */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C48C] to-[#3B82F6] border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#00C48C] border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A2540] to-[#00C48C] border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C48C] to-[#0A2540] border-2 border-white"></div>
            </div>
            <div>
              <div className="text-[#0A2540] font-semibold text-sm">500+ imobiliárias</div>
              <div className="text-gray-600 text-xs">confiam no ImobiFlow</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-gray-500 text-sm">
          © 2025 ImobiFlow. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Login Form - Tech Clean Premium */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-block group">
              <Image
                src="/logo.svg"
                alt="ImobiFlow"
                width={302}
                height={74}
                className="h-12 w-auto group-hover:scale-105 transition-transform mx-auto"
              />
            </Link>
          </div>

          {/* Form Card - Clean Style */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-gray-600">
                Entre com suas credenciais para acessar sua conta
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#0A2540] mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all outline-none"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-semibold text-[#0A2540] mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C48C] focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0A2540] transition-colors p-1"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.757 6.757M9.878 9.878L3 3m11.757 11.757l3.121 3.121m0 0l3.121-3.121m-3.121 3.121L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#00C48C] focus:ring-[#00C48C] focus:ring-offset-0"
                  />
                  <span className="text-gray-600">Lembrar-me</span>
                </label>
                <Link href="/recuperar-senha" className="text-[#00C48C] hover:text-[#00B07D] font-medium transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou continue com</span>
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
              {isSubdomain ? (
                <div className="space-y-3">
                  <div className="bg-[#00C48C]/10 border-2 border-[#00C48C]/30 rounded-lg p-4">
                    <p className="text-[#0A2540] text-sm font-medium mb-2">
                      Deseja cadastrar um novo corretor ou imobiliária?
                    </p>
                    <a
                      href="https://integrius.com.br/register"
                      className="inline-flex items-center gap-2 text-[#00C48C] hover:text-[#00B07D] font-semibold transition-colors text-sm"
                    >
                      Cadastre-se no domínio principal
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  Ainda não tem uma conta?{' '}
                  <Link href="/register" className="text-[#00C48C] hover:text-[#00B07D] font-semibold transition-colors">
                    Criar conta grátis →
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Trust badges - Clean */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Criptografado</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

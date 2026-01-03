'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getToken } from '@/lib/auth';
import ChristmasFloat from '@/components/ChristmasFloat';
import { landingConfig } from '@/config/landing';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se realmente tem um token válido
    const token = getToken();
    const hasValidToken = !!token && token.trim() !== '';

    console.log('[Landing Page] Token check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      isAuthenticated: hasValidToken
    });

    setIsAuthenticated(hasValidToken);
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Christmas Floating Santa */}
      <ChristmasFloat />

      {/* Navigation - Tech Clean Premium */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                <Image
                  src="/logo.svg"
                  alt="ImobiFlow"
                  width={302}
                  height={74}
                  priority
                  className="h-12 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#buscar-imovel" className="text-[#0A2540] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Buscar Imóvel
              </a>
              <a href="#para-corretores" className="text-[#0A2540] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Para Corretores
              </a>
              <a href="#features" className="text-[#0A2540] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Recursos
              </a>
              <a href="#pricing" className="text-[#0A2540] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Planos
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 text-[#0A2540] hover:text-[#00C48C] transition-colors font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Tech Clean Premium */}
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-[#F4F6F8] to-white overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C48C]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3B82F6]/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C48C]/10 border border-[#00C48C]/20 rounded-full text-[#0A2540] text-sm font-medium">
                <span className="w-2 h-2 bg-[#00C48C] rounded-full animate-pulse"></span>
                Sistema Multi-Tenant Inteligente
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-bold text-[#0A2540] leading-tight">
                Integração inteligente para
                <span className="block text-[#00C48C] mt-2">
                  processos imobiliários eficientes
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-700 leading-relaxed">
                Simplificamos sistemas, dados e operações para sua imobiliária crescer com segurança e performance. Aumente suas vendas com automação inteligente.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Começar Grátis
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                <Link
                  href="/login"
                  className="px-8 py-4 bg-transparent border-2 border-[#0A2540] text-[#0A2540] rounded-lg hover:bg-[#0A2540] hover:text-white transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2"
                >
                  Entrar
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  14 dias grátis
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sem cartão
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cancele quando quiser
                </div>
              </div>
            </div>

            {/* Right Column - Image/Illustration */}
            <div className="relative hidden md:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-8 border border-gray-100">
                <div className="relative aspect-square flex items-center justify-center">
                  <Image
                    src={landingConfig.hero.imagePath}
                    alt={landingConfig.hero.imageAlt}
                    width={landingConfig.hero.imageWidth}
                    height={landingConfig.hero.imageHeight}
                    priority
                    className="object-contain w-full h-full max-w-md mx-auto hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Floating Stats Cards - Clean Style */}
                <div className="absolute top-8 -left-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="text-[#00C48C] text-sm font-semibold">↑ 247%</div>
                  <div className="text-gray-600 text-xs">Conversão</div>
                </div>

                <div className="absolute bottom-8 -right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="text-[#0A2540] text-sm font-semibold">1,234</div>
                  <div className="text-gray-600 text-xs">Leads ativos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-16 px-6 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-200">
              <div className="text-5xl font-bold text-[#0A2540] mb-2">500+</div>
              <div className="text-gray-600 font-medium">Imobiliárias Atendidas</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-200">
              <div className="text-5xl font-bold text-[#0A2540] mb-2">10.000+</div>
              <div className="text-gray-600 font-medium">Negócios Fechados</div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-200">
              <div className="text-5xl font-bold text-[#0A2540] mb-2">98%</div>
              <div className="text-gray-600 font-medium">Satisfação dos Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Tech Clean Premium */}
      <section id="features" className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-4">
              Tudo que você precisa para crescer
            </h2>
            <p className="text-xl text-gray-700">
              Ferramentas profissionais para cada etapa do seu processo imobiliário
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#00C48C] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0A2540] mb-3">Gestão de Leads</h3>
              <p className="text-gray-600 leading-relaxed">
                Capture, organize e acompanhe todos os seus leads em um só lugar. Nunca mais perca uma oportunidade.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#3B82F6] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0A2540] mb-3">Catálogo de Imóveis</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize seu portfólio com fotos, detalhes e disponibilidade em tempo real.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#0A2540] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0A2540] mb-3">Controle de Negociações</h3>
              <p className="text-gray-600 leading-relaxed">
                Acompanhe propostas, contratos e negociações de forma simples e organizada.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#00C48C] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0A2540] mb-3">Relatórios e Análises</h3>
              <p className="text-gray-600 leading-relaxed">
                Dashboards intuitivos com métricas em tempo real para acompanhar seu desempenho.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#3B82F6] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0A2540] mb-3">Gestão de Equipe</h3>
              <p className="text-gray-600 leading-relaxed">
                Gerencie corretores, comissões e desempenho individual de forma transparente.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#0A2540] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0A2540] mb-3">Segurança Total</h3>
              <p className="text-gray-600 leading-relaxed">
                Seus dados protegidos com criptografia de ponta e backup automático na nuvem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Tech Clean Premium */}
      <section id="pricing" className="relative py-24 px-6 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-4">
              Planos que cabem no seu orçamento
            </h2>
            <p className="text-xl text-gray-700">
              Escolha o plano ideal para o seu negócio. Teste grátis por 14 dias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#0A2540] mb-2">Básico</h3>
                <p className="text-gray-600">Para corretores iniciantes</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#0A2540] mb-2">R$ 97</div>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Até 50 leads</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Até 30 imóveis</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">1 usuário</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Suporte por email</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center px-8 py-3 bg-transparent border-2 border-[#0A2540] text-[#0A2540] rounded-lg hover:bg-[#0A2540] hover:text-white transition-all duration-200 font-semibold"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Profissional - DESTACADO */}
            <div className="bg-gradient-to-br from-[#00C48C] to-[#00B07D] rounded-2xl p-8 transform md:scale-105 shadow-2xl text-white relative">
              {/* Badge Mais Popular */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 bg-[#0A2540] text-white rounded-full text-sm font-bold shadow-lg">
                  MAIS POPULAR
                </div>
              </div>

              <div className="text-center mb-6 mt-4">
                <h3 className="text-2xl font-bold mb-2">Profissional</h3>
                <p className="text-white/90">Para imobiliárias em crescimento</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold mb-2">R$ 197</div>
                <span className="text-white/90">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Leads ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Imóveis ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Até 5 usuários</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Relatórios avançados</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center px-8 py-3 bg-white text-[#00C48C] rounded-lg hover:bg-gray-50 transition-all duration-200 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Enterprise */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#0A2540] mb-2">Enterprise</h3>
                <p className="text-gray-600">Para grandes imobiliárias</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#0A2540] mb-2">R$ 397</div>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Tudo do Profissional</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Usuários ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Suporte 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">API customizada</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center px-8 py-3 bg-transparent border-2 border-[#0A2540] text-[#0A2540] rounded-lg hover:bg-[#0A2540] hover:text-white transition-all duration-200 font-semibold"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Para Leads - Buscar Imóvel */}
      <section id="buscar-imovel" className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C48C]/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C48C]/10 border border-[#00C48C]/20 rounded-full text-[#0A2540] text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-[#00C48C] rounded-full animate-pulse"></span>
              Encontre seu imóvel ideal
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#0A2540] mb-6 leading-tight">
              Procurando um imóvel perfeito?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Preencha o formulário abaixo e receba sugestões personalizadas por email e WhatsApp
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <LeadCaptureForm />
          </div>
        </div>
      </section>

      {/* CTA Para Corretores */}
      <section id="para-corretores" className="relative py-24 px-6 bg-gradient-to-br from-[#0A2540] to-[#0A2540]/90 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Para Corretores e Imobiliárias
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Transforme sua gestão com inteligência artificial
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Plataforma completa que une leads, imóveis, negociações e IA em um só lugar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">IA Sofia</h3>
              <p className="text-white/80">
                Nossa inteligência artificial analisa leads, qualifica clientes e sugere os melhores imóveis automaticamente.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Dashboard BI</h3>
              <p className="text-white/80">
                Visualize métricas em tempo real, tendências de vendas e performance da equipe.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Automação Total</h3>
              <p className="text-white/80">
                Automatize captação de leads, distribuição, follow-ups. Foque em fechar negócios.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-[#0A2540] rounded-lg hover:bg-gray-50 transition-all duration-200 font-bold text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1"
            >
              Começar Grátis Agora
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Tech Clean Premium */}
      <footer className="py-12 px-6 bg-[#0A2540] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Image
                  src="/logo.svg"
                  alt="ImobiFlow"
                  width={269}
                  height={66}
                  className="h-12 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Gestão imobiliária inteligente para transformar seu negócio.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Planos</a></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 ImobiFlow. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

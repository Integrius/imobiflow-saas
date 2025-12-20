'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getToken } from '@/lib/auth';
import ChristmasFloat from '@/components/ChristmasFloat';
import { landingConfig } from '@/config/landing';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      router.push('/dashboard');
    }
  }, [router]);

  // Não renderizar a landing page se o usuário está autenticado
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FD14F]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative">
      {/* Christmas Floating Santa */}
      <ChristmasFloat />

      {/* Background Gradient Mesh - Animated */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40"></div>

      {/* Navigation - Modernizado com glassmorphism */}
      <nav className="fixed w-full z-50 glass-card border-b border-[rgba(169,126,111,0.15)] shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                <Image
                  src="/logo.svg"
                  alt="Vivoly"
                  width={302}
                  height={74}
                  priority
                  className="h-16 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors font-medium text-sm">
                Recursos
              </a>
              <a href="#pricing" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors font-medium text-sm">
                Planos
              </a>
              <a href="#contact" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors font-medium text-sm">
                Contato
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 text-[#2C2C2C] hover:text-[#8FD14F] transition-all font-semibold text-base border-2 border-[#8FD14F] rounded-full hover:bg-[#8FD14F] hover:text-white hover:shadow-lg hover:scale-105"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="btn-primary"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Two Column Layout */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 px-6">
        {/* Floating Shapes - Organic Blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#DFF9C7] rounded-full blur-3xl opacity-50 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#F4E2CE] rounded-full blur-3xl opacity-40 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-[#A3DB6D] rounded-full blur-3xl opacity-30 animate-float"></div>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Coluna Esquerda - Copy */}
            <div className="space-y-8 animate-slide-up">
              {/* Badge de Novidade */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#DFF9C7]/30 border border-[#8FD14F]/30 rounded-full text-[#6E9B3B] text-sm font-medium">
                <span className="w-2 h-2 bg-[#8FD14F] rounded-full animate-pulse"></span>
                Novo: Sistema Multi-Tenant com Subdomínios
              </div>

              {/* Headline com Gradient */}
              <h1 className="text-5xl md:text-6xl font-bold text-[#2C2C2C] leading-tight">
                Gestão Imobiliária
                <span className="block text-gradient-accent pb-2">
                  Simples e Inteligente
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-[#8B7F76] leading-relaxed">
                Centralize leads, imóveis, negociações e mais em uma plataforma
                moderna. Aumente suas vendas em até 300% com automação inteligente.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="group btn-primary text-lg flex items-center justify-center gap-2"
                >
                  Começar Grátis
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                <a
                  href="#features"
                  className="px-8 py-4 bg-[#A97E6F] text-white rounded-xl font-bold text-lg border-2 border-[#8B6F5C] hover:bg-[#8B6F5C] hover:border-[#6F5A4A] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver Demo
                </a>
              </div>

              {/* Social Proof Inline */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8FD14F] to-[#006D77] border-2 border-[#FAF8F5]"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8FD14F] to-[#FF006E] border-2 border-[#FAF8F5]"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A97E6F] to-[#C7A695] border-2 border-[#FAF8F5]"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006D77] to-[#00A8B5] border-2 border-[#FAF8F5]"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFB627] to-[#FF6B6B] border-2 border-[#FAF8F5]"></div>
                </div>
                <div>
                  <div className="text-[#2C2C2C] font-semibold">500+ imobiliárias</div>
                  <div className="text-[#8B7F76] text-sm">confiam no Vivoly</div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 text-sm text-[#8B7F76]">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  14 dias grátis
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cancele quando quiser
                </div>
              </div>
            </div>

            {/* Coluna Direita - Imagem Hero */}
            <div className="relative hidden md:block animate-fade-in">
              <div className="relative glass-card rounded-2xl overflow-hidden shadow-2xl glow-green p-8">
                {/* Imagem configurável - gerenciável via config/landing.ts */}
                <div className="relative aspect-square flex items-center justify-center">
                  <Image
                    src={landingConfig.hero.imagePath}
                    alt={landingConfig.hero.imageAlt}
                    width={landingConfig.hero.imageWidth}
                    height={landingConfig.hero.imageHeight}
                    priority
                    className="object-contain w-full h-full max-w-md mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Floating Stats Cards */}
                <div className="absolute top-4 -left-4 glass-card rounded-xl p-4 shadow-xl">
                  <div className="text-[#8FD14F] text-sm font-semibold">↑ 247%</div>
                  <div className="text-[#8B7F76] text-xs">Conversão</div>
                </div>

                <div className="absolute bottom-4 -right-4 glass-card rounded-xl p-4 shadow-xl">
                  <div className="text-[#006D77] text-sm font-semibold">1,234</div>
                  <div className="text-[#8B7F76] text-xs">Leads ativos</div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#8FD14F]/20 to-[#006D77]/20 rounded-2xl blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row Abaixo do Hero */}
      <section className="relative py-12 px-6 bg-[#F4EFE9] border-y border-[rgba(169,126,111,0.15)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center card-warm group hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-gradient mb-2">500+</div>
              <div className="text-[#8B7F76] font-medium">Imobiliárias Atendidas</div>
            </div>
            <div className="text-center card-warm group hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-gradient mb-2">10.000+</div>
              <div className="text-[#8B7F76] font-medium">Negócios Fechados</div>
            </div>
            <div className="text-center card-warm group hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-gradient mb-2">98%</div>
              <div className="text-[#8B7F76] font-medium">Satisfação dos Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modernizada */}
      <section id="features" className="relative py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4">
              Tudo que você precisa para
              <span className="block text-gradient">
                dominar o mercado
              </span>
            </h2>
            <p className="text-xl text-[#8B7F76]">
              Ferramentas poderosas para cada etapa do seu processo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Gestão de Leads */}
            <div className="group card-warm hover:-translate-y-1">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg glow-green">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Gestão de Leads</h3>
                <p className="text-[#8B7F76] mb-4 leading-relaxed">
                  Capture, organize e acompanhe todos os seus leads em um só lugar. Nunca mais perca uma oportunidade.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#7FB344] hover:text-[#6E9B3B] font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 2 - Catálogo de Imóveis */}
            <div className="group card-warm hover:-translate-y-1">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#A97E6F] to-[#C7A695] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Catálogo de Imóveis</h3>
                <p className="text-[#8B7F76] mb-4 leading-relaxed">
                  Organize seu portfólio com fotos, detalhes e disponibilidade de todos os imóveis em tempo real.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#7FB344] hover:text-[#6E9B3B] font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 3 - Controle de Negociações */}
            <div className="group card-warm hover:-translate-y-1">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FFB627] to-[#FF6B6B] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Controle de Negociações</h3>
                <p className="text-[#8B7F76] mb-4 leading-relaxed">
                  Acompanhe todas as propostas, contratos e negociações de forma simples e organizada.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#7FB344] hover:text-[#6E9B3B] font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 4 - Relatórios e Análises */}
            <div className="group card-warm hover:-translate-y-1">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8FD14F] to-[#FF006E] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg glow-pink">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Relatórios e Análises</h3>
                <p className="text-[#8B7F76] mb-4 leading-relaxed">
                  Dashboards intuitivos com métricas em tempo real para acompanhar o desempenho do seu negócio.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#7FB344] hover:text-[#6E9B3B] font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 5 - Gestão de Corretores */}
            <div className="group card-warm hover:-translate-y-1">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#006D77] to-[#00A8B5] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Gestão de Corretores</h3>
                <p className="text-[#8B7F76] mb-4 leading-relaxed">
                  Gerencie sua equipe de corretores, comissões e desempenho individual de forma transparente.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#7FB344] hover:text-[#6E9B3B] font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 6 - Segurança Total */}
            <div className="group card-warm hover:-translate-y-1">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#8B6F5C] to-[#A97E6F] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Segurança Total</h3>
                <p className="text-[#8B7F76] mb-4 leading-relaxed">
                  Seus dados protegidos com criptografia de ponta e backup automático na nuvem.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-[#7FB344] hover:text-[#6E9B3B] font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#F4EFE9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4">
              Como Funciona?
            </h2>
            <p className="text-xl text-[#8B7F76] max-w-2xl mx-auto">
              Em apenas 3 passos, você está pronto para transformar sua gestão imobiliária
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl glow-green">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">Cadastre-se Grátis</h3>
              <p className="text-[#8B7F76]">
                Crie sua conta em menos de 2 minutos. Sem cartão de crédito, sem complicação.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#A97E6F] to-[#C7A695] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">Configure Seu Sistema</h3>
              <p className="text-[#8B7F76]">
                Adicione seus imóveis, corretores e comece a organizar seus leads imediatamente.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFB627] to-[#FF6B6B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">Feche Mais Negócios</h3>
              <p className="text-[#8B7F76]">
                Acompanhe tudo em tempo real e veja seus resultados crescerem mês a mês.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Modernizada */}
      <section id="pricing" className="relative py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4">
              Planos que
              <span className="block text-gradient">
                cabem no seu bolso
              </span>
            </h2>
            <p className="text-xl text-[#8B7F76]">
              Escolha o plano ideal para o seu negócio. Teste grátis por 14 dias, sem cartão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <div className="relative card-warm flex flex-col hover:scale-105 transition-transform">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#2C2C2C] mb-2">Básico</h3>
                <p className="text-[#8B7F76]">Para corretores iniciantes</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#2C2C2C] mb-2">
                  R$ 97
                </div>
                <span className="text-[#8B7F76]">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">Até 50 leads</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">Até 30 imóveis</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">1 usuário</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">Suporte por email</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="btn-secondary w-full text-center"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Profissional - DESTACADO */}
            <div className="relative p-8 bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-2xl transform md:scale-105 shadow-2xl glow-green-strong flex flex-col">
              {/* Badge Mais Popular */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 bg-gradient-to-r from-[#FFB627] to-[#FF6B6B] text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  MAIS POPULAR
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Profissional</h3>
                <p className="text-white/90">Para imobiliárias em crescimento</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2">
                  R$ 197
                </div>
                <span className="text-white/90">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Leads ilimitados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Imóveis ilimitados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Até 5 usuários</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Suporte prioritário</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Relatórios avançados</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3.5 px-6 bg-white text-[#006D77] rounded-xl hover:bg-[#FAF8F5] transition-all font-bold text-center shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Enterprise */}
            <div className="relative card-warm flex flex-col hover:scale-105 transition-transform">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#2C2C2C] mb-2">Enterprise</h3>
                <p className="text-[#8B7F76]">Para grandes imobiliárias</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#2C2C2C] mb-2">
                  R$ 397
                </div>
                <span className="text-[#8B7F76]">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">Tudo do Profissional</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">Usuários ilimitados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">Suporte 24/7</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">Treinamento personalizado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#8FD14F] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#2C2C2C]">API customizada</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="btn-secondary w-full text-center"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Integrações */}
      <section className="py-16 px-6 bg-[#F4EFE9] border-y border-[rgba(169,126,111,0.15)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#8B7F76] uppercase tracking-wider mb-3">
              Integrado com os principais portais
            </p>
            <h3 className="text-2xl font-bold text-[#2C2C2C]">
              Sincronize seus imóveis automaticamente
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-80">
            {/* ZAP Imóveis */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-white rounded-xl border border-[rgba(169,126,111,0.15)] group-hover:border-[#8FD14F]/50 transition-all duration-300 group-hover:shadow-md w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2C2C2C] mb-1">ZAP</div>
                  <div className="text-xs text-[#8B7F76]">Imóveis</div>
                </div>
              </div>
            </div>

            {/* Viva Real */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-white rounded-xl border border-[rgba(169,126,111,0.15)] group-hover:border-[#8FD14F]/50 transition-all duration-300 group-hover:shadow-md w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2C2C2C] mb-1">Viva</div>
                  <div className="text-xs text-[#8B7F76]">Real</div>
                </div>
              </div>
            </div>

            {/* OLX */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-white rounded-xl border border-[rgba(169,126,111,0.15)] group-hover:border-[#8FD14F]/50 transition-all duration-300 group-hover:shadow-md w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2C2C2C]">OLX</div>
                </div>
              </div>
            </div>

            {/* Chaves na Mão */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-white rounded-xl border border-[rgba(169,126,111,0.15)] group-hover:border-[#8FD14F]/50 transition-all duration-300 group-hover:shadow-md w-full">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#2C2C2C] mb-1">Chaves</div>
                  <div className="text-xs text-[#8B7F76]">na Mão</div>
                </div>
              </div>
            </div>

            {/* Imovelweb */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-white rounded-xl border border-[rgba(169,126,111,0.15)] group-hover:border-[#8FD14F]/50 transition-all duration-300 group-hover:shadow-md w-full">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#2C2C2C] mb-1">Imóvel</div>
                  <div className="text-xs text-[#8B7F76]">Web</div>
                </div>
              </div>
            </div>

            {/* QuintoAndar */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-white rounded-xl border border-[rgba(169,126,111,0.15)] group-hover:border-[#8FD14F]/50 transition-all duration-300 group-hover:shadow-md w-full">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#2C2C2C] mb-1">Quinto</div>
                  <div className="text-xs text-[#8B7F76]">Andar</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#8B7F76] text-sm">
              <span className="text-[#8FD14F] font-semibold">✓</span> Publicação automática
              <span className="mx-4 text-[#D6BAA8]">•</span>
              <span className="text-[#8FD14F] font-semibold">✓</span> Sincronização em tempo real
              <span className="mx-4 text-[#D6BAA8]">•</span>
              <span className="text-[#8FD14F] font-semibold">✓</span> Gestão centralizada
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-[#8FD14F] to-[#006D77] rounded-3xl p-12 shadow-2xl glow-green-strong overflow-hidden">
            {/* Floating decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF006E]/20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Pronto para Revolucionar Sua Gestão?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Junte-se a centenas de imobiliárias que já transformaram seus resultados com o Vivoly
              </p>
              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-white text-[#006D77] rounded-xl hover:bg-[#FAF8F5] transition-all font-bold text-lg shadow-2xl hover:scale-105 transform"
              >
                Começar Agora - 14 Dias Grátis
              </Link>
              <p className="text-sm text-white/90 mt-4">
                Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F4EFE9]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-6">
            Ficou com alguma dúvida?
          </h2>
          <p className="text-xl text-[#8B7F76] mb-8">
            Nossa equipe está pronta para te ajudar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${landingConfig.contact.email}`}
              className="px-6 py-3 bg-[#A97E6F] text-white rounded-lg hover:bg-[#8B6F5C] transition-all font-medium shadow-md hover:shadow-lg"
            >
              📧 {landingConfig.contact.email}
            </a>
            <a
              href={`https://wa.me/${landingConfig.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#8FD14F] text-white rounded-lg hover:bg-[#7FB344] transition-all font-medium shadow-md hover:shadow-lg"
            >
              💬 WhatsApp: (11) 99999-9999
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5] border-t border-[rgba(169,126,111,0.15)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Image
                  src="/logo.svg"
                  alt="Vivoly"
                  width={269}
                  height={66}
                  className="h-[67px] w-auto"
                />
              </div>
              <p className="text-[#8B7F76] text-sm">
                Gestão Imobiliária Inteligente para transformar seu negócio.
              </p>
            </div>

            <div>
              <h4 className="text-[#2C2C2C] font-bold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors">Planos</a></li>
                <li><Link href="/login" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#2C2C2C] font-bold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors">Sobre Nós</a></li>
                <li><a href="#contact" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors">Contato</a></li>
                <li><a href="#" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#2C2C2C] font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-[#8B7F76] hover:text-[#2C2C2C] transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[rgba(169,126,111,0.15)] pt-8 text-center text-[#8B7F76] text-sm">
            <p>© 2025 Vivoly. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

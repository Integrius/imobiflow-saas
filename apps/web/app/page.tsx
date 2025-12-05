'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getToken } from '@/lib/auth';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation - Modernizado com glassmorphism */}
      <nav className="fixed w-full z-50 glass-effect border-b border-slate-800/50 shadow-2xl">
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
              <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium text-sm">
                Recursos
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors font-medium text-sm">
                Planos
              </a>
              <a href="#contact" className="text-slate-300 hover:text-white transition-colors font-medium text-sm">
                Contato
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition-colors font-medium text-sm"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Two Column Layout */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 px-6">
        {/* Background com gradiente + pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Coluna Esquerda - Copy */}
            <div className="space-y-8">
              {/* Badge de Novidade */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                Novo: Sistema Multi-Tenant com Subdomínios
              </div>

              {/* Headline com Gradient */}
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Gestão Imobiliária
                <span className="block text-gradient">
                  Simples e Inteligente
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-slate-300 leading-relaxed">
                Centralize leads, imóveis, negociações e mais em uma plataforma
                moderna. Aumente suas vendas em até 300% com automação inteligente.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Começar Grátis
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                <a
                  href="#features"
                  className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold text-lg border-2 border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-300 flex items-center justify-center gap-2"
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-slate-900"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-slate-900"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-slate-900"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 border-2 border-slate-900"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-slate-900"></div>
                </div>
                <div>
                  <div className="text-white font-semibold">500+ imobiliárias</div>
                  <div className="text-slate-400 text-sm">confiam no Vivoly</div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  14 dias grátis
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cancele quando quiser
                </div>
              </div>
            </div>

            {/* Coluna Direita - Placeholder para Screenshot */}
            <div className="relative hidden md:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-slate-800 bg-gradient-to-br from-slate-800 to-slate-900">
                {/* Placeholder para screenshot do dashboard */}
                <div className="aspect-[4/3] flex items-center justify-center">
                  <div className="text-center p-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">Dashboard Inteligente</h3>
                    <p className="text-slate-400 text-sm">Métricas em tempo real para decisões mais inteligentes</p>
                  </div>
                </div>

                {/* Floating Stats Cards */}
                <div className="absolute top-4 -left-4 bg-slate-800/90 backdrop-blur rounded-xl p-4 shadow-xl border border-slate-700">
                  <div className="text-green-400 text-sm font-semibold">↑ 247%</div>
                  <div className="text-slate-300 text-xs">Conversão</div>
                </div>

                <div className="absolute bottom-4 -right-4 bg-slate-800/90 backdrop-blur rounded-xl p-4 shadow-xl border border-slate-700">
                  <div className="text-blue-400 text-sm font-semibold">1,234</div>
                  <div className="text-slate-300 text-xs">Leads ativos</div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row Abaixo do Hero */}
      <section className="py-12 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-2">500+</div>
              <div className="text-slate-300 font-medium">Imobiliárias Atendidas</div>
            </div>
            <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-2">10.000+</div>
              <div className="text-slate-300 font-medium">Negócios Fechados</div>
            </div>
            <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-2">98%</div>
              <div className="text-slate-300 font-medium">Satisfação dos Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modernizada */}
      <section id="features" className="py-24 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tudo que você precisa para
              <span className="block text-gradient">
                dominar o mercado
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Ferramentas poderosas para cada etapa do seu processo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Gestão de Leads */}
            <div className="group relative p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Gestão de Leads</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  Capture, organize e acompanhe todos os seus leads em um só lugar. Nunca mais perca uma oportunidade.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 2 - Catálogo de Imóveis */}
            <div className="group relative p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/5 group-hover:to-teal-600/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Catálogo de Imóveis</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  Organize seu portfólio com fotos, detalhes e disponibilidade de todos os imóveis em tempo real.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 3 - Controle de Negociações */}
            <div className="group relative p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Controle de Negociações</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  Acompanhe todas as propostas, contratos e negociações de forma simples e organizada.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 4 - Relatórios e Análises */}
            <div className="group relative p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Relatórios e Análises</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  Dashboards intuitivos com métricas em tempo real para acompanhar o desempenho do seu negócio.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 5 - Gestão de Corretores */}
            <div className="group relative p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-rose-600/0 group-hover:from-red-600/5 group-hover:to-rose-600/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Gestão de Corretores</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  Gerencie sua equipe de corretores, comissões e desempenho individual de forma transparente.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium text-sm group/link">
                  Saiba mais
                  <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Feature 6 - Segurança Total */}
            <div className="group relative p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 to-blue-600/0 group-hover:from-cyan-600/5 group-hover:to-blue-600/5 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Segurança Total</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  Seus dados protegidos com criptografia de ponta e backup automático na nuvem.
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm group/link">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Como Funciona?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Em apenas 3 passos, você está pronto para transformar sua gestão imobiliária
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Cadastre-se Grátis</h3>
              <p className="text-slate-300">
                Crie sua conta em menos de 2 minutos. Sem cartão de crédito, sem complicação.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Configure Seu Sistema</h3>
              <p className="text-slate-300">
                Adicione seus imóveis, corretores e comece a organizar seus leads imediatamente.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Feche Mais Negócios</h3>
              <p className="text-slate-300">
                Acompanhe tudo em tempo real e veja seus resultados crescerem mês a mês.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Modernizada */}
      <section id="pricing" className="py-24 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Planos que
              <span className="block text-gradient">
                cabem no seu bolso
              </span>
            </h2>
            <p className="text-xl text-slate-400">
              Escolha o plano ideal para o seu negócio. Teste grátis por 14 dias, sem cartão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <div className="relative p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Básico</h3>
                <p className="text-slate-400">Para corretores iniciantes</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2">
                  R$ 97
                </div>
                <span className="text-slate-400">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Até 50 leads</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Até 30 imóveis</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">1 usuário</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Suporte por email</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3.5 px-6 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold text-center border border-slate-700 hover:border-slate-600"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Profissional - DESTACADO */}
            <div className="relative p-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl transform md:scale-105 shadow-2xl shadow-blue-500/50 flex flex-col">
              {/* Badge Mais Popular */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  MAIS POPULAR
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Profissional</h3>
                <p className="text-blue-100">Para imobiliárias em crescimento</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2">
                  R$ 197
                </div>
                <span className="text-blue-100">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Leads ilimitados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Imóveis ilimitados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Até 5 usuários</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Suporte prioritário</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-300 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Relatórios avançados</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3.5 px-6 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-center shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Enterprise */}
            <div className="relative p-8 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-slate-400">Para grandes imobiliárias</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2">
                  R$ 397
                </div>
                <span className="text-slate-400">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Tudo do Profissional</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Usuários ilimitados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Suporte 24/7</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">Treinamento personalizado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">API customizada</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3.5 px-6 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold text-center border border-slate-700 hover:border-slate-600"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Integrações */}
      <section className="py-16 px-6 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Integrado com os principais portais
            </p>
            <h3 className="text-2xl font-bold text-white">
              Sincronize seus imóveis automaticamente
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {/* ZAP Imóveis */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:border-blue-500/50 transition-all duration-300 group-hover:bg-slate-800 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">ZAP</div>
                  <div className="text-xs text-slate-400">Imóveis</div>
                </div>
              </div>
            </div>

            {/* Viva Real */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:border-green-500/50 transition-all duration-300 group-hover:bg-slate-800 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">Viva</div>
                  <div className="text-xs text-slate-400">Real</div>
                </div>
              </div>
            </div>

            {/* OLX */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:border-purple-500/50 transition-all duration-300 group-hover:bg-slate-800 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">OLX</div>
                </div>
              </div>
            </div>

            {/* Chaves na Mão */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:border-amber-500/50 transition-all duration-300 group-hover:bg-slate-800 w-full">
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">Chaves</div>
                  <div className="text-xs text-slate-400">na Mão</div>
                </div>
              </div>
            </div>

            {/* Imovelweb */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:border-red-500/50 transition-all duration-300 group-hover:bg-slate-800 w-full">
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">Imóvel</div>
                  <div className="text-xs text-slate-400">Web</div>
                </div>
              </div>
            </div>

            {/* QuintoAndar */}
            <div className="flex items-center justify-center group">
              <div className="px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:border-indigo-500/50 transition-all duration-300 group-hover:bg-slate-800 w-full">
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">Quinto</div>
                  <div className="text-xs text-slate-400">Andar</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
              <span className="text-green-400 font-semibold">✓</span> Publicação automática
              <span className="mx-4 text-slate-700">•</span>
              <span className="text-green-400 font-semibold">✓</span> Sincronização em tempo real
              <span className="mx-4 text-slate-700">•</span>
              <span className="text-green-400 font-semibold">✓</span> Gestão centralizada
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para Revolucionar Sua Gestão?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Junte-se a centenas de imobiliárias que já transformaram seus resultados com o Vivoly
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-lg shadow-2xl hover:scale-105 transform"
            >
              Começar Agora - 14 Dias Grátis
            </Link>
            <p className="text-sm text-blue-100 mt-4">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ficou com alguma dúvida?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Nossa equipe está pronta para te ajudar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contato@vivoly.com.br"
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-medium"
            >
              📧 contato@vivoly.com.br
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
            >
              💬 WhatsApp: (11) 99999-9999
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-700">
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
              <p className="text-slate-400 text-sm">
                Gestão Imobiliária Inteligente para transformar seu negócio.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Planos</a></li>
                <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
            <p>© 2025 Vivoly. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

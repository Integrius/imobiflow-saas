'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getToken } from '@/lib/auth';
import ChristmasFloat from '@/components/ChristmasFloat';
import { landingConfig } from '@/config/landing';
import FAQSection from '@/components/FAQSection';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    const hasValidToken = !!token && token.trim() !== '';
    setIsAuthenticated(hasValidToken);
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Christmas Floating Santa */}
      <ChristmasFloat />

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                <Image
                  src="/logoIntegrius.png"
                  alt="Integrius - CRM Imobiliário"
                  width={302}
                  height={74}
                  priority
                  className="h-12 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Recursos
              </a>
              <a href="#sofia" className="text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium text-sm">
                IA Sofia
              </a>
              <a href="#pricing" className="text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Planos
              </a>
              <a href="#faq" className="text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium text-sm">
                FAQ
              </a>
              <Link href="/buscar-imovel" className="text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Buscar Imóvel
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Testar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - B2B Focused with SEO H1 */}
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#047857] overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00C48C]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-white">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-[#8FD14F] rounded-full animate-pulse"></span>
                +500 imobiliárias já usam o Integrius
              </div>

              {/* H1 - SEO Optimized */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                CRM Imobiliário com
                <span className="text-[#8FD14F]"> IA</span> para
                <span className="text-[#8FD14F]"> Gestão de Leads</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-200 mb-8 max-w-xl leading-relaxed">
                Automatize o follow-up, qualifique leads com inteligência artificial
                e aumente suas vendas em até 3x. Sem planilhas, sem perder negócios.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-300">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  14 dias grátis
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#8FD14F]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cancele quando quiser
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-[#8FD14F] text-[#064E3B] rounded-xl font-bold text-lg hover:bg-[#7EC43E] transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  Começar Grátis Agora
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="#demo"
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Ver Demonstração
                </a>
              </div>
            </div>

            {/* Right Column - Image/Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white/20">
                <div className="p-4">
                  <Image
                    src={landingConfig.hero.imagePath}
                    alt="Dashboard do CRM Imobiliário Integrius"
                    width={landingConfig.hero.imageWidth}
                    height={landingConfig.hero.imageHeight}
                    priority
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>

              {/* Floating Card - Sofia IA */}
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-xl shadow-xl text-white max-w-[220px] animate-bounce-slow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">✨</span>
                  </div>
                  <span className="font-bold text-sm">Sofia IA</span>
                </div>
                <p className="text-xs opacity-90">
                  "Lead João Silva qualificado! Score: 85. Recomendo contato imediato."
                </p>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="text-[#00C48C] text-lg font-bold">↑ 247%</div>
                <div className="text-gray-600 text-xs">Taxa de Conversão</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Stats */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-[#064E3B] mb-2">500+</div>
              <div className="text-gray-600 font-medium">Imobiliárias Ativas</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-[#064E3B] mb-2">50k+</div>
              <div className="text-gray-600 font-medium">Leads Gerenciados</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-[#064E3B] mb-2">R$ 2B+</div>
              <div className="text-gray-600 font-medium">Em Negócios Fechados</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-bold text-[#064E3B] mb-2">98%</div>
              <div className="text-gray-600 font-medium">Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-6 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B] mb-4">
              Por que imobiliárias perdem 60% dos leads?
            </h2>
            <p className="text-xl text-gray-700">
              Sem um CRM adequado, oportunidades valiosas escapam todos os dias.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">❌ Sem Follow-up Automatizado</h3>
              <p className="text-gray-600 mb-4">
                Leads chegam e ficam esquecidos. Sem lembretes automáticos, corretores perdem o timing ideal de contato.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[#00C48C] font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Integrius: Tarefas e lembretes automáticos
                </p>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">❌ Dados Desorganizados</h3>
              <p className="text-gray-600 mb-4">
                Planilhas, WhatsApp, emails... informações espalhadas dificultam o acompanhamento de negociações.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[#00C48C] font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Integrius: Tudo centralizado em um lugar
                </p>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">❌ Sem Visibilidade do Funil</h3>
              <p className="text-gray-600 mb-4">
                Gestores não sabem quantos leads estão em cada etapa, quem está performando ou onde estão os gargalos.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[#00C48C] font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Integrius: Dashboard gerencial completo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - SEO Optimized with H2/H3 */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B] mb-4">
              Funcionalidades de CRM Imobiliário
            </h2>
            <p className="text-xl text-gray-700">
              Tudo que sua imobiliária precisa para converter mais leads em vendas
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
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">Gestão de Leads com IA</h3>
              <p className="text-gray-600 leading-relaxed">
                Capture leads de qualquer fonte. A IA qualifica automaticamente e indica quais contatar primeiro.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#059669] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">Automação de Follow-up</h3>
              <p className="text-gray-600 leading-relaxed">
                Tarefas e lembretes automáticos. Nunca mais esqueça de fazer follow-up com um lead quente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#064E3B] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">Dashboard de Negociações</h3>
              <p className="text-gray-600 leading-relaxed">
                Funil visual completo. Acompanhe cada etapa da negociação e identifique gargalos rapidamente.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#00C48C] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">Catálogo de Imóveis</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize seu portfólio com fotos, vídeos e detalhes completos. Match automático com leads.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#059669] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">Gestão de Equipe</h3>
              <p className="text-gray-600 leading-relaxed">
                Distribua leads automaticamente. Acompanhe metas, comissões e desempenho de cada corretor.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="w-14 h-14 bg-[#064E3B] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-3">WhatsApp e Telegram</h3>
              <p className="text-gray-600 leading-relaxed">
                Integração nativa com WhatsApp e Telegram. Receba leads e notifique corretores automaticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sofia IA Section */}
      <section id="sofia" className="py-24 px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-sm font-medium mb-6">
                <span className="text-xl">✨</span>
                Inteligência Artificial
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sofia: Sua Assistente de IA para Corretores
              </h2>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                A Sofia analisa cada lead automaticamente, atribui uma pontuação de qualificação
                e sugere as melhores ações para cada situação.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#8FD14F] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#064E3B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold">Qualificação Automática</span>
                    <p className="text-gray-400 text-sm">Score de 0-100 para cada lead baseado em dados de comportamento</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#8FD14F] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#064E3B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold">Insights Inteligentes</span>
                    <p className="text-gray-400 text-sm">Pontos fortes, fracos e recomendação personalizada para cada lead</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#8FD14F] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#064E3B]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold">Match de Imóveis</span>
                    <p className="text-gray-400 text-sm">Sugestão automática dos melhores imóveis para cada perfil de cliente</p>
                  </div>
                </li>
              </ul>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#8FD14F] text-[#064E3B] rounded-xl font-bold text-lg hover:bg-[#7EC43E] transition-all hover:scale-105 shadow-lg"
              >
                Testar Sofia Grátis
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                {/* Chat simulation */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-sm font-bold mb-1">Sofia IA</p>
                      <p className="text-sm opacity-90">
                        Novo lead analisado! Maria Santos está procurando apartamento de 3 quartos na zona sul.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold">Score de Qualificação</span>
                      <span className="text-2xl font-bold text-[#8FD14F]">85/100</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-[#8FD14F] h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div className="bg-[#8FD14F]/20 rounded-xl p-4 border border-[#8FD14F]/30">
                    <p className="text-sm font-bold mb-2 flex items-center gap-2">
                      <span>💡</span> Recomendação
                    </p>
                    <p className="text-sm opacity-90">
                      Lead quente! Entre em contato em até 2 horas. Tenho 3 apartamentos que combinam com o perfil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B] mb-4">
              Planos de CRM Imobiliário
            </h2>
            <p className="text-xl text-gray-700">
              Escolha o plano ideal para o tamanho da sua operação. Teste grátis por 14 dias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#064E3B] mb-2">Básico</h3>
                <p className="text-gray-600">Para corretores autônomos</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#064E3B] mb-2">R$ 97</div>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Até 100 leads</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Até 50 imóveis</span>
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
                  <span className="text-gray-700">Sofia IA básica</span>
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
                className="block w-full text-center px-8 py-3 bg-transparent border-2 border-[#064E3B] text-[#064E3B] rounded-lg hover:bg-[#064E3B] hover:text-white transition-all duration-200 font-bold"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Profissional - DESTACADO */}
            <div className="bg-gradient-to-br from-[#00C48C] to-[#00B07D] rounded-2xl p-8 transform md:scale-105 shadow-2xl text-white relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 bg-[#064E3B] text-white rounded-full text-sm font-bold shadow-lg">
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
                  <span className="font-medium">Até 10 usuários</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Sofia IA completa</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Integração WhatsApp</span>
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
                <h3 className="text-2xl font-bold text-[#064E3B] mb-2">Enterprise</h3>
                <p className="text-gray-600">Para grandes operações</p>
              </div>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-[#064E3B] mb-2">R$ 397</div>
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
                  <span className="text-gray-700">Suporte prioritário 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">API personalizada</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#00C48C] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Onboarding dedicado</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full text-center px-8 py-3 bg-transparent border-2 border-[#064E3B] text-[#064E3B] rounded-lg hover:bg-[#064E3B] hover:text-white transition-all duration-200 font-bold"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B] mb-4">
              O que dizem nossos clientes
            </h2>
            <p className="text-xl text-gray-700">
              Imobiliárias de todo Brasil já transformaram sua gestão com o Integrius
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-[#F4F6F8] rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Triplicamos nossa conversão de leads em 3 meses. A Sofia identifica os leads quentes
                e minha equipe sabe exatamente quem priorizar."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#064E3B] rounded-full flex items-center justify-center text-white font-bold">
                  RC
                </div>
                <div>
                  <p className="font-bold text-[#064E3B]">Roberto Costa</p>
                  <p className="text-sm text-gray-600">Diretor, Imobiliária Costa & Silva</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#F4F6F8] rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Antes eu perdia leads por falta de follow-up. Agora o sistema me lembra de tudo.
                Aumentei minhas vendas em 40% no primeiro mês."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#00C48C] rounded-full flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div>
                  <p className="font-bold text-[#064E3B]">Ana Maria Santos</p>
                  <p className="text-sm text-gray-600">Corretora Autônoma, São Paulo</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#F4F6F8] rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "O dashboard gerencial me dá visibilidade total da equipe. Sei exatamente quem está
                performando e onde estão os gargalos. Recomendo!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center text-white font-bold">
                  PL
                </div>
                <div>
                  <p className="font-bold text-[#064E3B]">Paulo Lima</p>
                  <p className="text-sm text-gray-600">CEO, Rede Imobiliária Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#064E3B] to-[#064E3B]/90 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comece a converter mais leads hoje
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 500 imobiliárias que já transformaram sua gestão com o Integrius.
            Teste grátis por 14 dias, sem cartão de crédito.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-10 py-5 bg-[#8FD14F] text-[#064E3B] rounded-xl font-bold text-xl hover:bg-[#7EC43E] transition-all hover:scale-105 shadow-lg flex items-center gap-2"
            >
              Criar Conta Grátis
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/buscar-imovel"
              className="px-10 py-5 bg-white/10 backdrop-blur text-white rounded-xl font-bold text-xl hover:bg-white/20 transition-all border border-white/20"
            >
              Procurando Imóvel?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#064E3B] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <Image
                  src="/logoIntegrius.png"
                  alt="Integrius"
                  width={269}
                  height={66}
                  className="h-12 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 text-sm">
                CRM Imobiliário com IA para transformar sua gestão de leads e aumentar suas vendas.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#sofia" className="text-gray-400 hover:text-white transition-colors">Sofia IA</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Planos</a></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><Link href="/buscar-imovel" className="text-gray-400 hover:text-white transition-colors">Buscar Imóvel</Link></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Integrius. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

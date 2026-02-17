'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getToken } from '@/lib/auth';
import { landingConfig } from '@/config/landing';
import FAQSection from '@/components/FAQSection';

const testimonials = [
  {
    text: 'Triplicamos nossa conversão de clientes em 3 meses. A Sofia identifica os clientes quentes e minha equipe sabe exatamente quem priorizar.',
    name: 'Roberto Costa',
    role: 'Diretor, Imobiliária Costa & Silva',
    initials: 'RC',
    color: 'bg-[#064E3B]',
  },
  {
    text: 'Antes eu perdia clientes por falta de follow-up. Agora o sistema me lembra de tudo. Aumentei minhas vendas em 40% no primeiro mês.',
    name: 'Ana Maria Santos',
    role: 'Corretora Autônoma, São Paulo',
    initials: 'AM',
    color: 'bg-[#00C48C]',
  },
  {
    text: 'O dashboard gerencial me dá visibilidade total da equipe. Sei exatamente quem está performando e onde estão os gargalos. Recomendo!',
    name: 'Paulo Lima',
    role: 'CEO, Rede Imobiliária Premium',
    initials: 'PL',
    color: 'bg-[#059669]',
  },
  {
    text: 'A avaliação de temperatura dos clientes é genial. Consigo focar nos clientes certos e não perco mais tempo com quem esfriou.',
    name: 'Carla Mendes',
    role: 'Gestora Comercial, Imobiliária Horizonte',
    initials: 'CM',
    color: 'bg-[#047857]',
  },
  {
    text: 'Integramos o WhatsApp e os clientes chegam automaticamente no CRM. A produtividade da equipe dobrou em semanas.',
    name: 'Fernando Alves',
    role: 'Diretor, FA Imóveis',
    initials: 'FA',
    color: 'bg-[#064E3B]',
  },
];

const features = [
  {
    title: 'Sofia IA',
    description: 'Score automático de qualificação, análise de sentimento e sugestão inteligente de imóveis para cada cliente.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  },
  {
    title: 'Business Intelligence',
    description: 'Rankings, metas, comissões e dashboards gerenciais em tempo real para decisões estratégicas.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'bg-[#064E3B]',
  },
  {
    title: 'Agenda Inteligente',
    description: 'Agendamento de visitas, follow-ups e lembretes automáticos integrados ao funil de vendas.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-[#059669]',
  },
  {
    title: 'Temperatura de Clientes',
    description: 'Classificação Quente, Morno e Frio com degradação automática por inatividade.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
    color: 'bg-[#00C48C]',
  },
  {
    title: 'Gestão de Clientes',
    description: 'Captação multicanal, timeline completa de interações e propostas competitivas.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'bg-[#00C48C]',
  },
  {
    title: 'Catálogo de Imóveis',
    description: 'Fotos, vídeo, tour 360 e match automático com o perfil do cliente.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'bg-[#064E3B]',
  },
  {
    title: 'WhatsApp & Telegram',
    description: 'Captação automática de clientes e notificações em tempo real para corretores.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'bg-[#059669]',
  },
  {
    title: 'Gestão de Equipe',
    description: 'Distribuição automática de clientes, metas individuais e comissões.',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token && token.trim() !== '');
  }, []);

  // Carousel auto-play
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({ left: currentSlide * cardWidth, behavior: 'smooth' });
    }
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  }, []);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide === 0 ? testimonials.length - 1 : currentSlide - 1);
  }, [currentSlide, goToSlide]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % testimonials.length);
  }, [currentSlide, goToSlide]);

  return (
    <div className="min-h-screen bg-white relative">

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                <Image
                  src="/logoIntegrius.png"
                  alt="Integrius - CRM Imobiliário"
                  width={393}
                  height={96}
                  priority
                  className="h-16 w-auto"
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
              <a href="#depoimentos" className="text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Depoimentos
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#047857] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00C48C]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-[#8FD14F] rounded-full animate-pulse"></span>
                +500 imobiliárias já usam o Integrius
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                CRM Imobiliário com
                <span className="text-[#8FD14F]"> IA</span> para
                <span className="text-[#8FD14F]"> Gestão de Clientes</span>
              </h1>

              <p className="text-xl text-gray-200 mb-8 max-w-xl leading-relaxed">
                Automatize o follow-up, qualifique clientes com inteligência artificial
                e aumente suas vendas em até 3x. Sem planilhas, sem perder negócios.
              </p>

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

              <div className="flex flex-wrap gap-4 mb-10">
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
                  href="#features"
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Conhecer Recursos
                </a>
              </div>

              {/* Mini Plan Preview */}
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Básico', price: 'R$97' },
                  { name: 'Profissional', price: 'R$197' },
                  { name: 'Enterprise', price: 'R$397' },
                ].map((plan) => (
                  <Link
                    key={plan.name}
                    href="/register"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg hover:bg-white/20 transition-all text-sm"
                  >
                    <span className="font-bold text-white">{plan.name}</span>
                    <span className="text-[#8FD14F] font-bold">{plan.price}<span className="text-gray-400 font-normal">/mês</span></span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Dashboard Preview */}
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

              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-xl shadow-xl text-white max-w-[220px] animate-bounce-slow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">✨</span>
                  </div>
                  <span className="font-bold text-sm">Sofia IA</span>
                </div>
                <p className="text-xs opacity-90">
                  &quot;Cliente João Silva qualificado! Score: 85. Recomendo contato imediato.&quot;
                </p>
              </div>

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
              <div className="text-gray-600 font-medium">Clientes Gerenciados</div>
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

      {/* Features Cards */}
      <section id="features" className="py-24 px-6 bg-[#F4F6F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B] mb-4">
              Tudo que sua imobiliária precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-700">
              Funcionalidades completas para converter mais clientes em vendas
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[#064E3B] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Intermediário */}
      <section className="py-16 px-6 bg-gradient-to-r from-[#064E3B] to-[#047857]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar sua imobiliária?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            14 dias grátis. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#8FD14F] text-[#064E3B] rounded-xl font-bold text-lg hover:bg-[#7EC43E] transition-all hover:scale-105 shadow-lg"
          >
            Começar Agora
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Sofia IA Section */}
      <section id="sofia" className="py-24 px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full text-sm font-medium mb-6">
                <span className="text-xl">✨</span>
                Inteligência Artificial
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sofia: Sua Assistente de IA para Corretores
              </h2>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                A Sofia analisa cada cliente automaticamente, atribui uma pontuação de qualificação
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
                    <p className="text-gray-400 text-sm">Score de 0-100 para cada cliente baseado em dados de comportamento</p>
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
                    <p className="text-gray-400 text-sm">Pontos fortes, fracos e recomendação personalizada para cada cliente</p>
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

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-lg">✨</span>
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-sm font-bold mb-1">Sofia IA</p>
                      <p className="text-sm opacity-90">
                        Novo cliente analisado! Maria Santos está procurando apartamento de 3 quartos na zona sul.
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
                      Cliente quente! Entre em contato em até 2 horas. Tenho 3 apartamentos que combinam com o perfil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="depoimentos" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B] mb-4">
              O que dizem nossos clientes
            </h2>
            <p className="text-xl text-gray-700">
              Imobiliárias de todo Brasil já transformaram sua gestão com o Integrius
            </p>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="overflow-hidden scroll-smooth"
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4">
                    <div className="bg-[#F4F6F8] rounded-2xl p-8 max-w-2xl mx-auto">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                        &quot;{t.text}&quot;
                      </p>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${t.color} rounded-full flex items-center justify-center text-white font-bold`}>
                          {t.initials}
                        </div>
                        <div>
                          <p className="font-bold text-[#064E3B]">{t.name}</p>
                          <p className="text-sm text-gray-600">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Depoimento anterior"
            >
              <svg className="w-5 h-5 text-[#064E3B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Próximo depoimento"
            >
              <svg className="w-5 h-5 text-[#064E3B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'bg-[#00C48C] w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir para depoimento ${i + 1}`}
                />
              ))}
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
            Comece a converter mais clientes hoje
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 500 imobiliárias que já transformaram sua gestão com o Integrius.
            Teste grátis por 14 dias, sem cartão de crédito.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#8FD14F] text-[#064E3B] rounded-xl font-bold text-xl hover:bg-[#7EC43E] transition-all hover:scale-105 shadow-lg"
          >
            Criar Conta Grátis
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#064E3B] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <Image
                  src="/logoIntegrius.png"
                  alt="Integrius"
                  width={350}
                  height={86}
                  className="h-16 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                CRM Imobiliário com Inteligência Artificial. Automatize a gestão de clientes,
                acompanhe negociações e aumente suas vendas com a plataforma mais completa do mercado.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a href="#" aria-label="Instagram" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" aria-label="YouTube" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Produto */}
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Recursos</a></li>
                <li><a href="#sofia" className="text-gray-400 hover:text-white transition-colors text-sm">Sofia IA</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Login</Link></li>
                <li><Link href="/buscar-imovel" className="text-gray-400 hover:text-white transition-colors text-sm">Buscar Imóvel</Link></li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Quem Somos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Carreiras</a></li>
              </ul>
            </div>

            {/* Contato & Legal */}
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:contato@integrius.com.br" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    contato@integrius.com.br
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </li>
              </ul>

              <h4 className="font-bold mb-4 mt-6">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Política de Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Integrius. Todos os direitos reservados.</p>
            <p className="mt-1">CNPJ: XX.XXX.XXX/XXXX-XX</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

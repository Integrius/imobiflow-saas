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
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, [router]);

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
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
              ) : (
                <>
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
                </>
              )}
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

                <a
                  href="#features"
                  className="px-8 py-4 bg-transparent border-2 border-[#0A2540] text-[#0A2540] rounded-lg hover:bg-[#0A2540] hover:text-white transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2"
                >
                  Ver Como Funciona
                </a>
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

      {/* Continue with the rest of the sections using the same Tech Clean Premium style...
          Due to character limit, I'll mark this as part 1 and create the remaining sections */}

      <section className="py-16 px-6 text-center">
        <p className="text-gray-500 text-sm">
          ⚠️ Landing page sendo reformulada com estilo "Tech Clean Premium"
          <br />
          Seções restantes serão adicionadas em seguida...
        </p>
      </section>

      {/* Footer - Simplified for now */}
      <footer className="py-12 px-6 bg-[#0A2540] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-300">© 2025 ImobiFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

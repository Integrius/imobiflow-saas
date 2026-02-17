'use client';

import Link from 'next/link';
import Image from 'next/image';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import { landingConfig } from '@/config/landing';

export default function BuscarImovelPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                <Image
                  src="/logoIntegrius.png"
                  alt="Integrius"
                  width={393}
                  height={96}
                  priority
                  className="h-16 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Para Imobiliárias
              </Link>
              <Link href="/#pricing" className="text-[#064E3B] hover:text-[#00C48C] transition-colors font-medium text-sm">
                Planos
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
                className="px-6 py-2.5 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Sou Corretor
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-6 bg-gradient-to-br from-[#F4F6F8] to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C48C]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#059669]/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C48C]/10 border border-[#00C48C]/20 rounded-full text-[#064E3B] text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-[#00C48C] rounded-full animate-pulse"></span>
            Encontre seu imóvel ideal
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[#064E3B] mb-6 leading-tight">
            Procurando o imóvel perfeito para você?
          </h1>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Preencha o formulário abaixo e receba sugestões personalizadas de imóveis
            diretamente no seu email e WhatsApp. É gratuito!
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Gratuito
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Sem compromisso
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00C48C]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Sugestões personalizadas por IA
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <LeadCaptureForm />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-[#F4F6F8]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#064E3B] text-center mb-12">
            Como funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00C48C] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-2">Preencha o formulário</h3>
              <p className="text-gray-600">
                Conte-nos o que você procura: tipo de imóvel, localização, faixa de preço e preferências.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-2">Nossa IA analisa</h3>
              <p className="text-gray-600">
                A Sofia, nossa inteligência artificial, encontra os melhores imóveis para o seu perfil.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#064E3B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#064E3B] mb-2">Receba sugestões</h3>
              <p className="text-gray-600">
                Você recebe as melhores opções por email e WhatsApp, sem custo e sem compromisso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for realtors */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#064E3B] to-[#064E3B]/90 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            É corretor ou tem uma imobiliária?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Conheça o Integrius: o CRM imobiliário com IA que automatiza sua gestão de leads.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#064E3B] rounded-lg hover:bg-gray-50 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Conhecer o Integrius
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#064E3B] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logoIntegrius.png"
              alt="Integrius"
              width={195}
              height={48}
              className="h-10 w-auto brightness-0 invert"
            />
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Integrius. Todos os direitos reservados.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <Link href="/privacidade" className="text-gray-400 hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="text-gray-400 hover:text-white transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

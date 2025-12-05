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
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Vivoly"
                  width={302}
                  height={74}
                  priority
                  className="h-[73px] w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors font-medium hidden md:block">
                Recursos
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors font-medium hidden md:block">
                Planos
              </a>
              <a href="#contact" className="text-slate-300 hover:text-white transition-colors font-medium hidden md:block">
                Contato
              </a>
              <Link
                href="/login"
                className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors font-bold"
              >
                Entrar
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg hover:shadow-xl"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transforme sua
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text"> Gestão Imobiliária</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Sistema completo para gerenciar leads, imóveis, negociações e muito mais.
              Tudo em um só lugar, de forma simples e eficiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-lg shadow-2xl hover:shadow-blue-900/50 hover:scale-105 transform"
              >
                Começar Agora - Grátis
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all font-bold text-lg border-2 border-slate-600 hover:border-slate-500"
              >
                Conhecer Recursos
              </a>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              ✓ Sem cartão de crédito • ✓ 14 dias grátis • ✓ Cancele quando quiser
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-slate-700">
              <div className="text-4xl font-bold text-blue-400 mb-2">100+</div>
              <div className="text-slate-300 font-medium">Imobiliárias Atendidas</div>
            </div>
            <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-slate-700">
              <div className="text-4xl font-bold text-blue-400 mb-2">5.000+</div>
              <div className="text-slate-300 font-medium">Negócios Fechados</div>
            </div>
            <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-slate-700">
              <div className="text-4xl font-bold text-blue-400 mb-2">98%</div>
              <div className="text-slate-300 font-medium">Satisfação dos Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Ferramentas poderosas para otimizar cada etapa do seu processo imobiliário
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-slate-600 hover:border-blue-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Gestão de Leads</h3>
              <p className="text-slate-300">
                Capture, organize e acompanhe todos os seus leads em um só lugar. Nunca mais perca uma oportunidade.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-slate-600 hover:border-emerald-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">🏘️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Catálogo de Imóveis</h3>
              <p className="text-slate-300">
                Organize seu portfólio com fotos, detalhes e disponibilidade de todos os imóveis em tempo real.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-slate-600 hover:border-amber-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">💼</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Controle de Negociações</h3>
              <p className="text-slate-300">
                Acompanhe todas as propostas, contratos e negociações de forma simples e organizada.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-slate-600 hover:border-purple-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Relatórios e Análises</h3>
              <p className="text-slate-300">
                Dashboards intuitivos com métricas em tempo real para acompanhar o desempenho do seu negócio.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-slate-600 hover:border-red-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">🏢</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Gestão de Corretores</h3>
              <p className="text-slate-300">
                Gerencie sua equipe de corretores, comissões e desempenho individual de forma transparente.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border-2 border-slate-600 hover:border-cyan-500 transition-all duration-300 hover:scale-105 group">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-4xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Segurança Total</h3>
              <p className="text-slate-300">
                Seus dados protegidos com criptografia de ponta e backup automático na nuvem.
              </p>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Planos Para Todos os Tamanhos
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio. Teste grátis por 14 dias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <div className="p-8 bg-slate-800 rounded-2xl border-2 border-slate-600 hover:border-blue-500 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Básico</h3>
                <p className="text-slate-400">Para corretores iniciantes</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white mb-2">
                  R$ 97
                  <span className="text-xl text-slate-400">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">Até 50 leads</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">Até 30 imóveis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">1 usuário</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">Suporte por email</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-bold text-center"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Profissional - Destacado */}
            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl border-2 border-blue-400 transform scale-105 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold mb-2">
                  MAIS POPULAR
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Profissional</h3>
                <p className="text-blue-100">Para imobiliárias em crescimento</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white mb-2">
                  R$ 197
                  <span className="text-xl text-blue-100">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">✓</span>
                  <span className="text-white font-medium">Leads ilimitados</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">✓</span>
                  <span className="text-white font-medium">Imóveis ilimitados</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">✓</span>
                  <span className="text-white font-medium">Até 5 usuários</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">✓</span>
                  <span className="text-white font-medium">Suporte prioritário</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">✓</span>
                  <span className="text-white font-medium">Relatórios avançados</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-bold text-center shadow-xl"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Plano Enterprise */}
            <div className="p-8 bg-slate-800 rounded-2xl border-2 border-slate-600 hover:border-purple-500 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-slate-400">Para grandes imobiliárias</p>
              </div>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white mb-2">
                  R$ 397
                  <span className="text-xl text-slate-400">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">Tudo do Profissional</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">Usuários ilimitados</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">Suporte 24/7</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">Treinamento personalizado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-slate-300">API customizada</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-bold text-center"
              >
                Começar Grátis
              </Link>
            </div>
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

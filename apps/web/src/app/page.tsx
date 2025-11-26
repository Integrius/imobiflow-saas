import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            ImobiFlow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Sistema Completo de Gestão Imobiliária
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            href="/dashboard"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Visão geral de todas as métricas e indicadores do seu negócio
            </p>
          </Link>

          <Link
            href="/leads"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Leads
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Gerencie seus contatos e potenciais clientes
            </p>
          </Link>

          <Link
            href="/imoveis"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Imóveis
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Catálogo completo de imóveis disponíveis
            </p>
          </Link>

          <Link
            href="/negociacoes"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Negociações
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Acompanhe o funil de vendas e fechamentos
            </p>
          </Link>

          <Link
            href="/corretores"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Corretores
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Gestão de equipe e performance
            </p>
          </Link>

          <Link
            href="/login"
            className="bg-blue-600 dark:bg-blue-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-blue-700 dark:border-blue-800"
          >
            <h2 className="text-2xl font-semibold text-white mb-2">
              Acessar Sistema
            </h2>
            <p className="text-blue-100">
              Faça login para acessar todas as funcionalidades
            </p>
          </Link>
        </div>

        <footer className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p>ImobiFlow - Gestão Imobiliária Inteligente</p>
        </footer>
      </div>
    </div>
  );
}

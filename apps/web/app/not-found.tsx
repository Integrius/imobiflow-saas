import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8 flex justify-center">
          <svg
            className="w-32 h-32 text-gray-300"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Search Icon Background */}
            <circle cx="100" cy="100" r="90" fill="currentColor" opacity="0.1" />

            {/* Magnifying Glass */}
            <circle cx="85" cy="85" r="45" stroke="currentColor" strokeWidth="6" />
            <line
              x1="120"
              y1="120"
              x2="160"
              y2="160"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Question Mark */}
            <text
              x="100"
              y="110"
              fontSize="60"
              fontWeight="bold"
              textAnchor="middle"
              fill="currentColor"
            >
              ?
            </text>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold text-gray-900 mb-3">404</h1>

        {/* Main Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Página não encontrada
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-lg">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 no-underline"
          >
            Voltar para o início
          </Link>
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold rounded-lg transition-colors duration-200 no-underline"
          >
            Ir para login
          </Link>
        </div>

        {/* Footer Text */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-gray-600 text-sm">
            Precisa de ajuda? Entre em contato com nosso suporte.
          </p>
          <a
            href="mailto:support@imobiflow.com"
            className="text-green-600 hover:text-green-700 font-medium text-sm mt-2 inline-block transition-colors duration-200"
          >
            suporte@imobiflow.com
          </a>
        </div>
      </div>
    </div>
  );
}

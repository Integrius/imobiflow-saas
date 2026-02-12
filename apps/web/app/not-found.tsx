import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#00C48C]/10 mb-6">
            <svg className="w-12 h-12 text-[#00C48C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-[#064E3B] mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Página não encontrada
          </h2>
          <p className="text-gray-500">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-semibold"
          >
            Voltar para o início
          </Link>
          <Link
            href="/login"
            className="block w-full px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

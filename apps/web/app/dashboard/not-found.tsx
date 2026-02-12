import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00C48C]/10 mb-6">
            <svg className="w-10 h-10 text-[#00C48C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[#064E3B] mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Página não encontrada
          </h2>
          <p className="text-gray-500">
            Esta seção do painel não existe ou foi movida.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-semibold"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}

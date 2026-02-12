'use client';

import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Erro ao carregar a página
          </h1>
          <p className="text-gray-500">
            Ocorreu um erro inesperado. Tente novamente ou volte ao painel principal.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="block w-full px-6 py-3 bg-[#00C48C] text-white rounded-lg hover:bg-[#00B07D] transition-all duration-200 font-semibold"
          >
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

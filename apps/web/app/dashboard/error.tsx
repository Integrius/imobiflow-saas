'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="30" stroke="#D1D5DB" strokeWidth="2" />
            <path
              d="M32 16V32M32 40H32.01"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="32"
              cy="45"
              r="1.5"
              fill="#059669"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Erro no painel
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Ocorreu um erro ao carregar esta página.
        </p>

        {error.digest && (
          <p className="text-center text-sm text-gray-500 mb-6 font-mono">
            Código do erro: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-medium rounded-lg transition-colors duration-200"
          >
            Tentar novamente
          </button>

          <Link
            href="/dashboard"
            className="block w-full px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition-colors duration-200 bg-white text-center"
          >
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Detalhes:</span> {error.message || 'Erro desconhecido'}
          </p>
        </div>
      </div>
    </div>
  );
}

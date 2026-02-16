'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Error Icon SVG */}
        <div className="flex justify-center mb-8">
          <svg
            className="w-20 h-20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Error icon"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" className="text-gray-300" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 8v4m0 4h.01M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              className="text-red-500"
            />
          </svg>
        </div>

        {/* Error Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Algo deu errado
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-8 text-base leading-relaxed">
          Ocorreu um erro inesperado. Tente novamente.
        </p>

        {/* Error Details */}
        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-red-700 break-words font-mono">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 sm:justify-center">
          <button
            onClick={reset}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 active:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Tentar novamente
          </button>

          <Link
            href="/"
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-green-600 bg-white border-2 border-green-600 hover:bg-green-50 active:bg-green-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Voltar para o inicio
          </Link>
        </div>

        {/* Error ID */}
        {error.digest && (
          <p className="text-xs text-gray-500 mt-8">
            ID do erro: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

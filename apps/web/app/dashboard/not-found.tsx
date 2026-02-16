import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[500px] px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* SVG Icon */}
        <div className="mb-6 flex justify-center">
          <svg
            className="w-24 h-24 text-[#059669]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2m4-4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 404 Text */}
        <div className="mb-4">
          <h1 className="text-5xl font-bold text-[#064E3B] mb-2">404</h1>
        </div>

        {/* Main Message */}
        <h2 className="text-2xl font-semibold text-[#064E3B] mb-3">
          Página não encontrada
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-base">
          A página que você está procurando não existe no painel.
        </p>

        {/* Return Button */}
        <Link
          href="/dashboard"
          className="inline-block bg-[#00C48C] hover:bg-[#059669] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}

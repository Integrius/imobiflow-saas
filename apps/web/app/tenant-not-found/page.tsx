'use client';

import Link from 'next/link';

export default function TenantNotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full px-6">
        <div className="bg-slate-800 shadow-2xl rounded-2xl p-8 border-2 border-slate-700 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              Imobiliária não encontrada
            </h1>
            <p className="text-slate-400 text-sm">
              O endereço que você está tentando acessar não corresponde a nenhuma imobiliária cadastrada.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-700 rounded-lg p-4 text-left">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Possíveis motivos:</h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• A imobiliária ainda não está cadastrada</li>
                <li>• O endereço pode estar digitado incorretamente</li>
                <li>• A conta pode ter sido suspensa ou cancelada</li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-300 font-medium">
                É gestor de uma imobiliária?
              </p>
              <Link
                href="/register"
                className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl"
              >
                Cadastrar minha imobiliária
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all duration-300 font-medium"
              >
                Voltar para o início
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                Precisa de ajuda? Entre em contato com nosso suporte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function CancelarAssinaturaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleCancelar = async () => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo do cancelamento');
      return;
    }

    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);

      await api.post('/tenants/cancel', {
        motivo: motivo.trim()
      });

      alert('Sua assinatura foi cancelada com sucesso. Você receberá um email de confirmação em breve.');

      // Redirecionar para logout após 2 segundos
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      alert(error.response?.data?.error || 'Erro ao cancelar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          🚫 Cancelar Assinatura
        </h1>
        <p className="text-gray-600 mt-2">
          Lamentamos que esteja pensando em cancelar. Gostaríamos de entender o motivo.
        </p>
      </div>

      {!showConfirmation ? (
        <>
          {/* Card de Informações */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 font-medium">
                    Atenção: Esta ação é irreversível
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Após o cancelamento, sua conta será desativada e você perderá acesso a todos os dados.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📋 O que acontece ao cancelar:
            </h2>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-red-500 mr-3 text-lg">❌</span>
                <div>
                  <strong className="text-gray-900">Acesso imediato será bloqueado</strong>
                  <p className="text-gray-600 text-sm">Você não poderá mais fazer login no sistema</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 text-lg">🗑️</span>
                <div>
                  <strong className="text-gray-900">Dados serão removidos em 30 dias</strong>
                  <p className="text-gray-600 text-sm">Você tem 30 dias para recuperar seus dados antes da exclusão permanente</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-3 text-lg">💳</span>
                <div>
                  <strong className="text-gray-900">Cobranças cessarão imediatamente</strong>
                  <p className="text-gray-600 text-sm">Não haverá mais cobranças após o cancelamento</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-lg">📦</span>
                <div>
                  <strong className="text-gray-900">Você pode exportar seus dados</strong>
                  <p className="text-gray-600 text-sm">Antes de cancelar, exporte seus dados usando o botão "Recuperar Dados" no topo</p>
                </div>
              </li>
            </ul>

            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4">
              <p className="text-sm text-emerald-700">
                💡 <strong>Dica:</strong> Se está enfrentando dificuldades técnicas ou tem dúvidas sobre o sistema, entre em contato com nosso suporte antes de cancelar: <a href="mailto:contato@integrius.com.br" className="underline font-medium">contato@integrius.com.br</a>
              </p>
            </div>
          </div>

          {/* Formulário de Cancelamento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              💬 Por que está cancelando?
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Seu feedback é muito importante para melhorarmos nosso serviço.
            </p>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Conte-nos o motivo do cancelamento..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={5}
              required
            />

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                ← Voltar
              </button>
              <button
                onClick={() => setShowConfirmation(true)}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                disabled={loading || !motivo.trim()}
              >
                Continuar Cancelamento →
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Confirmação Final */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Última Confirmação
              </h2>
              <p className="text-gray-600">
                Esta ação é <strong className="text-red-600">irreversível</strong>. Tem certeza que deseja prosseguir?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Motivo do cancelamento:</h3>
              <p className="text-gray-700 italic">"{motivo}"</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                ← Não, Voltar
              </button>
              <button
                onClick={handleCancelar}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : (
                  'Sim, Cancelar Minha Assinatura'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer de Suporte */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Precisa de ajuda? Entre em contato conosco:
          <a href="mailto:contato@integrius.com.br" className="text-[#8FD14F] hover:underline font-medium ml-1">
            contato@integrius.com.br
          </a>
        </p>
      </div>
    </div>
  );
}

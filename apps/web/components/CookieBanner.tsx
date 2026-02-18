'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

type CookieConsent = 'accepted' | 'rejected' | 'pending';

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_CONSENT_DATE_KEY = 'cookie_consent_date';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Verificar se já existe consentimento
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Aguardar um pouco antes de mostrar o banner
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (consent: CookieConsent) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent);
    localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    setShowBanner(false);

    // Se rejeitou, limpar cookies não essenciais (analytics, marketing, etc)
    if (consent === 'rejected') {
      // Limpar cookies de terceiros se existirem
      // Google Analytics, Facebook Pixel, etc.
      document.cookie.split(';').forEach((cookie) => {
        const cookieName = cookie.split('=')[0].trim();
        // Manter apenas cookies essenciais (session, auth, etc)
        const essentialCookies = ['token', 'last_tenant', 'last_login_method'];
        if (!essentialCookies.includes(cookieName)) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });
    }
  };

  const handleAcceptAll = () => {
    saveConsent('accepted');
  };

  const handleRejectNonEssential = () => {
    saveConsent('rejected');
  };

  const handleAcceptEssentialOnly = () => {
    saveConsent('rejected');
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black/30 z-[9998]" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-6">
            <div className="flex items-start gap-4">
              {/* Ícone */}
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5 text-green-600" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Utilizamos cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Nós utilizamos cookies e tecnologias semelhantes para melhorar sua experiência,
                  personalizar conteúdo e anúncios, e analisar nosso tráfego. Ao clicar em "Aceitar todos",
                  você concorda com o uso de TODOS os cookies. Você pode gerenciar suas preferências
                  clicando em "Gerenciar cookies".
                </p>

                {/* Link para política */}
                <Link
                  href="/politica-privacidade"
                  className="inline-block mt-2 text-sm text-green-600 hover:text-green-700 font-medium underline"
                >
                  Ler Política de Privacidade
                </Link>

                {/* Detalhes dos cookies */}
                {showDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 text-sm mb-3">Tipos de Cookies</h4>

                    {/* Cookies Essenciais */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Cookies Essenciais</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Sempre ativos
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Necessários para o funcionamento do site. Incluem autenticação, sessão e preferências básicas.
                      </p>
                    </div>

                    {/* Cookies de Análise */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Cookies de Análise</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          Opcional
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Nos ajudam a entender como você usa o site, permitindo melhorias contínuas na experiência.
                      </p>
                    </div>

                    {/* Cookies de Marketing */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Cookies de Marketing</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          Opcional
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Utilizados para exibir anúncios relevantes com base em seus interesses.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Botão Gerenciar */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showDetails ? 'Ocultar detalhes' : 'Gerenciar cookies'}
              </button>

              {/* Botão Rejeitar */}
              <button
                onClick={handleAcceptEssentialOnly}
                className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Apenas essenciais
              </button>

              {/* Botão Aceitar */}
              <button
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
              >
                Aceitar todos
              </button>
            </div>

            {/* Texto LGPD */}
            <p className="mt-4 text-xs text-gray-400 text-center">
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook para verificar consentimento em outros componentes
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsent | null;
    setConsent(savedConsent);
  }, []);

  return {
    consent,
    hasConsented: consent === 'accepted',
    hasRejected: consent === 'rejected',
    isPending: consent === null,
  };
}

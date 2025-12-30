'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from 'react';

const GOOGLE_CLIENT_ID = '101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com';

// Dominios autorizados no Google Cloud Console
// IMPORTANTE: Adicionar novos dominios aqui E no Google Cloud Console
const AUTHORIZED_DOMAINS = [
  'localhost',
  'localhost:3000',
  'integrius.com.br',
  'www.integrius.com.br',
  'vivoly.integrius.com.br',
  // Adicione mais subdominos conforme necessario
];

function isGoogleOAuthAllowed(): boolean {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;

  // Verificar se o dominio atual esta na lista de autorizados
  // ou se e um subdominio de integrius.com.br
  const isAuthorized = AUTHORIZED_DOMAINS.some(domain => {
    if (domain.includes('localhost')) {
      return hostname.includes('localhost') || hostname.includes('127.0.0.1');
    }
    return hostname === domain || hostname.endsWith('.' + domain.replace('www.', ''));
  });

  return isAuthorized;
}

export function GoogleOAuthWrapper({ children }: { children: React.ReactNode }) {
  const [isOAuthEnabled, setIsOAuthEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se Google OAuth deve ser habilitado para este dominio
    const shouldEnableOAuth = isGoogleOAuthAllowed();
    setIsOAuthEnabled(shouldEnableOAuth);
    setIsLoading(false);

    if (!shouldEnableOAuth) {
      console.warn(
        '[GoogleOAuth] Dominio nao autorizado para Google OAuth:',
        window.location.hostname,
        '- Login com Google desabilitado. Use login tradicional.'
      );
    }
  }, []);

  // Durante o loading inicial, renderiza sem OAuth
  if (isLoading) {
    return <>{children}</>;
  }

  // Se OAuth esta habilitado, usa o Provider
  if (isOAuthEnabled) {
    return (
      <GoogleOAuthProvider
        clientId={GOOGLE_CLIENT_ID}
        onScriptLoadError={() => {
          console.warn('[GoogleOAuth] Erro ao carregar script do Google. Login com Google indisponivel.');
        }}
      >
        {children}
      </GoogleOAuthProvider>
    );
  }

  // Se OAuth nao esta habilitado, renderiza sem o Provider
  return <>{children}</>;
}

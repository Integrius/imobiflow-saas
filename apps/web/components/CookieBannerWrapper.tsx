'use client';

import dynamic from 'next/dynamic';

// Importar CookieBanner dinamicamente para evitar SSR
const CookieBanner = dynamic(() => import('./CookieBanner'), {
  ssr: false,
});

export default function CookieBannerWrapper() {
  return <CookieBanner />;
}

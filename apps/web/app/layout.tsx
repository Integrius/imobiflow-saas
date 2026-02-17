import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthWrapper } from "@/components/GoogleOAuthWrapper";
import CookieBannerWrapper from "@/components/CookieBannerWrapper";

export const metadata: Metadata = {
  title: 'CRM Imobiliário com IA | Gestão de Leads para Imobiliárias | Integrius',
  description: 'Sistema de CRM imobiliário com inteligência artificial. Automatize a gestão de leads, acompanhe negociações e aumente suas vendas. Teste grátis por 14 dias.',
  keywords: [
    'CRM imobiliário',
    'gestão de leads imobiliários',
    'automação para imobiliárias',
    'software para corretores',
    'sistema imobiliário',
    'CRM para corretor de imóveis',
    'gestão de imobiliária',
    'automação de vendas imobiliárias',
    'IA para imobiliárias',
    'software imobiliária',
    'gestão de corretores',
    'funil de vendas imobiliário',
    'gestão de clientes imobiliários',
    'CRM gestão de clientes'
  ],
  authors: [{ name: 'Integrius' }],
  creator: 'Integrius',
  publisher: 'Integrius',
  icons: {
    icon: '/logoIntegrius.png',
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://integrius.com.br',
    siteName: 'Integrius',
    title: 'CRM Imobiliário com IA | Integrius',
    description: 'Automatize sua imobiliária com inteligência artificial. Gestão de leads, follow-up automático e muito mais. Teste grátis por 14 dias.',
    images: [
      {
        url: 'https://integrius.com.br/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Integrius - CRM Imobiliário com IA'
      }
    ]
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'CRM Imobiliário com IA | Integrius',
    description: 'Automatize sua imobiliária com inteligência artificial. Gestão de leads e automação de vendas.',
    images: ['https://integrius.com.br/og-image.png']
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },

  // Canonical
  alternates: {
    canonical: 'https://integrius.com.br'
  },

  // Verification (adicionar IDs quando disponíveis)
  // verification: {
  //   google: 'google-site-verification-id',
  // },
};

// JSON-LD Schema for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Integrius",
  "url": "https://integrius.com.br",
  "logo": "https://integrius.com.br/logoIntegrius.png",
  "description": "CRM Imobiliário com Inteligência Artificial para gestão de leads e automação de vendas.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Portuguese"
  },
  "sameAs": []
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Integrius CRM Imobiliário",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Sistema de CRM imobiliário com inteligência artificial para gestão de leads, automação de follow-up e acompanhamento de negociações.",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "97",
    "highPrice": "397",
    "priceCurrency": "BRL",
    "offerCount": "3"
  },
  "provider": {
    "@type": "Organization",
    "name": "Integrius",
    "url": "https://integrius.com.br"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body>
        <GoogleOAuthWrapper>
          {children}
          <CookieBannerWrapper />
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}

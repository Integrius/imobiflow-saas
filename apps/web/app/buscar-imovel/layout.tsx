import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscar Imóvel | Encontre sua Casa ou Apartamento Ideal | Integrius',
  description: 'Procurando imóvel para comprar ou alugar? Preencha nosso formulário gratuito e receba sugestões personalizadas de imóveis por email e WhatsApp. Sem compromisso!',
  keywords: [
    'buscar imóvel',
    'encontrar apartamento',
    'casa para comprar',
    'apartamento para alugar',
    'imóveis à venda',
    'imóveis para alugar',
    'procurar casa',
    'encontrar imóvel'
  ],
  openGraph: {
    title: 'Buscar Imóvel | Encontre sua Casa ou Apartamento Ideal',
    description: 'Preencha nosso formulário gratuito e receba sugestões personalizadas de imóveis. Sem compromisso!',
    url: 'https://integrius.com.br/buscar-imovel',
    type: 'website',
  },
  alternates: {
    canonical: 'https://integrius.com.br/buscar-imovel'
  }
};

export default function BuscarImovelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

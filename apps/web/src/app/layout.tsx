import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ImobiFlow - Gestão Imobiliária',
  description: 'Plataforma SaaS para gestão imobiliária',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

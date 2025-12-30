import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthWrapper } from "@/components/GoogleOAuthWrapper";

export const metadata: Metadata = {
  title: "Vivoly - Gestão Imobiliária Inteligente",
  description: "Sistema completo de gestão imobiliária com CRM integrado. Gerencie leads, imóveis e negociações de forma simples e eficiente.",
  keywords: ["imobiliária", "gestão", "CRM", "leads", "imóveis", "corretores"],
  authors: [{ name: "Vivoly" }],
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <GoogleOAuthWrapper>
          {children}
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}

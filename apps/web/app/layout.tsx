import type { Metadata } from "next";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";

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
        <GoogleOAuthProvider clientId="101518980847-9n7uovmjc8g561vmqormir1931og01ue.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

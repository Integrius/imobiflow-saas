import type { Metadata } from "next";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";

export const metadata: Metadata = {
  title: "ImobiFlow - Gestão Imobiliária",
  description: "Sistema de gestão imobiliária",
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

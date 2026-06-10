import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estudo de Viabilidade | Guilherme Scharf",
  description: "Business case imobiliario para investidores de renda e valorizacao patrimonial.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

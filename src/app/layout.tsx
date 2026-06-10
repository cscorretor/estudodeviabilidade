import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Case | Área Guilherme Scharf",
  description:
    "Simulador de viabilidade para frações comerciais, varejo, postos, supermercados e logística na Rua Guilherme Scharf, Blumenau.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

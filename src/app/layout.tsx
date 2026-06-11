import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://cscorretor.github.io/estudodeviabilidade/";
const socialImage = `${siteUrl}og-guilherme-scharf.png`;
const socialTitle = "Antes do Viaduto: a tese Guilherme Scharf";
const socialDescription =
  "Business case para investidores: área estratégica na Rua Guilherme Scharf, com 128.000 m² totais, 68.000 m² úteis, 1.400 m de frente e tese de valorização pós-2027.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: socialTitle,
  description: socialDescription,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Business Case Guilherme Scharf",
    title: socialTitle,
    description: socialDescription,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "Capa do business case Guilherme Scharf para investidores",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
    images: [socialImage],
  },
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

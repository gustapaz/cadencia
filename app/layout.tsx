import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:
    "CADÊNCIA · Calcular caminho crítico, folgas e cronograma de produções fictícias",
  description:
    "Calcular caminho crítico, folgas e cronograma de produções fictícias",
  metadataBase: new URL("https://cadencia-gustapaz.starrylinen.chatgpt.site"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "CAD\u00caNCIA",
    description:
      "Calcular caminho crítico, folgas e cronograma de produções fictícias",
    type: "website",
    locale: "pt_BR",
  },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

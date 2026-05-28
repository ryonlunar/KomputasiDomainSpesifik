import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimuCell-Allosteric",
  description: "Simulasi Regulasi Alosterik Enzim pada Respirasi Seluler",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-950">{children}</body>
    </html>
  );
}

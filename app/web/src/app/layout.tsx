import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "إيجاري — Locations courte durée en Tunisie",
    template: "%s | إيجاري",
  },
  description:
    "Trouvez des appartements et villas à louer en Tunisie. Paiement en dinars, factures fiscales, hôtes vérifiés.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} font-sans bg-sand-light text-ink antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

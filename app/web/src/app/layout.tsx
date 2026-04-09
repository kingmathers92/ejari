import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

// Cairo is the font used in the original design
const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: {
    default: "إيجاري — Locations courte durée en Tunisie",
    template: "%s | إيجاري",
  },
  description:
    "Première plateforme tunisienne de location courte durée. Paiement en dinars, factures fiscales, hôtes vérifiés.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${cairo.variable}`}
        style={{
          fontFamily: "var(--font-cairo), 'Cairo', sans-serif",
          background: "#FDFAF4",
          color: "#1C1A14",
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

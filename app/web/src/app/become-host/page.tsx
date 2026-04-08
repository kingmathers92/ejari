"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

const benefits = [
  {
    icon: "💰",
    title: "Revenus supplémentaires",
    desc: "Monétisez votre bien immobilier quand vous ne l'utilisez pas.",
  },
  {
    icon: "🛡️",
    title: "Paiements sécurisés",
    desc: "Paiements en dinars tunisiens via Konnect. Directs sur votre compte.",
  },
  {
    icon: "🧾",
    title: "Facturation automatique",
    desc: "Factures fiscales générées automatiquement après chaque paiement.",
  },
  {
    icon: "📊",
    title: "Tableau de bord",
    desc: "Gérez vos réservations, revenus et logements depuis un seul endroit.",
  },
];

export default function BecomeHostPage() {
  const router = useRouter();
  const { user, setUser, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBecomeHost() {
    if (!user) {
      router.push("/login?redirect=/become-host");
      return;
    }
    if (user.role === "HOST") {
      router.push("/dashboard");
      return;
    }

    setIsLoading(true);
    try {
      const { token, user: updated } = await api.auth.becomeHost();
      // Update the stored token AND user — the role changed
      login(token, { ...user, role: updated.role });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-ink mb-4">
            Devenez hôte sur{" "}
            <span
              className="text-terracotta"
              style={{ fontFamily: "Georgia, serif" }}
            >
              إيجاري
            </span>
          </h1>
          <p className="text-ink-muted text-lg max-w-xl mx-auto">
            Rejoignez des centaines d'hôtes tunisiens qui génèrent des revenus
            en louant leur logement en toute simplicité.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-2xl border border-[#E0DDD6] p-6"
            >
              <span className="text-3xl mb-3 block">{b.icon}</span>
              <h3 className="font-semibold text-ink mb-1">{b.title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-terracotta rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Prêt à commencer ?</h2>
          <p className="text-white/80 mb-6 text-sm">
            C'est gratuit. Commencez à recevoir des réservations dès
            aujourd'hui.
          </p>
          {error && <p className="text-white/80 text-sm mb-4">{error}</p>}
          <Button
            onClick={handleBecomeHost}
            isLoading={isLoading}
            className="bg-white text-terracotta hover:bg-sand px-8 py-3 rounded-xl font-semibold text-base"
          >
            {user ? "Devenir hôte maintenant" : "Se connecter pour continuer"}
          </Button>
        </div>
      </main>
    </>
  );
}

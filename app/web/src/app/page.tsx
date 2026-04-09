"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

// City tiles — colored gradients matching the original design (no photos needed)
const cities = [
  {
    name: "Tunis",
    sub: "142 logements disponibles",
    gradient: "linear-gradient(135deg, #8B6B4A 0%, #C4A882 100%)",
    mt: false,
  },
  {
    name: "Hammamet",
    sub: "89 logements disponibles",
    gradient: "linear-gradient(135deg, #2B6B7A 0%, #4A9FAD 100%)",
    mt: true,
  },
  {
    name: "Sousse",
    sub: "76 logements disponibles",
    gradient: "linear-gradient(135deg, #5C6B3A 0%, #8FA35A 100%)",
    mt: false,
  },
  {
    name: "Djerba",
    sub: "54 logements disponibles",
    gradient: "linear-gradient(135deg, #C4522A 0%, #E87A50 100%)",
    mt: true,
  },
];

const features = [
  {
    icon: "🔐",
    cls: "t",
    title: "Sécurité et confiance réelle",
    desc: "Chaque hôte et voyageur passe par une vérification d'identité. Pas de harcèlement, pas de messages anonymes.",
  },
  {
    icon: "💳",
    cls: "o",
    title: "Paiement local en dinars",
    desc: "Payez via Konnect, Flouci ou D17. Tout l'argent reste en Tunisie.",
  },
  {
    icon: "🧾",
    cls: "b",
    title: "Factures fiscales automatiques",
    desc: "Chaque réservation génère une facture pour la déclaration fiscale. Zéro friction avec l'administration.",
  },
  {
    icon: "📱",
    cls: "p",
    title: "Gestion depuis votre téléphone",
    desc: "Calendrier, messages, réservations, statistiques — tout en un seul endroit.",
  },
];

const iconBg: Record<string, string> = {
  t: "rgba(196,82,42,0.1)",
  o: "rgba(92,107,58,0.1)",
  b: "rgba(43,107,122,0.1)",
  p: "rgba(28,26,20,0.06)",
};

const plans = [
  {
    name: "Gratuit",
    price: "0",
    period: "DT/mois",
    desc: "Parfait pour commencer et tester la plateforme.",
    features: [
      "1 logement",
      "Calendrier des réservations",
      "Messagerie sécurisée",
      "Paiement local",
    ],
    featured: false,
    cta: "Commencer gratuitement",
  },
  {
    name: "Professionnel",
    price: "49",
    period: "DT/mois",
    desc: "Pour les hôtes sérieux qui veulent évoluer.",
    features: [
      "Jusqu'à 5 logements",
      "Factures fiscales automatiques",
      "Sync Airbnb & Booking",
      "Statistiques avancées",
      "Support dédié",
    ],
    featured: true,
    cta: "S'abonner maintenant",
  },
  {
    name: "Agence",
    price: "120",
    period: "DT/mois",
    desc: "Pour les agences et sociétés de gestion immobilière.",
    features: [
      "Logements illimités",
      "Multi-utilisateurs",
      "Rapports fiscaux complets",
      "API ouverte",
      "Gestionnaire de compte",
    ],
    featured: false,
    cta: "Nous contacter",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchCity, setSearchCity] = useState("");
  const [email, setEmail] = useState("");
  const [waitlistCount, setWaitlistCount] = useState(47);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  function handleSearch() {
    const p = new URLSearchParams();
    if (searchCity.trim()) p.set("city", searchCity.trim());
    router.push(`/search?${p.toString()}`);
  }

  function handleWaitlist() {
    if (!email || !email.includes("@")) return;
    setWaitlistCount((n) => n + 1);
    setJoinedWaitlist(true);
    setEmail("");
  }

  return (
    <>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          position: "relative",
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(196,82,42,0.06) 0%, transparent 70%), #FDFAF4",
        }}
      >
        {/* Eyebrow badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(196,82,42,0.1)",
            color: "#C4522A",
            padding: "6px 16px",
            borderRadius: "100px",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "24px",
            border: "1px solid rgba(196,82,42,0.2)",
            animation: "fadeUp .6s ease both",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#C4522A",
              animation: "pulse 2s infinite",
            }}
          />
          Bientôt en Tunisie
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "clamp(42px, 7vw, 80px)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#1C1A14",
            maxWidth: "800px",
            marginBottom: "12px",
            animation: "fadeUp .7s .1s ease both",
          }}
        >
          La plateforme tunisienne de location
          <br />
          <em
            style={{
              fontStyle: "italic",
              fontFamily: "Georgia, 'Playfair Display', serif",
              color: "#C4522A",
            }}
          >
            sûre et transparente
          </em>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#8A8270",
            lineHeight: 1.7,
            maxWidth: "520px",
            margin: "0 auto 40px",
            animation: "fadeUp .7s .2s ease both",
          }}
        >
          Première plateforme tunisienne de location courte durée — protection
          complète, paiement local, factures officielles.
        </p>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            gap: 0,
            background: "white",
            borderRadius: "12px",
            border: "1px solid rgba(28,26,20,0.12)",
            padding: "6px",
            maxWidth: "480px",
            width: "100%",
            margin: "0 auto 48px",
            animation: "fadeUp .7s .3s ease both",
            boxShadow: "0 4px 24px rgba(28,26,20,0.06)",
          }}
        >
          <input
            type="text"
            placeholder="Chercher à Tunis, Sousse, Hammamet..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              padding: "10px 16px",
              fontSize: "15px",
              color: "#1C1A14",
              background: "transparent",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: "#C4522A",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E87A50")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#C4522A")}
          >
            Rechercher
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            justifyContent: "center",
            animation: "fadeUp .7s .4s ease both",
          }}
        >
          {[
            { n: "+500", l: "logements inscrits" },
            { n: "13", l: "gouvernorats" },
            { n: "100%", l: "paiement sécurisé en DT" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: "28px", fontWeight: 700, color: "#1C1A14" }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: "13px", color: "#8A8270" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CITY TILES ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          padding: "0 48px",
          marginBottom: "80px",
          animation: "fadeUp .8s .5s ease both",
        }}
        className="grid-cols-2 md:grid-cols-4"
      >
        {cities.map((city) => (
          <Link
            key={city.name}
            href={`/search?city=${city.name}`}
            style={{
              aspectRatio: "4/3",
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              display: "block",
              textDecoration: "none",
              background: city.gradient,
              marginTop: city.mt ? "24px" : "0",
              transition: "transform .3s",
            }}
            className="hover:-translate-y-1"
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "32px 16px 16px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
                color: "white",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "15px" }}>
                {city.name}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>{city.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "80px 48px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: ".12em",
            color: "#C4522A",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Pourquoi إيجاري ?
        </div>
        <div
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 700,
            color: "#1C1A14",
            lineHeight: 1.2,
            maxWidth: "480px",
          }}
        >
          Une plateforme faite{" "}
          <em
            style={{
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              color: "#C4522A",
            }}
          >
            pour la Tunisie
          </em>
          <br />
          et les Tunisiens
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            marginTop: "56px",
            alignItems: "start",
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {/* Feature cards */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  padding: "24px",
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid rgba(28,26,20,0.06)",
                  transition: "transform .2s, box-shadow .2s",
                  cursor: "default",
                }}
                className="hover:-translate-x-1 hover:shadow-md"
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                    background: iconBg[f.cls],
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1C1A14",
                      marginBottom: "6px",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#8A8270",
                      lineHeight: 1.6,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mock property card */}
          <div
            style={{
              background: "#F5EFE0",
              borderRadius: "24px",
              padding: "32px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: "100px",
                fontSize: "11px",
                fontWeight: 600,
                background: "rgba(92,107,58,0.15)",
                color: "#5C6B3A",
                marginBottom: "12px",
              }}
            >
              ⭐ 4.9 · 24 avis
            </div>
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(28,26,20,0.06)",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  height: "120px",
                  background: "linear-gradient(135deg, #C4522A, #E87A50)",
                  borderRadius: "10px",
                  marginBottom: "12px",
                }}
              />
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#1C1A14",
                  marginBottom: "4px",
                }}
              >
                Appartement de luxe — Lac 2, Tunis
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#8A8270",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>2 chambres · 4 pers.</span>
                <span style={{ fontWeight: 700, color: "#C4522A" }}>
                  195 DT / nuit
                </span>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
              }}
            >
              {[
                { n: "68%", l: "Occupation" },
                { n: "4 875", l: "DT ce mois" },
                { n: "3", l: "Réservations" },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{
                    background: "#E8DFC8",
                    borderRadius: "8px",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#1C1A14",
                    }}
                  >
                    {s.n}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8A8270" }}>
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{ background: "#F5EFE0", padding: "80px 48px" }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: ".12em",
            color: "#C4522A",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Tarifs
        </div>
        <div
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 700,
            color: "#1C1A14",
            lineHeight: 1.2,
          }}
        >
          Commencez gratuitement,
          <br />
          <em
            style={{
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              color: "#C4522A",
            }}
          >
            évoluez
          </em>{" "}
          avec confiance
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "48px",
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.featured ? "#1C1A14" : "white",
                color: plan.featured ? "white" : "#1C1A14",
                borderRadius: "20px",
                padding: "32px",
                border: `1px solid ${plan.featured ? "#1C1A14" : "rgba(28,26,20,0.06)"}`,
                transform: plan.featured ? "scale(1.03)" : "none",
                transition: "transform .2s",
              }}
              className="hover:-translate-y-1"
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: "16px",
                  opacity: plan.featured ? 0.5 : 0.6,
                }}
              >
                {plan.name}
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {plan.price}{" "}
                <span
                  style={{ fontSize: "16px", fontWeight: 400, opacity: 0.5 }}
                >
                  {plan.period}
                </span>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  marginBottom: "24px",
                  lineHeight: 1.5,
                  opacity: plan.featured ? 0.6 : 0.7,
                }}
              >
                {plan.desc}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "28px",
                  padding: 0,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      opacity: plan.featured ? 0.85 : 1,
                      color: plan.featured ? "white" : "#3D3A2E",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: plan.featured ? "#E87A50" : "#5C6B3A",
                        fontSize: "13px",
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: plan.featured ? "#C4522A" : "transparent",
                  color: plan.featured ? "white" : "#C4522A",
                  border: `1.5px solid #C4522A`,
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#C4522A";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  if (!plan.featured) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#C4522A";
                  }
                }}
                onClick={() => {
                  window.location.href = "/#waitlist";
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── WAITLIST CTA ─────────────────────────────────────────────── */}
      <section
        id="waitlist"
        style={{
          padding: "100px 48px",
          textAlign: "center",
          background: "#1C1A14",
          color: "white",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: "16px",
          }}
        >
          Soyez parmi les premiers
          <br />
          <em
            style={{
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              color: "#E87A50",
            }}
          >
            hôtes
          </em>
        </h2>
        <p
          style={{
            fontSize: "17px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "40px",
          }}
        >
          Inscrivez-vous maintenant — les 100 premiers hôtes obtiennent
          l'abonnement professionnel gratuit pendant 6 mois.
        </p>

        <div
          style={{
            display: "flex",
            gap: 0,
            maxWidth: "420px",
            margin: "0 auto",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "6px",
          }}
        >
          <input
            type="email"
            placeholder="Votre adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              padding: "10px 16px",
              fontSize: "15px",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleWaitlist}
            style={{
              background: "#C4522A",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E87A50")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#C4522A")}
          >
            Rejoindre
          </button>
        </div>

        {joinedWaitlist && (
          <p
            style={{
              marginTop: "12px",
              fontSize: "15px",
              color: "#8FA35A",
              fontWeight: 600,
              animation: "fadeUp .4s ease both",
            }}
          >
            ✓ Inscription confirmée ! Nous vous contacterons bientôt.
          </p>
        )}
        <p
          style={{
            marginTop: "16px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          ✓ {waitlistCount} personnes déjà inscrites
        </p>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "#1C1A14",
          color: "rgba(255,255,255,0.4)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "13px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          إيجاري<span style={{ color: "#C4522A" }}>.</span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {[
            "Politique de confidentialité",
            "Conditions d'utilisation",
            "Nous contacter",
          ].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
              }
            >
              {l}
            </a>
          ))}
        </div>
        <div>© 2026 إيجاري — Tunisie</div>
      </footer>
    </>
  );
}

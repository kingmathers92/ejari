import { Navbar } from "@/components/layout/Navbar";
import { SearchBar } from "@/components/search/SearchBar";
import Link from "next/link";
import Image from "next/image";

const cities = [
  {
    name: "Tunis",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80",
    count: 142,
  },
  {
    name: "Hammamet",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    count: 89,
  },
  {
    name: "Sousse",
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80",
    count: 76,
  },
  {
    name: "Sidi Bou Said",
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    count: 34,
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Cherchez",
    desc: "Entrez votre destination, les dates et le nombre de voyageurs.",
  },
  {
    step: "2",
    title: "Réservez",
    desc: "Choisissez votre logement et payez en toute sécurité en dinars tunisiens.",
  },
  {
    step: "3",
    title: "Profitez",
    desc: "Recevez votre facture fiscale et communicquez directement avec l'hôte.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[520px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta-pale via-sand-light to-sand" />

        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-terracotta/5" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-sand/60" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 text-center">
          <p className="inline-flex items-center gap-2 bg-white/70 text-terracotta text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-terracotta/20">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            La plateforme tunisienne de confiance
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-ink leading-tight mb-4">
            Trouvez votre{" "}
            <span
              className="text-terracotta italic"
              style={{ fontFamily: "Georgia, serif" }}
            >
              logement idéal
            </span>
            <br />
            en Tunisie
          </h1>

          <p className="text-ink-muted text-lg mb-10 max-w-xl mx-auto">
            Locations vérifiées, paiement en dinars, factures fiscales. Simple
            et sécurisé.
          </p>

          <SearchBar />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-ink mb-2">Explorez par ville</h2>
        <p className="text-ink-muted mb-8">
          Des milliers de logements dans toute la Tunisie
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cities.map((city, i) => (
            <Link
              key={city.name}
              href={`/search?city=${city.name}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] block"
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                style={{ marginTop: i % 2 === 1 ? "16px" : "0" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="font-semibold text-base">{city.name}</p>
                <p className="text-sm text-white/80">{city.count} logements</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-sand py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-ink text-center mb-12">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-terracotta text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-ink text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-ink-muted text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-ink text-white/60 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span className="text-white font-bold text-lg">
            إيجاري<span className="text-terracotta-light">.</span>
          </span>
          <p>© 2026 إيجاري — Tunisie. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
}

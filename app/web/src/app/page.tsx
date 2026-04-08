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

const steps = [
  {
    n: "1",
    title: "Cherchez",
    desc: "Entrez votre destination, les dates et le nombre de voyageurs.",
  },
  {
    n: "2",
    title: "Réservez",
    desc: "Choisissez votre logement et payez en toute sécurité en dinars tunisiens.",
  },
  {
    n: "3",
    title: "Profitez",
    desc: "Recevez votre facture fiscale et communiquez directement avec l'hôte.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <section
        style={{
          background:
            "linear-gradient(135deg, #FAECE7 0%, #FDFAF4 50%, #F5EFE0 100%)",
          position: "relative",
          overflow: "hidden",
        }}
        className="min-h-[560px] flex items-center justify-center"
      >
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(196,82,42,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(245,239,224,0.8)",
          }}
        />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 text-center py-20">
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.8)",
              color: "#C4522A",
              fontSize: "13px",
              fontWeight: 500,
              padding: "6px 16px",
              borderRadius: "100px",
              marginBottom: "24px",
              border: "1px solid rgba(196,82,42,0.2)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#C4522A",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            La plateforme tunisienne de confiance
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 700,
              color: "#1C1A14",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Trouvez votre{" "}
            <em
              style={{
                fontStyle: "italic",
                fontFamily: "Georgia, serif",
                color: "#C4522A",
              }}
            >
              logement idéal
            </em>
            <br />
            en Tunisie
          </h1>

          <p
            style={{
              color: "#6B6860",
              fontSize: "18px",
              marginBottom: "40px",
              maxWidth: "480px",
              margin: "0 auto 40px",
            }}
          >
            Locations vérifiées, paiement en dinars, factures fiscales. Simple
            et sécurisé.
          </p>

          <SearchBar />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#1C1A14",
            marginBottom: "6px",
          }}
        >
          Explorez par ville
        </h2>
        <p style={{ color: "#6B6860", marginBottom: "32px" }}>
          Des milliers de logements dans toute la Tunisie
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cities.map((city, i) => (
            <Link
              key={city.name}
              href={`/search?city=${city.name}`}
              className="group relative rounded-2xl overflow-hidden block"
              style={{
                aspectRatio: "4/3",
                marginTop: i % 2 === 1 ? "16px" : "0",
              }}
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "16px",
                  color: "white",
                }}
              >
                <p style={{ fontWeight: 600, fontSize: "15px" }}>{city.name}</p>
                <p style={{ fontSize: "13px", opacity: 0.85 }}>
                  {city.count} logements
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: "#F5EFE0", padding: "64px 0" }}>
        <div className="max-w-5xl mx-auto px-4">
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#1C1A14",
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "#C4522A",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#1C1A14",
                    marginBottom: "8px",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    color: "#6B6860",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        style={{
          background: "#1C1A14",
          color: "rgba(255,255,255,0.5)",
          padding: "40px 0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span style={{ color: "white", fontWeight: 700, fontSize: "18px" }}>
            إيجاري<span style={{ color: "#E87A50" }}>.</span>
          </span>
          <p>© 2026 إيجاري — Tunisie. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
}

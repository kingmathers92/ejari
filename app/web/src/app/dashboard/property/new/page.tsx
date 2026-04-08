"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const CITIES = [
  "Tunis",
  "Hammamet",
  "Sousse",
  "Monastir",
  "Sfax",
  "Djerba",
  "Sidi Bou Said",
  "La Marsa",
  "Nabeul",
  "Bizerte",
];

export default function NewPropertyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    address: "",
    maxGuests: "2",
    bedrooms: "1",
    bathrooms: "1",
    pricePerNight: "",
  });

  const [photos, setPhotos] = useState<
    Array<{ url: string; isCover: boolean }>
  >([]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function addPhoto() {
    if (!photoUrl.trim()) return;
    setPhotos((prev) => [
      ...prev,
      { url: photoUrl.trim(), isCover: prev.length === 0 },
    ]);
    setPhotoUrl("");
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (prev[index].isCover && next.length > 0) {
        next[0].isCover = true;
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (!form.title || !form.city || !form.pricePerNight) {
      setError("Le titre, la ville et le prix sont obligatoires.");
      return;
    }
    if (Number(form.pricePerNight) <= 0) {
      setError("Le prix doit être supérieur à 0.");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: create the property
      const property = await api.properties.create({
        title: form.title,
        description: form.description,
        city: form.city,
        address: form.address,
        maxGuests: Number(form.maxGuests),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        pricePerNight: Number(form.pricePerNight),
      });

      // Step 2: add photos one by one
      for (const photo of photos) {
        await api.properties.addPhoto(property.id, photo.url, photo.isCover);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-6 transition-colors"
        >
          ← Tableau de bord
        </Link>

        <h1 className="text-2xl font-bold text-ink mb-8">
          Ajouter un logement
        </h1>

        <div className="space-y-6">
          {/* Basic info */}
          <section className="bg-white rounded-2xl border border-[#E0DDD6] p-6 space-y-4">
            <h2 className="font-semibold text-ink">Informations de base</h2>

            <Input
              label="Titre de l'annonce"
              placeholder="Ex: Appartement moderne vue mer à Hammamet"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">
                Description
              </label>
              <textarea
                placeholder="Décrivez votre logement — équipements, emplacement, points forts..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#E0DDD6] text-ink placeholder:text-ink-muted text-sm focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Ville</label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="px-4 py-3 rounded-xl border border-[#E0DDD6] text-ink text-sm focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none bg-white"
                >
                  <option value="">Sélectionner...</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Adresse"
                placeholder="Rue, quartier..."
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
          </section>

          {/* Capacity & rooms */}
          <section className="bg-white rounded-2xl border border-[#E0DDD6] p-6 space-y-4">
            <h2 className="font-semibold text-ink">Capacité</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">
                  Voyageurs max
                </label>
                <select
                  value={form.maxGuests}
                  onChange={(e) => update("maxGuests", e.target.value)}
                  className="px-4 py-3 rounded-xl border border-[#E0DDD6] text-ink text-sm focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Chambres</label>
                <select
                  value={form.bedrooms}
                  onChange={(e) => update("bedrooms", e.target.value)}
                  className="px-4 py-3 rounded-xl border border-[#E0DDD6] text-ink text-sm focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">
                  Salles de bain
                </label>
                <select
                  value={form.bathrooms}
                  onChange={(e) => update("bathrooms", e.target.value)}
                  className="px-4 py-3 rounded-xl border border-[#E0DDD6] text-ink text-sm focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none bg-white"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Price */}
          <section className="bg-white rounded-2xl border border-[#E0DDD6] p-6">
            <h2 className="font-semibold text-ink mb-4">Prix</h2>
            <Input
              label="Prix par nuit (DT)"
              type="number"
              placeholder="Ex: 200"
              value={form.pricePerNight}
              onChange={(e) => update("pricePerNight", e.target.value)}
              hint="TVA de 19% est incluse dans ce montant. La facture sera générée automatiquement."
            />
          </section>

          {/* Photos */}
          <section className="bg-white rounded-2xl border border-[#E0DDD6] p-6 space-y-4">
            <h2 className="font-semibold text-ink">Photos</h2>
            <p className="text-xs text-ink-muted">
              Ajoutez des URLs d'images. La première photo sera la photo de
              couverture.
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPhoto()}
                className="flex-1 px-4 py-3 rounded-xl border border-[#E0DDD6] text-ink placeholder:text-ink-muted text-sm focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none"
              />
              <Button
                variant="outline"
                onClick={addPhoto}
                disabled={!photoUrl.trim()}
              >
                Ajouter
              </Button>
            </div>

            {photos.length > 0 && (
              <div className="space-y-2">
                {photos.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-[#E0DDD6] last:border-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt=""
                      className="w-12 h-10 rounded-lg object-cover bg-sand"
                    />
                    <p className="flex-1 text-xs text-ink truncate">{p.url}</p>
                    {p.isCover && (
                      <span className="text-xs bg-terracotta-pale text-terracotta px-2 py-0.5 rounded-full shrink-0">
                        Couverture
                      </span>
                    )}
                    <button
                      onClick={() => removePhoto(i)}
                      className="text-ink-muted hover:text-red-500 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Error + submit */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Publier mon logement
          </Button>
        </div>
      </main>
    </>
  );
}

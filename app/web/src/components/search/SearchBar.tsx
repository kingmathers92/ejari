"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  function handleSearch() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E0DDD6] p-2 flex flex-col sm:flex-row gap-2">
      {/* City */}
      <div className="flex-1 px-4 py-2 flex flex-col gap-0.5">
        <label className="text-xs font-semibold text-ink uppercase tracking-wide">
          Destination
        </label>
        <input
          type="text"
          placeholder="Tunis, Hammamet, Sousse..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="text-sm text-ink placeholder:text-ink-muted bg-transparent outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      <div className="hidden sm:block w-px bg-[#E0DDD6]" />

      {/* Check-in */}
      <div className="flex-1 px-4 py-2 flex flex-col gap-0.5">
        <label className="text-xs font-semibold text-ink uppercase tracking-wide">
          Arrivée
        </label>
        <input
          type="date"
          value={checkIn}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setCheckIn(e.target.value)}
          className="text-sm text-ink bg-transparent outline-none"
        />
      </div>

      <div className="hidden sm:block w-px bg-[#E0DDD6]" />

      {/* Check-out */}
      <div className="flex-1 px-4 py-2 flex flex-col gap-0.5">
        <label className="text-xs font-semibold text-ink uppercase tracking-wide">
          Départ
        </label>
        <input
          type="date"
          value={checkOut}
          min={checkIn || new Date().toISOString().split("T")[0]}
          onChange={(e) => setCheckOut(e.target.value)}
          className="text-sm text-ink bg-transparent outline-none"
        />
      </div>

      <div className="hidden sm:block w-px bg-[#E0DDD6]" />

      {/* Guests */}
      <div className="px-4 py-2 flex flex-col gap-0.5">
        <label className="text-xs font-semibold text-ink uppercase tracking-wide">
          Voyageurs
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="text-sm text-ink bg-transparent outline-none"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} voyageur{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <Button onClick={handleSearch} size="lg" className="rounded-xl">
        Rechercher
      </Button>
    </div>
  );
}

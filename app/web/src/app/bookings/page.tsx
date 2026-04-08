"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Booking } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import Image from "next/image";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50  text-red-600  border-red-200",
  COMPLETED: "bg-blue-50 text-blue-700  border-blue-200",
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/bookings");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.bookings
      .list()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-white rounded-2xl border border-[#E0DDD6] animate-pulse"
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-ink mb-6">
          {user?.role === "HOST" ? "Réservations reçues" : "Mes réservations"}
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E0DDD6] p-16 text-center">
            <p className="text-ink-muted mb-4">
              Aucune réservation pour l'instant
            </p>
            <Link
              href="/search"
              className="text-sm text-terracotta hover:underline font-medium"
            >
              Parcourir les logements →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const nights = Math.ceil(
                (new Date(booking.checkOut).getTime() -
                  new Date(booking.checkIn).getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              const cover = booking.property?.photos?.[0];

              return (
                <Link
                  key={booking.id}
                  href={`/booking/${booking.id}`}
                  className="flex gap-4 bg-white rounded-2xl border border-[#E0DDD6] p-4 hover:border-terracotta/30 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-sand shrink-0 relative">
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-sand" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-ink truncate group-hover:text-terracotta transition-colors">
                        {booking.property?.title}
                      </p>
                      <span
                        className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[booking.status]}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </div>

                    <p className="text-sm text-ink-muted mt-1">
                      {new Date(booking.checkIn).toLocaleDateString("fr-TN", {
                        dateStyle: "medium",
                      })}{" "}
                      &rarr;{" "}
                      {new Date(booking.checkOut).toLocaleDateString("fr-TN", {
                        dateStyle: "medium",
                      })}
                      {" · "}
                      {nights} nuit{nights > 1 ? "s" : ""}
                    </p>

                    {/* Show guest name for hosts */}
                    {user?.role === "HOST" && booking.guest && (
                      <p className="text-sm text-ink-muted">
                        Voyageur : {booking.guest.fullName}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <p className="font-bold text-ink text-sm">
                        {Number(booking.totalPrice).toFixed(3)} DT
                      </p>

                      {/* Pay button for unpaid bookings */}
                      {booking.status !== "CANCELLED" &&
                        booking.paymentStatus === "PENDING" &&
                        user?.role === "GUEST" && (
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const { payUrl } = await api.payments.initiate(
                                  booking.id,
                                );
                                window.location.href = payUrl!;
                              } catch (err) {
                                alert(
                                  err instanceof Error ? err.message : "Erreur",
                                );
                              }
                            }}
                            className="text-xs bg-terracotta text-white px-3 py-1.5 rounded-lg hover:bg-terracotta-light transition-colors"
                          >
                            Payer maintenant
                          </button>
                        )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

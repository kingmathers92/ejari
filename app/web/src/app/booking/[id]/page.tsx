"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Booking, Message } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  COMPLETED: "bg-blue-50 text-blue-700",
};
const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.replace(`/login?redirect=/booking/${id}`);
      return;
    }

    api.bookings
      .getById(id)
      .then((b) => {
        setBooking(b);
        setMessages(b.messages || []);
      })
      .catch(() => router.replace("/bookings"))
      .finally(() => setIsLoading(false));
  }, [id, user, router]);

  useEffect(() => {
    if (!token || !booking) return;

    const socket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      {
        auth: { token },
      },
    );

    socket.emit("join_booking", id);

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("error", (err: { message: string }) => {
      console.error("[Socket error]", err.message);
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [token, booking, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const content = newMsg.trim();
    if (!content || !socketRef.current) return;
    socketRef.current.emit("send_message", { bookingId: id, content });
    setNewMsg("");
  }

  if (isLoading || !booking) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() -
      new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const isHost = booking.property?.host?.id === user?.id;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/bookings"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-6 transition-colors"
        >
          ← Mes réservations
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-ink">
                {isHost
                  ? `Réservation de ${booking.guest?.fullName}`
                  : booking.property?.title}
              </h1>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[booking.status]}`}
              >
                {statusLabels[booking.status]}
              </span>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-[#E0DDD6] p-4 h-96 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 && (
                <p className="text-ink-muted text-sm text-center py-8">
                  Aucun message. Envoyez le premier message à{" "}
                  {isHost ? booking.guest?.fullName : "l'hôte"}.
                </p>
              )}
              {messages.map((msg) => {
                const isMine = msg.sender.id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${isMine ? "bg-terracotta text-white" : "bg-sand text-ink"}`}
                    >
                      {msg.sender.fullName.charAt(0)}
                    </div>
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? "bg-terracotta text-white rounded-tr-sm" : "bg-sand text-ink rounded-tl-sm"}`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {booking.status !== "CANCELLED" && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#E0DDD6] text-ink placeholder:text-ink-muted text-sm focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none"
                />
                <Button onClick={sendMessage} disabled={!newMsg.trim()}>
                  Envoyer
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E0DDD6] p-5 space-y-3 text-sm">
              <h2 className="font-semibold text-ink text-base">Détails</h2>
              <div className="flex justify-between">
                <span className="text-ink-muted">Arrivée</span>
                <span className="text-ink font-medium">
                  {new Date(booking.checkIn).toLocaleDateString("fr-TN", {
                    dateStyle: "medium",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Départ</span>
                <span className="text-ink font-medium">
                  {new Date(booking.checkOut).toLocaleDateString("fr-TN", {
                    dateStyle: "medium",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Durée</span>
                <span className="text-ink font-medium">
                  {nights} nuit{nights > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Voyageurs</span>
                <span className="text-ink font-medium">
                  {booking.guestsCount}
                </span>
              </div>
              <hr className="border-[#E0DDD6]" />
              <div className="flex justify-between font-bold text-ink">
                <span>Total</span>
                <span>{Number(booking.totalPrice).toFixed(3)} DT</span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 text-sm ${booking.paymentStatus === "PAID" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
            >
              <p className="font-medium">
                {booking.paymentStatus === "PAID"
                  ? "✓ Paiement reçu"
                  : "⏳ Paiement en attente"}
              </p>
            </div>

            {booking.paymentStatus === "PENDING" &&
              !isHost &&
              booking.status !== "CANCELLED" && (
                <Button
                  fullWidth
                  onClick={async () => {
                    try {
                      const { payUrl } = await api.payments.initiate(
                        booking.id,
                      );
                      window.location.href = payUrl!;
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Erreur");
                    }
                  }}
                >
                  Payer maintenant
                </Button>
              )}

            {isHost && booking.status === "PENDING" && (
              <Button
                fullWidth
                onClick={async () => {
                  try {
                    await api.bookings.confirm(booking.id);
                    setBooking((prev) =>
                      prev ? { ...prev, status: "CONFIRMED" } : prev,
                    );
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Erreur");
                  }
                }}
              >
                Confirmer la réservation
              </Button>
            )}

            {booking.status !== "CANCELLED" &&
              booking.status !== "COMPLETED" && (
                <Button
                  fullWidth
                  variant="outline"
                  onClick={async () => {
                    if (!confirm("Annuler cette réservation ?")) return;
                    try {
                      await api.bookings.cancel(booking.id);
                      setBooking((prev) =>
                        prev ? { ...prev, status: "CANCELLED" } : prev,
                      );
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Erreur");
                    }
                  }}
                >
                  Annuler
                </Button>
              )}

            {/* Invoice link */}
            {booking.invoice && (
              <Link
                href={`/booking/${id}/invoice`}
                className="block text-center text-sm text-terracotta hover:underline"
              >
                Télécharger la facture →
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

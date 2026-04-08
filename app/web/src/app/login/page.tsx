"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Step = "phone" | "otp";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) router.replace(searchParams.get("redirect") || "/");
  }, [user, router, searchParams]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleRequestOtp() {
    const cleaned = phone.trim().replace(/\s/g, "");
    if (!/^\+?[0-9]{8,15}$/.test(cleaned)) {
      setError("Numéro invalide");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await api.auth.requestOtp(cleaned);
      setPhone(cleaned);
      setStep("otp");
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (code.length !== 6) {
      setError("Code à 6 chiffres requis");
      return;
    }
    if (isNewUser && fullName.trim().length < 2) {
      setError("Nom requis");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const { token, user: u } = await api.auth.verifyOtp(
        phone,
        code,
        isNewUser ? fullName.trim() : undefined,
      );
      login(token, u);
      router.replace(searchParams.get("redirect") || "/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Code incorrect";
      setError(msg);
      if (
        msg.toLowerCase().includes("fullname") ||
        msg.toLowerCase().includes("nom")
      )
        setIsNewUser(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setCode("");
    setIsLoading(true);
    try {
      await api.auth.requestOtp(phone);
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E0DDD6] p-8">
      {step === "phone" ? (
        <>
          <h1 className="text-xl font-bold text-ink mb-1">Connexion</h1>
          <p className="text-sm text-ink-muted mb-6">
            Entrez votre numéro — nous vous envoyons un code
          </p>
          <Input
            label="Numéro de téléphone"
            type="tel"
            placeholder="+216 XX XXX XXX"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
            error={error}
            autoFocus
          />
          <Button
            fullWidth
            size="lg"
            className="mt-4"
            onClick={handleRequestOtp}
            isLoading={isLoading}
          >
            Envoyer le code
          </Button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setStep("phone");
              setError("");
              setCode("");
            }}
            className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-xl font-bold text-ink mb-1">
            Code de vérification
          </h1>
          <p className="text-sm text-ink-muted mb-6">
            Envoyé au <strong className="text-ink">{phone}</strong>
            {process.env.NODE_ENV === "development" && (
              <span className="block text-xs text-terracotta mt-1">
                Dev — code dans le terminal API
              </span>
            )}
          </p>
          {isNewUser && (
            <div className="mb-4">
              <Input
                label="Votre nom complet"
                placeholder="Ahmed Ben Ali"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError("");
                }}
                hint="Première inscription ? Entrez votre nom."
                autoFocus
              />
            </div>
          )}
          <div className="mb-4">
            <label className="text-sm font-medium text-ink block mb-2">
              Code à 6 chiffres
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setCode(v);
                setError("");
                if (v.length === 6) setTimeout(handleVerifyOtp, 100);
              }}
              className="w-full text-center text-2xl font-bold tracking-[0.5em] border border-[#E0DDD6] rounded-xl py-4 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none"
              autoFocus={!isNewUser}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <Button
            fullWidth
            size="lg"
            onClick={handleVerifyOtp}
            isLoading={isLoading}
            disabled={code.length !== 6}
          >
            {isNewUser ? "Créer mon compte" : "Se connecter"}
          </Button>
          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-sm text-ink-muted">
                Renvoyer dans {countdown}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-terracotta hover:underline"
                disabled={isLoading}
              >
                Renvoyer le code
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-sand-light flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8">
          <span className="text-3xl font-bold text-ink">
            إيجاري<span className="text-terracotta">.</span>
          </span>
        </Link>
        <Suspense
          fallback={
            <div className="h-64 bg-white rounded-2xl border border-[#E0DDD6] animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>
        <p className="text-xs text-ink-muted text-center mt-6">
          En continuant, vous acceptez nos{" "}
          <a href="#" className="underline">
            CGU
          </a>
        </p>
      </div>
    </div>
  );
}

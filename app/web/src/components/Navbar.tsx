"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-sand-light/90 backdrop-blur-sm border-b border-[#E0DDD6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-ink">
            إيجاري
            <span className="text-terracotta">.</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/search"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Explorer
          </Link>

          {user ? (
            <>
              {user.role === "HOST" && (
                <Link
                  href="/dashboard"
                  className="text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  Tableau de bord
                </Link>
              )}
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E0DDD6] hover:border-terracotta/40 transition-colors"
                >
                  {/* Avatar initials */}
                  <div className="w-7 h-7 rounded-full bg-terracotta-pale flex items-center justify-center text-xs font-semibold text-terracotta">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-ink">
                    {user.fullName.split(" ")[0]}
                  </span>
                  <svg
                    className="w-4 h-4 text-ink-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#E0DDD6] shadow-lg overflow-hidden z-10">
                      <Link
                        href="/bookings"
                        className="block px-4 py-2.5 text-sm text-ink hover:bg-sand transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Mes réservations
                      </Link>
                      {user.role === "GUEST" && (
                        <Link
                          href="/become-host"
                          className="block px-4 py-2.5 text-sm text-terracotta hover:bg-terracotta-pale transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          Devenir hôte
                        </Link>
                      )}
                      <hr className="border-[#E0DDD6]" />
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-ink-muted hover:bg-sand transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Connexion
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

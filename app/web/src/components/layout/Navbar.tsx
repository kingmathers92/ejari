"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 48px",
        background: "rgba(253,250,244,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(28,26,20,0.08)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: "#1C1A14",
          textDecoration: "none",
          letterSpacing: "-0.5px",
        }}
      >
        إيجاري<span style={{ color: "#C4522A" }}>.</span>
      </Link>

      {/* Nav links */}
      <ul
        style={{
          display: "flex",
          gap: "32px",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
        className="hidden md:flex"
      >
        <li>
          <Link
            href="/search"
            style={{
              textDecoration: "none",
              color: "#8A8270",
              fontSize: "15px",
              fontWeight: 500,
            }}
            className="hover:text-[#1C1A14] transition-colors"
          >
            Explorer
          </Link>
        </li>
        <li>
          <Link
            href="/#features"
            style={{
              textDecoration: "none",
              color: "#8A8270",
              fontSize: "15px",
              fontWeight: 500,
            }}
            className="hover:text-[#1C1A14] transition-colors"
          >
            Fonctionnalités
          </Link>
        </li>
        <li>
          <Link
            href="/#pricing"
            style={{
              textDecoration: "none",
              color: "#8A8270",
              fontSize: "15px",
              fontWeight: 500,
            }}
            className="hover:text-[#1C1A14] transition-colors"
          >
            Tarifs
          </Link>
        </li>
      </ul>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(28,26,20,0.12)",
                background: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                color: "#1C1A14",
              }}
            >
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "rgba(196,82,42,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#C4522A",
                }}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              {user.fullName.split(" ")[0]}
            </button>

            {menuOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: "8px",
                    width: "200px",
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid rgba(28,26,20,0.08)",
                    boxShadow: "0 8px 32px rgba(28,26,20,0.08)",
                    overflow: "hidden",
                    zIndex: 10,
                  }}
                >
                  {user.role === "HOST" && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "block",
                        padding: "10px 16px",
                        fontSize: "14px",
                        color: "#1C1A14",
                        textDecoration: "none",
                      }}
                      className="hover:bg-[#F5EFE0] transition-colors"
                    >
                      Tableau de bord
                    </Link>
                  )}
                  <Link
                    href="/bookings"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      fontSize: "14px",
                      color: "#1C1A14",
                      textDecoration: "none",
                    }}
                    className="hover:bg-[#F5EFE0] transition-colors"
                  >
                    Mes réservations
                  </Link>
                  {user.role === "GUEST" && (
                    <Link
                      href="/become-host"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "block",
                        padding: "10px 16px",
                        fontSize: "14px",
                        color: "#C4522A",
                        textDecoration: "none",
                      }}
                      className="hover:bg-[#FAECE7] transition-colors"
                    >
                      Devenir hôte
                    </Link>
                  )}
                  <hr
                    style={{ borderColor: "rgba(28,26,20,0.08)", margin: 0 }}
                  />
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      fontSize: "14px",
                      color: "#8A8270",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    className="hover:bg-[#F5EFE0] transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                fontSize: "14px",
                color: "#8A8270",
                textDecoration: "none",
                fontWeight: 500,
              }}
              className="hover:text-[#1C1A14] transition-colors hidden md:block"
            >
              Connexion
            </Link>
            <button
              onClick={() => {
                window.location.href = "/#waitlist";
              }}
              style={{
                background: "#C4522A",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background .2s",
              }}
              className="hover:bg-[#E87A50]"
            >
              Rejoindre
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

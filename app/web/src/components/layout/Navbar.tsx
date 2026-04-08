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
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(253,250,244,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E0DDD6",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6"
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#1C1A14",
            textDecoration: "none",
          }}
        >
          إيجاري<span style={{ color: "#C4522A" }}>.</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link
            href="/search"
            style={{
              fontSize: "14px",
              color: "#6B6860",
              textDecoration: "none",
            }}
            className="hover:text-[#1C1A14] transition-colors"
          >
            Explorer
          </Link>

          {user ? (
            <>
              {user.role === "HOST" && (
                <Link
                  href="/dashboard"
                  style={{
                    fontSize: "14px",
                    color: "#6B6860",
                    textDecoration: "none",
                  }}
                  className="hover:text-[#1C1A14] transition-colors"
                >
                  Tableau de bord
                </Link>
              )}

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    border: "1px solid #E0DDD6",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#FAECE7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#C4522A",
                    }}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "14px", color: "#1C1A14" }}>
                    {user.fullName.split(" ")[0]}
                  </span>
                  <svg
                    style={{ width: "14px", height: "14px", color: "#6B6860" }}
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
                    <div
                      style={{ position: "fixed", inset: 0 }}
                      onClick={() => setMenuOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        marginTop: "8px",
                        width: "192px",
                        background: "white",
                        borderRadius: "12px",
                        border: "1px solid #E0DDD6",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                        zIndex: 10,
                      }}
                    >
                      {[{ href: "/bookings", label: "Mes réservations" }].map(
                        (item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            style={{
                              display: "block",
                              padding: "10px 16px",
                              fontSize: "14px",
                              color: "#1C1A14",
                              textDecoration: "none",
                            }}
                            className="hover:bg-[#F5EFE0] transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ),
                      )}
                      {user.role === "GUEST" && (
                        <Link
                          href="/become-host"
                          style={{
                            display: "block",
                            padding: "10px 16px",
                            fontSize: "14px",
                            color: "#C4522A",
                            textDecoration: "none",
                          }}
                          className="hover:bg-[#FAECE7] transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          Devenir hôte
                        </Link>
                      )}
                      <hr style={{ borderColor: "#E0DDD6", margin: 0 }} />
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
                          color: "#6B6860",
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
            </>
          ) : (
            <Link
              href="/login"
              style={{
                fontSize: "14px",
                padding: "8px 20px",
                borderRadius: "10px",
                border: "1px solid #C4522A",
                color: "#C4522A",
                textDecoration: "none",
                fontWeight: 500,
              }}
              className="hover:bg-[#FAECE7] transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

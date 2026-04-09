"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => {
    setMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(253,250,244,0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(28,26,20,0.08)",
        }}
      >
        <div
          className="container"
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
            onClick={close}
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#1C1A14",
              textDecoration: "none",
            }}
          >
            إيجاري<span style={{ color: "#C4522A" }}>.</span>
          </Link>

          {/* Desktop links */}
          <ul
            className="nav-desktop"
            style={{
              gap: "28px",
              listStyle: "none",
              margin: 0,
              padding: 0,
              alignItems: "center",
            }}
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
              >
                Tarifs
              </Link>
            </li>
          </ul>

          {/* Desktop right */}
          <div
            className="nav-desktop"
            style={{ alignItems: "center", gap: "12px" }}
          >
            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 14px",
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
                      background: "#FAECE7",
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
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#8A8270"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                    <UserMenu user={user} logout={logout} close={close} />
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
                >
                  Connexion
                </Link>
                <Link href="/#waitlist" className="btn btn-primary btn-sm">
                  Rejoindre
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              color: "#1C1A14",
              alignItems: "center",
            }}
          >
            {mobileOpen ? (
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              background: "white",
              borderTop: "1px solid rgba(28,26,20,0.08)",
              padding: "12px 0",
            }}
          >
            {[
              { href: "/search", label: "Explorer" },
              { href: "/#features", label: "Fonctionnalités" },
              { href: "/#pricing", label: "Tarifs" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                style={{
                  display: "block",
                  padding: "12px 24px",
                  fontSize: "15px",
                  color: "#1C1A14",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {l.label}
              </Link>
            ))}
            <div
              style={{
                borderTop: "1px solid rgba(28,26,20,0.08)",
                margin: "8px 0",
                padding: "8px 24px 4px",
              }}
            >
              {user ? (
                <>
                  {user.role === "HOST" && (
                    <Link
                      href="/dashboard"
                      onClick={close}
                      style={{
                        display: "block",
                        padding: "10px 0",
                        fontSize: "15px",
                        color: "#1C1A14",
                        textDecoration: "none",
                      }}
                    >
                      Tableau de bord
                    </Link>
                  )}
                  <Link
                    href="/bookings"
                    onClick={close}
                    style={{
                      display: "block",
                      padding: "10px 0",
                      fontSize: "15px",
                      color: "#1C1A14",
                      textDecoration: "none",
                    }}
                  >
                    Mes réservations
                  </Link>
                  {user.role === "GUEST" && (
                    <Link
                      href="/become-host"
                      onClick={close}
                      style={{
                        display: "block",
                        padding: "10px 0",
                        fontSize: "15px",
                        color: "#C4522A",
                        textDecoration: "none",
                      }}
                    >
                      Devenir hôte
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      close();
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "10px 0",
                      fontSize: "15px",
                      color: "#8A8270",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "block",
                    }}
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Link
                    href="/login"
                    onClick={close}
                    className="btn btn-outline btn-full"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/#waitlist"
                    onClick={close}
                    className="btn btn-primary btn-full"
                  >
                    Rejoindre
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

function UserMenu({
  user,
  logout,
  close,
}: {
  user: any;
  logout: () => void;
  close: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "calc(100% + 8px)",
        width: "200px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid rgba(28,26,20,0.1)",
        boxShadow: "0 8px 32px rgba(28,26,20,0.1)",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(28,26,20,0.06)",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1C1A14",
            margin: 0,
          }}
        >
          {user.fullName}
        </p>
        <p style={{ fontSize: "12px", color: "#8A8270", margin: 0 }}>
          {user.phone}
        </p>
      </div>
      {user.role === "HOST" && (
        <MItem href="/dashboard" label="Tableau de bord" close={close} />
      )}
      <MItem href="/bookings" label="Mes réservations" close={close} />
      <MItem href="/profile" label="Mon profil" close={close} />
      {user.role === "GUEST" && (
        <MItem
          href="/become-host"
          label="Devenir hôte"
          close={close}
          color="#C4522A"
        />
      )}
      <div style={{ borderTop: "1px solid rgba(28,26,20,0.06)" }}>
        <button
          onClick={() => {
            logout();
            close();
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
            fontFamily: "inherit",
          }}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

function MItem({
  href,
  label,
  close,
  color,
}: {
  href: string;
  label: string;
  close: () => void;
  color?: string;
}) {
  return (
    <Link
      href={href}
      onClick={close}
      style={{
        display: "block",
        padding: "10px 16px",
        fontSize: "14px",
        color: color || "#1C1A14",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
}

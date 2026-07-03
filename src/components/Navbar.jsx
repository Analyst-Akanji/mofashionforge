import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";

const NAV_LINKS = [
  { label: "Shop",          to: "/shop" },
  { label: "Custom Orders", to: "/custom-orders" },
  { label: "Gallery",       to: "/gallery" },
  { label: "About",         to: "/about" },
  { label: "Contact",       to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = isHome
    ? scrolled ? "rgba(250,248,243,0.96)" : "transparent"
    : "rgba(250,248,243,0.98)";

  const textColor = isHome && !scrolled ? "#FAF8F3" : "#0F0F0F";

  return (
    <header
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background: navBg,
        backdropFilter: scrolled || !isHome ? "blur(12px)" : "none",
        borderBottom: scrolled || !isHome ? "1px solid rgba(184,151,58,0.15)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}
    >
      <nav style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "Cormorant Garamond, serif",
            fontWeight: 600,
            fontSize: "22px",
            color: textColor,
            letterSpacing: "0.02em",
            transition: "color 0.3s",
          }}>
            Mo_FashionForge
          </span>
        </Link>

        <ul style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }} className="hide-mobile">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: textColor,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  opacity: location.pathname === link.to ? 1 : 0.75,
                  transition: "opacity 0.2s, color 0.3s",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            aria-label="View cart"
            style={{ background: "none", border: "none", cursor: "pointer", color: textColor, transition: "color 0.3s" }}
            className="hide-mobile"
          >
            <ShoppingBag size={20} />
          </button>
          <Link
            to="/shop"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              background: "#B8973A",
              color: "#FAF8F3",
              padding: "10px 20px",
              borderRadius: "2px",
              textDecoration: "none",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
            className="hide-mobile"
          >
            Shop Now
          </Link>

          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: textColor, display: "none" }}
            className="show-mobile"
            aria-label="Toggle menu"
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div style={{
          background: "#FAF8F3",
          borderTop: "1px solid rgba(184,151,58,0.15)",
          padding: "24px",
        }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {NAV_LINKS.map((link) => (
              <li key={link.to} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "16px 0",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    color: "#0F0F0F",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/shop"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              textAlign: "center",
              background: "#B8973A",
              color: "#FAF8F3",
              padding: "14px",
              marginTop: "20px",
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Shop Now
          </Link>
        </div>
      )}
    </header>
  );
}

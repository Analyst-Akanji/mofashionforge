import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const NAV = [
  { label: "Overview",   to: "/admin",             icon: "◈" },
  { label: "Orders",     to: "/admin/orders",       icon: "📦" },
  { label: "Products",   to: "/admin/products",     icon: "🧶" },
  { label: "Gallery",    to: "/admin/gallery",      icon: "🖼" },
  { label: "Inquiries",  to: "/admin/inquiries",    icon: "✉" },
  { label: "Messages",   to: "/admin/messages",     icon: "💬" },
  { label: "Blog",       to: "/admin/blog",         icon: "✍" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
      else setUser(session.user);
    });
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const currentPage = NAV.find(n => n.to === location.pathname)?.label || "Admin";

  const navLink = (item) => {
    const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to));
    return (
      <Link key={item.to} to={item.to} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 20px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: active ? "#B8973A" : "rgba(250,248,243,0.6)", textDecoration: "none", background: active ? "rgba(184,151,58,0.08)" : "transparent", borderLeft: active ? "2px solid #B8973A" : "2px solid transparent", transition: "all 0.15s" }}>
        <span style={{ fontSize: "14px" }}>{item.icon}</span>{item.label}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "Inter, sans-serif" }}>
      {/* Mobile top bar */}
      <div style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#0F0F0F", height: "56px", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid rgba(184,151,58,0.2)" }} className="mobile-topbar">
        <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "#FAF8F3", margin: 0 }}>{currentPage}</p>
        <button onClick={() => setMobileOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#FAF8F3", fontSize: "22px", padding: "4px 8px", lineHeight: 1 }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position: "fixed", top: "56px", left: 0, right: 0, zIndex: 99, background: "#0F0F0F", borderBottom: "1px solid rgba(184,151,58,0.2)", padding: "8px 0 16px" }} className="mobile-menu">
          {NAV.map(item => {
            const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", fontFamily: "Inter, sans-serif", fontSize: "14px", color: active ? "#B8973A" : "rgba(250,248,243,0.75)", textDecoration: "none", background: active ? "rgba(184,151,58,0.08)" : "transparent", borderLeft: active ? "3px solid #B8973A" : "3px solid transparent" }}>
                <span style={{ fontSize: "16px" }}>{item.icon}</span>{item.label}
              </Link>
            );
          })}
          <div style={{ margin: "12px 20px 0", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(250,248,243,0.4)", margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
            <button onClick={logout} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(250,248,243,0.5)", background: "none", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", padding: "8px 16px" }}>Sign Out</button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside style={{ width: "220px", background: "#0F0F0F", borderRight: "1px solid rgba(184,151,58,0.15)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }} className="desktop-sidebar">
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(184,151,58,0.15)" }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 4px" }}>Admin</p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "#FAF8F3", margin: 0 }}>Mo_FashionForge</p>
        </div>
        <nav style={{ flex: 1, padding: "12px 0" }}>{NAV.map(navLink)}</nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(184,151,58,0.15)" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(250,248,243,0.4)", margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          <button onClick={logout} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.5)", background: "none", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", padding: "8px 16px", width: "100%" }}>Sign Out</button>
        </div>
      </aside>

      <main style={{ marginLeft: "220px" }} className="admin-main">{children}</main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .admin-main { margin-left: 0 !important; padding-top: 56px; }
        }
      `}</style>
    </div>
  );
}

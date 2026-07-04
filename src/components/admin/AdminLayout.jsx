import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const NAV = [
  { label: "Overview",   to: "/admin" },
  { label: "Orders",     to: "/admin/orders" },
  { label: "Products",   to: "/admin/products" },
  { label: "Inquiries",  to: "/admin/inquiries" },
  { label: "Messages",   to: "/admin/messages" },
  { label: "Blog",       to: "/admin/blog" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/admin/login"); }
      else { setUser(session.user); }
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "240px", background: "#0F0F0F", borderRight: "1px solid rgba(184,151,58,0.15)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }} className="admin-sidebar">
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(184,151,58,0.15)" }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 4px" }}>Admin</p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "#FAF8F3", margin: 0 }}>Mo_FashionForge</p>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV.map((item) => {
            const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: "block", padding: "12px 24px",
                  fontFamily: "Inter, sans-serif", fontSize: "13px",
                  color: active ? "#B8973A" : "rgba(250,248,243,0.6)",
                  textDecoration: "none",
                  background: active ? "rgba(184,151,58,0.08)" : "transparent",
                  borderLeft: active ? "2px solid #B8973A" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(184,151,58,0.15)" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(250,248,243,0.4)", margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email}
          </p>
          <button
            onClick={logout}
            style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.5)", background: "none", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", padding: "8px 16px", width: "100%" }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: "240px", flex: 1, background: "#F5F5F5", minHeight: "100vh" }} className="admin-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}

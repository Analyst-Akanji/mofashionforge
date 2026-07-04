import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F0F", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#1A1A1A", border: "1px solid rgba(184,151,58,0.2)", borderRadius: "4px", padding: "48px", width: "100%", maxWidth: "400px" }}>
        <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 8px" }}>
          Admin
        </p>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#FAF8F3", margin: "0 0 32px" }}>
          Mo_FashionForge
        </h1>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.5)", display: "block", marginBottom: "8px" }}>Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#FAF8F3", fontFamily: "Inter, sans-serif", fontSize: "14px", padding: "12px 16px", outline: "none", boxSizing: "border-box", borderRadius: "2px" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.5)", display: "block", marginBottom: "8px" }}>Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#FAF8F3", fontFamily: "Inter, sans-serif", fontSize: "14px", padding: "12px 16px", outline: "none", boxSizing: "border-box", borderRadius: "2px" }}
            />
          </div>
          {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#E05252", margin: 0 }}>{error}</p>}
          <button
            type="submit" disabled={loading}
            style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "14px", marginTop: "8px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

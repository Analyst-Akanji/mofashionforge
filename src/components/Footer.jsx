import { Link } from "react-router-dom";

const INSTAGRAM_URL = "https://www.instagram.com/mo_fashionforge";
const WHATSAPP_URL = "https://wa.me/2348185123890";

export default function Footer() {
  return (
    <footer style={{ background: "#0F0F0F", borderTop: "1px solid rgba(184,151,58,0.2)", padding: "48px 24px 32px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
          <div>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", color: "#FAF8F3", margin: "0 0 12px" }}>Mo_FashionForge</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(250,248,243,0.5)", lineHeight: 1.7, maxWidth: "260px", margin: "0 0 20px" }}>
              Premium handcrafted crochet pieces for those who wear fashion as an art form.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", color: "#B8973A", textDecoration: "none", textTransform: "uppercase" }}>Instagram</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", color: "#B8973A", textDecoration: "none", textTransform: "uppercase" }}>WhatsApp</a>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#B8973A", marginBottom: "16px" }}>Shop</p>
            {["Crochet Earrings", "Bucket Hats", "Tops", "Sweatshirts", "Accessories", "Limited Edition"].map(item => (
              <Link key={item} to="/shop" style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(250,248,243,0.55)", textDecoration: "none", marginBottom: "10px" }}>{item}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#B8973A", marginBottom: "16px" }}>Pages</p>
            {[["About", "/about"], ["Gallery", "/gallery"], ["Custom Orders", "/custom-orders"], ["Contact", "/contact"]].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(250,248,243,0.55)", textDecoration: "none", marginBottom: "10px" }}>{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#B8973A", marginBottom: "16px" }}>Info</p>
            {["FAQ", "Shipping Policy", "Returns Policy", "Privacy Policy"].map(item => (
              <p key={item} style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(250,248,243,0.55)", marginBottom: "10px", cursor: "pointer" }}>{item}</p>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(250,248,243,0.08)", paddingTop: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(250,248,243,0.3)", margin: 0 }}>
            © {new Date().getFullYear()} Mo_FashionForge. All rights reserved.
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(250,248,243,0.3)", margin: 0 }}>
            Built by <a href="https://argonindustries.com.ng" target="_blank" rel="noreferrer" style={{ color: "#B8973A", textDecoration: "none" }}>Argon Industries</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

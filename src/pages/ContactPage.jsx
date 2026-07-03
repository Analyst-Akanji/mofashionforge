import { useState } from "react";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const WHATSAPP_URL = "https://wa.me/2348185123890";
const INSTAGRAM_URL = "https://www.instagram.com/mo_fashionforge";
const EMAIL = "karimotmorayo2019@gmail.com";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  return (
    <>
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        <PageHero
          image="/assets/hero-contact.jpg"
          label="Get in Touch"
          title="Let's Create<br /><em>Something Beautiful.</em>"
          subtitle="Morayo responds to all enquiries within 24 hours."
        />

        <div style={{ padding: "80px 24px", background: "#FAF8F3" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px" }} className="contact-grid-page">

            {/* Left — contact info */}
            <div>
              <span className="section-label">Reach Out</span>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#0F0F0F", margin: "16px 0 32px", lineHeight: 1.2 }}>
                We'd love to hear from you
              </h2>
              {[
                { label: "WhatsApp", value: "+234 818 512 8390", href: WHATSAPP_URL, icon: "💬" },
                { label: "Instagram", value: "@mo_fashionforge", href: INSTAGRAM_URL, icon: "📸" },
                { label: "Email", value: EMAIL, href: `mailto:${EMAIL}`, icon: "✉️" },
                { label: "Business Hours", value: "Mon–Sat, 9am–6pm WAT", href: null, icon: "🕘" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "20px", marginTop: "2px" }}>{item.icon}</span>
                  <div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 4px" }}>{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#0F0F0F", textDecoration: "none", borderBottom: "1px solid rgba(0,0,0,0.15)" }}>{item.value}</a>
                    ) : (
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#0F0F0F", margin: 0 }}>{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: "12px", marginTop: "40px", flexWrap: "wrap" }}>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#0F0F0F", color: "#FAF8F3", padding: "14px 24px", textDecoration: "none" }}>
                  WhatsApp Morayo
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid #0F0F0F", color: "#0F0F0F", padding: "14px 24px", textDecoration: "none" }}>
                  Instagram
                </a>
              </div>
            </div>

            {/* Right — form */}
            <div>
              {sent ? (
                <div style={{ background: "#F0EDE6", padding: "40px", textAlign: "center" }}>
                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: "#3B4A3E", margin: "0 0 8px" }}>Message sent!</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", margin: 0 }}>Morayo will be in touch within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { name: "name", label: "Full Name *", type: "text" },
                    { name: "email", label: "Email Address *", type: "email" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "8px" }}>{field.label}</label>
                      <input type={field.type} required value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} style={{ width: "100%", background: "#F0EDE6", border: "1px solid rgba(0,0,0,0.1)", color: "#0F0F0F", fontFamily: "Inter, sans-serif", fontSize: "14px", padding: "14px 16px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "8px" }}>Message *</label>
                    <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can Morayo help you?" style={{ width: "100%", background: "#F0EDE6", border: "1px solid rgba(0,0,0,0.1)", color: "#0F0F0F", fontFamily: "Inter, sans-serif", fontSize: "14px", padding: "14px 16px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  </div>
                  <button type="submit" style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "18px 32px" }}>
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </main>
      <style>{`
        @media (max-width: 768px) {
          .contact-grid-page { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </>
  );
}

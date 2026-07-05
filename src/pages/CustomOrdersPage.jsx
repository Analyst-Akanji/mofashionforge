import { useState } from "react";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import { supabase } from "../lib/supabase";

const WHATSAPP_URL = "https://wa.me/2348185123890";

export default function CustomOrdersPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", description: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("custom_order_inquiries")
      .insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        description: form.description,
        status: "new",
      });

    if (error) {
      setError("Something went wrong. Please try WhatsApp directly.");
    } else {
      setSent(true);
    }
    setSaving(false);
  };

  return (
    <>
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        <PageHero
          image="/assets/hero-custom.jpg"
          label="Custom Orders"
          title="Made for You.<br /><em>Made by Hand.</em>"
          subtitle="Commission a bespoke crochet piece tailored to your exact vision."
        />

        {/* What can be customised */}
        <div style={{ background: "#FAF8F3", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }} className="custom-grid">
            <div>
              <span className="section-label">What's Possible</span>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#0F0F0F", margin: "16px 0 24px", lineHeight: 1.2 }}>
                Every detail, your way
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#6B6B6B", lineHeight: 1.9, marginBottom: "32px" }}>
                From colour and stitch pattern to size and silhouette — Mo_FashionForge customises every element of your piece to match your exact vision.
              </p>
              {[
                { title: "Colours", text: "Choose from any yarn colour or bring your own inspiration — Pantone codes, swatches, or reference photos all welcome." },
                { title: "Size & Fit", text: "Every custom order is sized to your measurements. Morayo will guide you through the sizing process after enquiry." },
                { title: "Design Details", text: "Stitch patterns, embellishments, necklines, hemlines — every design detail is open for discussion." },
                { title: "Occasion-Specific", text: "Wedding, graduation, editorial shoot, or everyday wear — your occasion shapes the design brief." },
              ].map((item) => (
                <div key={item.title} style={{ borderLeft: "2px solid #B8973A", paddingLeft: "20px", marginBottom: "24px" }}>
                  <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", fontWeight: 500, color: "#0F0F0F", margin: "0 0 6px" }}>{item.title}</h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", lineHeight: 1.7, margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div>
              <div style={{ background: "#0F0F0F", padding: "32px", borderRadius: "2px", marginBottom: "24px" }}>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#FAF8F3", margin: "0 0 20px" }}>Timeline & Pricing</h3>
                {[
                  { label: "Production time", value: "5–9 working days" },
                  { label: "Pricing starts from", value: "₦25,000 — quoted after brief" },
                  { label: "Rush orders", value: "Available at additional cost" },
                  { label: "Deposit", value: "50% upfront, 50% before delivery" },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(250,248,243,0.08)", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(250,248,243,0.5)" }}>{row.label}</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#FAF8F3" }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                style={{ display: "block", textAlign: "center", background: "#3B4A3E", color: "#FAF8F3", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "16px 24px", textDecoration: "none" }}>
                Chat Directly on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Inquiry form */}
        <div style={{ background: "#3B4A3E", padding: "80px 24px" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            <span className="section-label" style={{ color: "#B8973A" }}>Start Your Order</span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#FAF8F3", margin: "16px 0 8px" }}>
              Tell Morayo what you have in mind
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(250,248,243,0.6)", lineHeight: 1.7, margin: "0 0 40px" }}>
              She'll review your request and respond with a quote and timeline within 48 hours.
            </p>

            {sent ? (
              <div style={{ background: "rgba(184,151,58,0.15)", border: "1px solid #B8973A", padding: "40px", textAlign: "center", borderRadius: "2px" }}>
                <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: "#FAF8F3", margin: "0 0 8px" }}>Request sent!</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(250,248,243,0.7)", margin: "0 0 24px" }}>
                  Morayo will be in touch within 48 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", description: "" }); }}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "1px solid #B8973A", color: "#B8973A", padding: "10px 20px", cursor: "pointer" }}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { name: "name", label: "Full Name *", type: "text" },
                  { name: "email", label: "Email Address *", type: "email" },
                  { name: "phone", label: "Phone / WhatsApp Number *", type: "tel" },
                ].map((field) => (
                  <div key={field.name}>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.6)", display: "block", marginBottom: "8px" }}>{field.label}</label>
                    <input
                      type={field.type} required
                      value={form[field.name]}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(250,248,243,0.15)", color: "#FAF8F3", fontFamily: "Inter, sans-serif", fontSize: "14px", padding: "14px 16px", outline: "none", boxSizing: "border-box", borderRadius: "2px" }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.6)", display: "block", marginBottom: "8px" }}>
                    Describe Your Desired Piece *
                  </label>
                  <textarea required rows={5}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Tell Morayo the piece you have in mind — style, colours, occasion, size..."
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(250,248,243,0.15)", color: "#FAF8F3", fontFamily: "Inter, sans-serif", fontSize: "14px", padding: "14px 16px", outline: "none", resize: "vertical", boxSizing: "border-box", borderRadius: "2px" }}
                  />
                </div>
                {error && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#FCA5A5", margin: 0 }}>{error}</p>}
                <button type="submit" disabled={saving}
                  style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "18px 32px", marginTop: "8px", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Sending..." : "Send My Request"}
                </button>
              </form>
            )}
          </div>
        </div>

        <Footer />
      </main>
      <style>{`
        @media (max-width: 768px) {
          .custom-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </>
  );
}

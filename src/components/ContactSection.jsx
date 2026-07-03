import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";

const WHATSAPP_URL = "https://wa.me/2348185123890";
const INSTAGRAM_URL = "https://www.instagram.com/mo_fashionforge";

export default function ContactSection() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ background: "#0F0F0F", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <span className="section-label">Get in Touch</span>
        <h2 className="reveal" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 400, color: "#FAF8F3", margin: "16px auto 24px", maxWidth: "600px", lineHeight: 1.2 }}>
          Wear art.<br />
          <em style={{ color: "#B8973A" }}>Embrace confidence.</em>
        </h2>
        <p className="reveal" style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.6)", lineHeight: 1.8, maxWidth: "480px", margin: "0 auto 40px" }}>
          Ready to commission a piece or have questions about an order? Morayo responds within 24 hours.
        </p>
        <div className="reveal" style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#B8973A", color: "#FAF8F3", padding: "14px 28px", textDecoration: "none" }}>
            WhatsApp Morayo
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid rgba(250,248,243,0.3)", color: "#FAF8F3", padding: "14px 28px", textDecoration: "none" }}>
            Follow on Instagram
          </a>
          <Link to="/contact" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid rgba(250,248,243,0.3)", color: "#FAF8F3", padding: "14px 28px", textDecoration: "none" }}>
            Send a Message
          </Link>
        </div>
      </div>
    </section>
  );
}

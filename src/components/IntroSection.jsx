import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";

export default function IntroSection() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ background: "#FAF8F3", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal intro-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div className="intro-text">
            <span className="section-label">The Brand</span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 400, color: "#0F0F0F", lineHeight: 1.2, margin: "16px 0 24px" }}>
              Crochet, worn like it was made<br />
              <em style={{ color: "#3B4A3E" }}>for one body.</em>
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#6B6B6B", lineHeight: 1.8, maxWidth: "440px", marginBottom: "32px" }}>
              Mo_FashionForge creates premium handcrafted crochet pieces for men and women — every garment made to order, one hook, one strand, one fit at a time.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link to="/shop" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#0F0F0F", color: "#FAF8F3", padding: "14px 28px", textDecoration: "none" }}>
                Shop the Collection
              </Link>
              <Link to="/custom-orders" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid #0F0F0F", color: "#0F0F0F", padding: "14px 28px", textDecoration: "none" }}>
                Commission a Piece
              </Link>
            </div>
          </div>
          <div className="intro-image" style={{ position: "relative" }}>
            <img
              src="/assets/intro-piece.jpg"
              alt="Mo_FashionForge handcrafted crochet piece"
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "center", borderRadius: "2px", display: "block" }}
            />
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", color: "#B8973A", textTransform: "uppercase", textAlign: "right", margin: "12px 0 0" }}>
              Handcrafted · Made to Order
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

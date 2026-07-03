import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";

export default function StoryBanner() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ background: "#FAF8F3", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal story-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <img
              src="/assets/story-portrait.jpg"
              alt="Morayo — Founder of Mo_FashionForge"
              style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", objectPosition: "center", borderRadius: "2px", display: "block" }}
            />
          </div>
          <div>
            <span className="section-label">Our Story</span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#0F0F0F", lineHeight: 1.25, margin: "16px 0 24px" }}>
              Crochet is not a trend here.<br />
              <em style={{ color: "#3B4A3E" }}>It is a discipline.</em>
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#6B6B6B", lineHeight: 1.8, marginBottom: "16px" }}>
              Hi, I'm Morayo — the founder and creative director behind Mo_FashionForge. What began as a passion for crochet has grown into a brand dedicated to creating artistic, handcrafted pieces that celebrate creativity, confidence, and individuality.
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#6B6B6B", lineHeight: 1.8, marginBottom: "32px" }}>
              Every stitch, texture, and design is thoughtfully crafted to create pieces that are both timeless and unforgettable.
            </p>
            <Link to="/about" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#B8973A", textDecoration: "none", borderBottom: "1px solid #B8973A", paddingBottom: "2px" }}>
              Read Morayo's Story →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

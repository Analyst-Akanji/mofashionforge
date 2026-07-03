import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";

const CATEGORIES = [
  { name: "Crochet Earrings", desc: "Handwoven statement earrings", bg: "#3B4A3E" },
  { name: "Bucket Hats",      desc: "Artisan-crafted head pieces", bg: "#0F0F0F" },
  { name: "Tops",             desc: "Premium crochet tops for her", bg: "#B8973A" },
  { name: "Sweatshirts",      desc: "Cosy handcrafted layers",      bg: "#2A3830" },
  { name: "Accessories",      desc: "Bags, belts & more",           bg: "#9A7D2E" },
  { name: "Limited Edition",  desc: "One-of-a-kind pieces",         bg: "#1A1A1A" },
];

export default function ShopSection() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ background: "#0F0F0F", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="section-label">The Edit</span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#FAF8F3", margin: "12px 0 0" }}>
              Shop by Category
            </h2>
          </div>
          <Link to="/shop" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", textDecoration: "none", borderBottom: "1px solid #B8973A", paddingBottom: "2px" }}>
            View All →
          </Link>
        </div>

        <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to="/shop"
              style={{ textDecoration: "none", display: "block", aspectRatio: "1/1", background: cat.bg, padding: "24px", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden" }}
            >
              <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400, color: "#FAF8F3", margin: "0 0 4px" }}>{cat.name}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(250,248,243,0.6)", margin: 0, letterSpacing: "0.04em" }}>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

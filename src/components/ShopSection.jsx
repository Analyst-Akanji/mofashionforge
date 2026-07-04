import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";

const CATEGORIES = [
  { name: "Earrings",        desc: "Handwoven statement earrings", image: "/assets/cat-earrings.jpg" },
  { name: "Bucket Hats",     desc: "Artisan-crafted head pieces",  image: "/assets/cat-buckethat.jpg" },
  { name: "Tops",            desc: "Premium crochet tops for her", image: "/assets/cat-tops.jpg" },
  { name: "Sweatshirts",     desc: "Cosy handcrafted layers",      image: "/assets/cat-sweatshirts.jpg" },
  { name: "Accessories",     desc: "Bags, belts & more",           image: "/assets/cat-accessories.jpg" },
  { name: "Limited Edition", desc: "One-of-a-kind pieces",         image: "/assets/cat-limited.jpg" },
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

        <div className="reveal shop-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to="/shop"
              style={{ textDecoration: "none", display: "block", position: "relative", aspectRatio: "1/1", overflow: "hidden" }}
            >
              {/* Background photo */}
              <img
                src={cat.image}
                alt={cat.name}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transition: "transform 0.5s ease", display: "block" }}
                className="cat-img"
              />
              {/* Dark overlay */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,15,15,0.85) 0%, rgba(15,15,15,0.2) 60%, rgba(15,15,15,0.1) 100%)" }} />
              {/* Text */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px" }}>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", fontWeight: 400, color: "#FAF8F3", margin: "0 0 4px" }}>
                  {cat.name}
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(250,248,243,0.7)", margin: 0, letterSpacing: "0.04em" }}>
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

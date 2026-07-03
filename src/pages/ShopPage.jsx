import { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";

const PRODUCTS = [
  {
    id: "bag",
    name: "Crochet Tote Bag",
    category: "Accessories",
    price: 35000,
    description: "Handwoven crochet tote bag — durable, stylish, made to order.",
    images: ["/assets/bag-1.jpg", "/assets/bag-2.jpg", "/assets/bag-3.jpg"],
  },
  {
    id: "gown",
    name: "Crochet Statement Gown",
    category: "Limited Edition",
    price: 85000,
    description: "A head-to-toe crochet statement piece — bold, artistic, one of a kind.",
    images: ["/assets/gown-1.jpg", "/assets/gown-2.jpg", "/assets/gown-3.jpg"],
  },
  {
    id: "top-1",
    name: "Crochet Top I",
    category: "Tops",
    price: 28000,
    description: "Premium handcrafted crochet top — elegant and breathable.",
    images: ["/assets/top-1-a.jpg", "/assets/top-1-b.jpg", "/assets/top-1-c.jpg"],
  },
  {
    id: "top-2",
    name: "Crochet Top II",
    category: "Tops",
    price: 28000,
    description: "Premium handcrafted crochet top — elegant and breathable.",
    images: ["/assets/top-2-a.jpg", "/assets/top-2-b.jpg", "/assets/top-2-c.jpg"],
  },
  {
    id: "top-3",
    name: "Crochet Unisex Top",
    category: "Tops",
    price: 32000,
    description: "Bold unisex crochet top — wearable art for any body.",
    images: ["/assets/top-3-a.jpg", "/assets/top-3-b.jpg", "/assets/top-3-c.jpg"],
  },
  {
    id: "sweatshirt",
    name: "Crochet Sweatshirt",
    category: "Sweatshirts",
    price: 45000,
    description: "Cosy luxury crochet sweatshirt — handcrafted for warmth and style.",
    images: ["/assets/sweatshirt-1.jpg", "/assets/sweatshirt-2.jpg", "/assets/sweatshirt-3.jpg"],
  },
];

const CATEGORIES = ["All", "Tops", "Sweatshirts", "Accessories", "Limited Edition"];

const fmt = (n) => `₦${n.toLocaleString("en-NG")}`;

function ProductCard({ product, onClick }) {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveImg((prev) => (prev + 1) % product.images.length);
    }, 2500);
    return () => clearInterval(t);
  }, [product.images.length]);

  return (
    <div
      onClick={onClick}
      style={{ cursor: "pointer", background: "#F0EDE6", position: "relative", overflow: "hidden", borderRadius: "2px" }}
    >
      <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
        {product.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${product.name} ${i + 1}`}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              opacity: activeImg === i ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
          />
        ))}
        {product.category === "Limited Edition" && (
          <span style={{
            position: "absolute", top: "12px", left: "12px", zIndex: 2,
            fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em",
            textTransform: "uppercase", background: "#B8973A", color: "#FAF8F3",
            padding: "4px 10px",
          }}>
            Limited
          </span>
        )}
        <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px", zIndex: 2 }}>
          {product.images.map((_, i) => (
            <span key={i} style={{
              width: activeImg === i ? "16px" : "6px", height: "6px",
              borderRadius: "999px",
              background: activeImg === i ? "#FAF8F3" : "rgba(250,248,243,0.5)",
              transition: "all 0.3s ease", display: "block",
            }} />
          ))}
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 4px" }}>
          {product.category}
        </p>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 4px" }}>
          {product.name}
        </h3>
        <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "#3B4A3E", margin: 0 }}>
          {fmt(product.price)}
        </p>
      </div>
    </div>
  );
}

function Lightbox({ product, onClose }) {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#FAF8F3", borderRadius: "4px", maxWidth: "900px", width: "100%", maxHeight: "90vh", overflow: "auto", display: "grid", gridTemplateColumns: "1fr 1fr" }}
        className="lightbox-inner"
      >
        <div style={{ background: "#F0EDE6", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <img
            src={product.images[activeImg]}
            alt={product.name}
            style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: "2px" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            {product.images.map((img, i) => (
              <img
                key={i} src={img} alt={`view ${i + 1}`}
                onClick={() => setActiveImg(i)}
                style={{
                  flex: 1, aspectRatio: "1/1", objectFit: "cover", borderRadius: "2px", cursor: "pointer",
                  opacity: activeImg === i ? 1 : 0.5,
                  border: activeImg === i ? "2px solid #B8973A" : "2px solid transparent",
                  transition: "opacity 0.2s, border 0.2s",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6B6B6B", padding: 0, marginBottom: "24px", display: "block", marginLeft: "auto" }}>
              ✕
            </button>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#B8973A" }}>
              {product.category}
            </span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: "12px 0 8px" }}>
              {product.name}
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", margin: "0 0 16px" }}>
              {product.description}
            </p>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", fontWeight: 500, color: "#3B4A3E", margin: "0 0 24px" }}>
              {fmt(product.price)}
            </p>
            <ul style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", lineHeight: 2, paddingLeft: "16px", margin: "0 0 32px" }}>
              <li>Handcrafted with premium yarn</li>
              <li>Made to order — allow 5–9 days</li>
              <li>Custom colours available on request</li>
              <li>Contact Morayo for sizing guidance</li>
            </ul>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => alert("Cart & checkout coming soon — payment integration in progress.")}
              style={{
                display: "block", width: "100%", textAlign: "center",
                background: "#0F0F0F", color: "#FAF8F3", border: "none", cursor: "pointer",
                fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "16px 24px",
              }}
            >
              Add to Cart
            </button>
            <button
              onClick={() => alert("Checkout coming soon — Flutterwave integration in progress.")}
              style={{
                display: "block", width: "100%", textAlign: "center",
                background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer",
                fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "16px 24px",
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const visible = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <>
      {selected && <Lightbox product={selected} onClose={() => setSelected(null)} />}

      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        <div style={{ background: "#0F0F0F", padding: "64px 24px 48px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8973A" }}>
              The Collection
            </span>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.4rem, 5vw, 3.5rem)", fontWeight: 400, color: "#FAF8F3", margin: "12px 0 0" }}>
              Shop Mo_FashionForge
            </h1>
          </div>
        </div>

        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 24px", background: "#FAF8F3", position: "sticky", top: "72px", zIndex: 10 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", overflowX: "auto" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em",
                  textTransform: "uppercase", padding: "18px 24px", background: "none", border: "none",
                  cursor: "pointer", whiteSpace: "nowrap",
                  color: filter === cat ? "#0F0F0F" : "#6B6B6B",
                  borderBottom: filter === cat ? "2px solid #B8973A" : "2px solid transparent",
                  transition: "color 0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="shop-product-grid">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => setSelected(product)} />
            ))}
          </div>
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#6B6B6B" }}>
                No pieces in this category yet.
              </p>
            </div>
          )}
        </div>

        <div style={{ background: "#3B4A3E", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8973A" }}>
              Don't see what you want?
            </span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#FAF8F3", margin: "16px 0 16px" }}>
              Commission a Custom Piece
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.7)", lineHeight: 1.8, marginBottom: "32px" }}>
              Morayo creates bespoke crochet pieces tailored to your exact specifications — colour, size, and design.
            </p>
            <a
              href="/custom-orders"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#B8973A", color: "#FAF8F3", padding: "16px 32px", textDecoration: "none", display: "inline-block" }}
            >
              Start a Custom Order
            </a>
          </div>
        </div>

        <Footer />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .shop-product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .lightbox-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

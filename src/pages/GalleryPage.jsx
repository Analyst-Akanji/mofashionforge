import { useState } from "react";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const GALLERY_IMAGES = [
  { src: "/assets/gown-1.jpg", caption: "Statement Gown — Front" },
  { src: "/assets/gown-2.jpg", caption: "Statement Gown — Detail" },
  { src: "/assets/gown-3.jpg", caption: "Statement Gown — Back" },
  { src: "/assets/top-1-a.jpg", caption: "Crochet Top I" },
  { src: "/assets/top-1-b.jpg", caption: "Crochet Top I — Side" },
  { src: "/assets/top-1-c.jpg", caption: "Crochet Top I — Back" },
  { src: "/assets/top-2-a.jpg", caption: "Crochet Top II" },
  { src: "/assets/top-2-b.jpg", caption: "Crochet Top II — Detail" },
  { src: "/assets/top-2-c.jpg", caption: "Crochet Top II — Back" },
  { src: "/assets/top-3-a.jpg", caption: "Unisex Top" },
  { src: "/assets/top-3-b.jpg", caption: "Unisex Top — Side" },
  { src: "/assets/top-3-c.jpg", caption: "Unisex Top — Back" },
  { src: "/assets/sweatshirt-1.jpg", caption: "Crochet Sweatshirt — Front" },
  { src: "/assets/sweatshirt-2.jpg", caption: "Crochet Sweatshirt — Side" },
  { src: "/assets/sweatshirt-3.jpg", caption: "Crochet Sweatshirt — Detail" },
  { src: "/assets/bag-1.jpg", caption: "Crochet Tote Bag" },
  { src: "/assets/bag-2.jpg", caption: "Crochet Tote Bag — Detail" },
  { src: "/assets/bag-3.jpg", caption: "Crochet Tote Bag — Side" },
];

export default function GalleryPage() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      {selected !== null && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "100%", position: "relative" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: "-40px", right: 0, background: "none", border: "none", color: "#FAF8F3", fontSize: "20px", cursor: "pointer" }}>✕ Close</button>
            <img src={GALLERY_IMAGES[selected].src} alt={GALLERY_IMAGES[selected].caption} style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1rem", color: "rgba(250,248,243,0.7)", textAlign: "center", margin: "16px 0 0", fontStyle: "italic" }}>
              {GALLERY_IMAGES[selected].caption}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button onClick={() => setSelected((p) => (p > 0 ? p - 1 : GALLERY_IMAGES.length - 1))} style={{ background: "none", border: "1px solid rgba(250,248,243,0.3)", color: "#FAF8F3", cursor: "pointer", padding: "10px 20px", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em" }}>← Prev</button>
              <button onClick={() => setSelected((p) => (p < GALLERY_IMAGES.length - 1 ? p + 1 : 0))} style={{ background: "none", border: "1px solid rgba(250,248,243,0.3)", color: "#FAF8F3", cursor: "pointer", padding: "10px 20px", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em" }}>Next →</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#0F0F0F" }}>
        <PageHero image="/assets/hero-gallery.jpg" label="The Gallery" title="Fashion as Art" subtitle="Every piece tells a story. Browse Mo_FashionForge's full collection." />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }} className="gallery-grid">
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} onClick={() => setSelected(i)} style={{ cursor: "pointer", position: "relative", aspectRatio: "1/1", overflow: "hidden", background: "#1A1A1A" }}>
                <img src={img.src} alt={img.caption} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", transition: "transform 0.4s ease" }} className="gallery-img" />
                <div style={{ position: "absolute", inset: 0, background: "rgba(15,15,15,0)", transition: "background 0.3s" }} className="gallery-overlay" />
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </main>

      <style>{`
        .gallery-img:hover { transform: scale(1.06); }
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}

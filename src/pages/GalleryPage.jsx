import { useState } from "react";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const PHOTOS = [
  { src: "/assets/gallery-1.jpg", caption: "Client Look" },
  { src: "/assets/gallery-2.jpg", caption: "Client Look" },
  { src: "/assets/gallery-3.jpg", caption: "Client Look" },
  { src: "/assets/gallery-4.jpg", caption: "Client Look" },
  { src: "/assets/gallery-5.jpg", caption: "Client Look" },
  { src: "/assets/gallery-6.jpg", caption: "Client Look" },
  { src: "/assets/gallery-7.jpg", caption: "Client Look" },
  { src: "/assets/gallery-8.jpg", caption: "Client Look" },
  { src: "/assets/gallery-9.jpg", caption: "Client Look" },
  { src: "/assets/gallery-10.jpg", caption: "Client Look" },
  { src: "/assets/gallery-11.jpg", caption: "Client Look" },
  { src: "/assets/gallery-12.jpg", caption: "Client Look" },
];

const REELS = [
  { id: "DWYUjoRDV0M", caption: "Mo_FashionForge Collection" },
  { id: "DXgeBpbDVyF", caption: "Mo_FashionForge Collection" },
  { id: "DYElTi6O9sh", caption: "Mo_FashionForge Collection" },
  { id: "DaKmcDvuKZj", caption: "Mo_FashionForge Collection" },
  { id: "DaPrANsuTsL", caption: "Mo_FashionForge Collection" },
];

const INSTAGRAM_URL = "https://www.instagram.com/mo_fashionforge";

export default function GalleryPage() {
  const [tab, setTab] = useState("photos");
  const [selected, setSelected] = useState(null);

  // Filter out photos that fail to load
  const [failedPhotos, setFailedPhotos] = useState([]);
  const visiblePhotos = PHOTOS.filter((_, i) => !failedPhotos.includes(i));

  return (
    <>
      {/* Photo lightbox */}
      {selected !== null && tab === "photos" && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.96)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "100%", position: "relative" }}>
            <button
              onClick={() => setSelected(null)}
              style={{ position: "absolute", top: "-44px", right: 0, background: "none", border: "1px solid rgba(250,248,243,0.3)", color: "#FAF8F3", fontSize: "13px", cursor: "pointer", padding: "8px 16px", fontFamily: "Inter, sans-serif", letterSpacing: "0.08em" }}
            >
              ✕ Close
            </button>
            <img
              src={visiblePhotos[selected]?.src}
              alt={visiblePhotos[selected]?.caption}
              style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", display: "block", borderRadius: "2px" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button
                onClick={() => setSelected((p) => (p > 0 ? p - 1 : visiblePhotos.length - 1))}
                style={{ background: "none", border: "1px solid rgba(250,248,243,0.3)", color: "#FAF8F3", cursor: "pointer", padding: "10px 20px", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}
              >
                ← Prev
              </button>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(250,248,243,0.4)", alignSelf: "center" }}>
                {selected + 1} / {visiblePhotos.length}
              </span>
              <button
                onClick={() => setSelected((p) => (p < visiblePhotos.length - 1 ? p + 1 : 0))}
                style={{ background: "none", border: "1px solid rgba(250,248,243,0.3)", color: "#FAF8F3", cursor: "pointer", padding: "10px 20px", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#0F0F0F" }}>
        <PageHero
          image="/assets/hero-gallery.jpg"
          label="The Gallery"
          title="Fashion as Art"
          subtitle="Real people. Real pieces. Real confidence."
        />

        {/* Tab bar */}
        <div style={{ borderBottom: "1px solid rgba(250,248,243,0.08)", padding: "0 24px", background: "#0F0F0F", position: "sticky", top: "72px", zIndex: 10 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex" }}>
            {["photos", "videos"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelected(null); }}
                style={{
                  fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em",
                  textTransform: "uppercase", padding: "18px 28px", background: "none", border: "none",
                  cursor: "pointer", color: tab === t ? "#FAF8F3" : "rgba(250,248,243,0.4)",
                  borderBottom: tab === t ? "2px solid #B8973A" : "2px solid transparent",
                  transition: "color 0.2s",
                }}
              >
                {t === "photos" ? "Client Photos" : "Reels & Videos"}
              </button>
            ))}
          </div>
        </div>

        {/* Photos tab */}
        {tab === "photos" && (
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
            {visiblePhotos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: "rgba(250,248,243,0.4)", fontStyle: "italic" }}>
                  Client photos coming soon...
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(250,248,243,0.25)", marginTop: "12px" }}>
                  We're collecting photos from clients wearing Mo_FashionForge pieces.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }} className="gallery-grid">
                {visiblePhotos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setSelected(i)}
                    style={{ cursor: "pointer", position: "relative", aspectRatio: "1/1", overflow: "hidden", background: "#1A1A1A" }}
                  >
                    <img
                      src={photo.src}
                      alt={photo.caption}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform 0.4s ease" }}
                      className="gallery-img"
                      onError={() => setFailedPhotos((prev) => [...prev, i])}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos tab */}
        {tab === "videos" && (
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>

            {/* Instagram follow prompt */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#B8973A" }}>
                  @mo_fashionforge on Instagram
                </span>
                <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "#FAF8F3", margin: "6px 0 0" }}>
                  Watch Mo_FashionForge in motion
                </p>
              </div>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid #B8973A", color: "#B8973A", padding: "12px 24px", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                Follow on Instagram →
              </a>
            </div>

            {/* Reels grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }} className="reels-grid">
              {REELS.map((reel) => (
                <div key={reel.id} style={{ background: "#1A1A1A", borderRadius: "4px", overflow: "hidden" }}>
                  <iframe
                    src={`https://www.instagram.com/reel/${reel.id}/embed/`}
                    width="100%"
                    height="580"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    style={{ display: "block", border: "none" }}
                    title={reel.caption}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Note about story highlights */}
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(250,248,243,0.25)", textAlign: "center", marginTop: "40px", lineHeight: 1.7 }}>
              Some content is only available on Instagram. Visit{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ color: "#B8973A", textDecoration: "none" }}>@mo_fashionforge</a>
              {" "}to see Story Highlights and more.
            </p>
          </div>
        )}

        <Footer />
      </main>

      <style>{`
        .gallery-img:hover { transform: scale(1.05); }
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .reels-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

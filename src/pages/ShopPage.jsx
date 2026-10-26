import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import { supabase } from "../lib/supabase";
import { track } from "../lib/analytics";

const fmt = (n) => `₦${n.toLocaleString("en-NG")}`;
const prettyCategory = (c) => (c || "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());

// Database row -> what the shop components use. Prices are stored in kobo.
function toShopProduct(row, nameBySlug = {}) {
  // Legacy: a piece whose category is "limited" shows under the Limited Edition tab
  const limitedCategory = row.category === "limited";
  return {
    id: row.id,
    name: row.name,
    category: limitedCategory ? "Limited Edition" : nameBySlug[row.category] || prettyCategory(row.category),
    isLimited: !!row.is_limited || limitedCategory,
    slug: row.category,
    price: Math.round((row.price || 0) / 100),
    priceKobo: row.price || 0, // the cart keeps prices in kobo
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    description: row.description || "",
    images: Array.isArray(row.images) ? row.images : [],
  };
}

// Which size chart on the Size Guide page fits this piece
function chartFor(product) {
  if (product.sizes.some((s) => /month/i.test(s)) || /baby/.test(product.slug || "")) return "baby";
  if (product.slug === "dresses") return "dress";
  return "adult";
}

function ImagePlaceholder() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#3B4A3E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: "rgba(250,248,243,0.3)", fontStyle: "italic" }}>MF</span>
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const [activeImg, setActiveImg] = useState(0);
  const count = product.images.length;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setActiveImg((p) => (p + 1) % count), 2500);
    return () => clearInterval(t);
  }, [count]);

  return (
    <div onClick={onClick} style={{ cursor: "pointer", background: "#F0EDE6", borderRadius: "2px", overflow: "hidden" }}>
      <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
        {count === 0 ? <ImagePlaceholder /> : product.images.map((img, i) => (
          <img key={i} src={img} alt={`${product.name} ${i + 1}`} loading={i === 0 ? "eager" : "lazy"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: activeImg === i ? 1 : 0, transition: "opacity 0.8s ease-in-out" }}
          />
        ))}
        {product.isLimited && (
          <span style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2, fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#B8973A", color: "#FAF8F3", padding: "4px 10px" }}>Limited</span>
        )}
        {count > 1 && (
          <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px", zIndex: 2 }}>
            {product.images.map((_, i) => (
              <span key={i} style={{ width: activeImg === i ? "16px" : "6px", height: "6px", borderRadius: "999px", background: activeImg === i ? "#FAF8F3" : "rgba(250,248,243,0.5)", transition: "all 0.3s ease", display: "block" }} />
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "14px" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 4px" }}>{product.category}</p>
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 4px" }}>{product.name}</h3>
        <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1rem", color: "#3B4A3E", margin: 0 }}>{fmt(product.price)}</p>
      </div>
    </div>
  );
}

function Lightbox({ product, onClose }) {
  const [mainImg, setMainImg] = useState(0);
  const { addItem, buyNow } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const needsSize = product.sizes.length > 0;

  const cartProduct = () => ({ id: product.id, name: product.name, price: product.priceKobo, images: product.images });

  function handleAdd() {
    if (needsSize && !size) { setSizeError(true); return; }
    addItem(cartProduct(), 1, needsSize ? size : null);
    setAdded(true);
  }

  function handleBuyNow() {
    if (needsSize && !size) { setSizeError(true); return; }
    buyNow(cartProduct(), needsSize ? size : null);
    navigate("/checkout");
  }

  // Analytics: one "product view" each time a piece is opened
  useEffect(() => { track("product_view", { product_id: product.id }); }, [product.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,15,15,0.95)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#FAF8F3", borderRadius: "4px", width: "100%", maxWidth: "900px", maxHeight: "92vh", overflow: "auto", display: "grid", gridTemplateColumns: "1fr 1fr" }}
        className="lightbox-inner"
      >
        {/* LEFT — big image + thumbnails below */}
        <div style={{ background: "#F0EDE6", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            {product.images.length === 0 ? (
              <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "2px", overflow: "hidden" }}>
                <ImagePlaceholder />
              </div>
            ) : (
              <img
                src={product.images[mainImg]}
                alt={product.name}
                style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "center", borderRadius: "2px", display: "block" }}
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: "8px" }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(i)}
                  style={{ flex: 1, padding: 0, border: mainImg === i ? "2px solid #B8973A" : "2px solid transparent", borderRadius: "2px", overflow: "hidden", cursor: "pointer", background: "none", transition: "border 0.2s" }}
                >
                  <img
                    src={img}
                    alt={`View ${i + 1}`}
                    style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", objectPosition: "center", display: "block", opacity: mainImg === i ? 1 : 0.6, transition: "opacity 0.2s" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — product info */}
        <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#B8973A" }}>
                {product.isLimited && product.category !== "Limited Edition" ? `${product.category} · Limited Edition` : product.category}
              </span>
              <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6B6B6B", padding: "4px 8px", lineHeight: 1 }}>✕</button>
            </div>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 400, color: "#0F0F0F", margin: "0 0 10px", lineHeight: 1.2 }}>{product.name}</h2>
            {product.description && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", margin: "0 0 16px", lineHeight: 1.7, whiteSpace: "pre-line" }}>{product.description}</p>
            )}
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", fontWeight: 500, color: "#3B4A3E", margin: "0 0 20px" }}>{fmt(product.price)}</p>
            {needsSize && (
              <div role="group" aria-label="Choose a size" style={{ margin: "0 0 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B6B6B" }}>Size</span>
                  <a href={`/size-guide?chart=${chartFor(product)}`} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A" }}>Size guide ↗</a>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {product.sizes.map((sz) => (
                    <button key={sz} type="button" aria-pressed={size === sz}
                      onClick={() => { setSize(sz); setSizeError(false); setAdded(false); }}
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", padding: "10px 16px", borderRadius: "2px", cursor: "pointer", border: size === sz ? "1px solid #0F0F0F" : "1px solid #D9D5CB", background: size === sz ? "#0F0F0F" : "#fff", color: size === sz ? "#FAF8F3" : "#1A1A1A" }}>
                      {sz}
                    </button>
                  ))}
                </div>
                {sizeError && <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#DC2626", margin: "8px 0 0" }}>Please choose a size first.</p>}
              </div>
            )}
            <ul style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", lineHeight: 2, paddingLeft: "16px", margin: "0 0 24px" }}>
              <li>Handcrafted with premium yarn</li>
              <li>Made to order — allow 7–14 working days</li>
              <li>Custom colours available on request</li>
              <li>Not sure of your size? <a href="/size-guide" style={{ color: "#B8973A" }}>See the size guide</a></li>
            </ul>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={handleAdd}
              style={{ width: "100%", background: "#0F0F0F", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "15px 24px" }}
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              style={{ width: "100%", background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "15px 24px" }}
            >
              Buy Now
            </button>
            {added && (
              <p role="status" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#3B4A3E", margin: "4px 0 0", textAlign: "center" }}>
                Added to your cart.{" "}
                <button type="button" onClick={() => navigate("/checkout")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#B8973A", textDecoration: "underline", fontFamily: "inherit", fontSize: "inherit" }}>View cart</button>
                {" "}or keep browsing.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categoryRows, setCategoryRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, category, price, description, images, is_limited, sizes")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("name, slug, sort_order").order("sort_order", { ascending: true }),
      ]);
      if (prodRes.error) {
        setLoadError(true);
      } else {
        // If the categories can't be read, the tabs fall back to whatever the products use
        const cats = catRes.error ? [] : catRes.data || [];
        const nameBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
        setCategoryRows(cats);
        setProducts((prodRes.data || []).map((r) => toShopProduct(r, nameBySlug)));
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Tabs follow the order set in the admin, and only show categories that have active pieces
  const usedNames = new Set(products.filter((p) => p.category !== "Limited Edition").map((p) => p.category));
  const ordered = categoryRows.map((c) => c.name).filter((n) => usedNames.has(n));
  const missing = [...usedNames].filter((n) => !ordered.includes(n)); // category not in the table (safety net)
  const categories = [
    "All",
    ...ordered,
    ...missing,
    ...(products.some((p) => p.isLimited) ? ["Limited Edition"] : []),
  ];
  const visible =
    filter === "All" ? products
    : filter === "Limited Edition" ? products.filter((p) => p.isLimited)
    : products.filter((p) => p.category === filter);

  // If the selected tab disappears (e.g. last piece in it was deactivated), fall back to All
  useEffect(() => {
    if (!categories.includes(filter)) setFilter("All");
  }, [products]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {selected && <Lightbox product={selected} onClose={() => setSelected(null)} />}

      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        <PageHero image="/assets/hero-shop.jpg" label="The Collection" title="Shop Mo_FashionForge" />

        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 24px", background: "#FAF8F3", position: "sticky", top: "72px", zIndex: 10 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", overflowX: "auto" }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "18px 24px", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", color: filter === cat ? "#0F0F0F" : "#6B6B6B", borderBottom: filter === cat ? "2px solid #B8973A" : "2px solid transparent", transition: "color 0.2s" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
          {loading ? (
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#6B6B6B", fontStyle: "italic", textAlign: "center", padding: "80px 0" }}>Loading the collection...</p>
          ) : loadError ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#6B6B6B" }}>We couldn't load the collection just now.</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", marginTop: "12px" }}>Please refresh the page, or message Morayo on WhatsApp to see what's available.</p>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#6B6B6B" }}>
                {products.length === 0 ? "New pieces are on the way." : "No pieces in this category yet."}
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="shop-product-grid">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => setSelected(product)} />
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "#3B4A3E", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8973A" }}>Don't see what you want?</span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#FAF8F3", margin: "16px 0 16px" }}>Commission a Custom Piece</h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.7)", lineHeight: 1.8, marginBottom: "32px" }}>Morayo creates bespoke crochet pieces tailored to your exact specifications.</p>
            <a href="/custom-orders" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#B8973A", color: "#FAF8F3", padding: "16px 32px", textDecoration: "none", display: "inline-block" }}>Start a Custom Order</a>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}

import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const WHATSAPP_URL = "https://wa.me/2348185123890";
const INSTAGRAM_URL = "https://www.instagram.com/mo_fashionforge";

export default function AboutPage() {
  return (
    <>
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>

        {/* Hero */}
        <div style={{ background: "#0F0F0F", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8973A" }}>
              About
            </span>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 300, color: "#FAF8F3", margin: "16px 0 0", lineHeight: 1.1 }}>
              Wear Art.<br />
              <em>Embrace Confidence.</em>
            </h1>
          </div>
        </div>

        {/* Founder section */}
        <div style={{ padding: "80px 24px", background: "#FAF8F3" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }} className="about-grid">
            <div>
              <img
                src="/assets/story-portrait.jpg"
                alt="Morayo — Founder & Creative Director, Mo_FashionForge"
                style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", objectPosition: "center", borderRadius: "2px", display: "block" }}
              />
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1rem", fontStyle: "italic", color: "#B8973A", margin: "16px 0 0", textAlign: "center" }}>
                Morayo — Founder & Creative Director
              </p>
            </div>
            <div>
              <span className="section-label">Hi, I'm Morayo</span>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 3vw, 2.8rem)", fontWeight: 400, color: "#0F0F0F", margin: "16px 0 24px", lineHeight: 1.2 }}>
                The founder and creative director behind Mo_FashionForge
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#6B6B6B", lineHeight: 1.9, marginBottom: "20px" }}>
                What began as a passion for crochet has grown into a brand dedicated to creating artistic, handcrafted pieces that celebrate creativity, confidence, and individuality.
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#6B6B6B", lineHeight: 1.9, marginBottom: "20px" }}>
                At Mo_FashionForge, I believe fashion is more than clothing — it's a form of self-expression, a way to tell your story without saying a word. Every stitch, texture, and design is thoughtfully crafted to create pieces that are both timeless and unforgettable.
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "32px" }}>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#0F0F0F", color: "#FAF8F3", padding: "14px 24px", textDecoration: "none" }}>
                  Follow on Instagram
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid #0F0F0F", color: "#0F0F0F", padding: "14px 24px", textDecoration: "none" }}>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div style={{ background: "#0F0F0F", padding: "80px 24px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <span className="section-label">Our Mission</span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 400, color: "#FAF8F3", margin: "16px 0 24px", lineHeight: 1.3 }}>
              To create bold, artistic crochet statement pieces that merge fashion with self-expression
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.65)", lineHeight: 1.9 }}>
              Allowing every individual to embrace their uniqueness with confidence and style.
            </p>
          </div>
        </div>

        {/* Values */}
        <div style={{ background: "#FAF8F3", padding: "80px 24px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <span className="section-label">Our Values</span>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#0F0F0F", margin: "16px 0 0" }}>
                What we are committed to
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }} className="values-grid-3">
              {[
                { n: "01", title: "Wearable Art", text: "We are committed to turning yarn into wearable art that empowers people to feel stylish, confident, and unique." },
                { n: "02", title: "Intentional Craftsmanship", text: "Through intentional craftsmanship and innovative design, we create pieces that celebrate individuality and inspire self-expression." },
                { n: "03", title: "Celebrating Individuality", text: "Every piece is created with intention, designed to make a statement, and crafted for those who appreciate fashion as an art form." },
              ].map((v, i) => (
                <div key={v.n} style={{ background: i === 1 ? "#3B4A3E" : "#0F0F0F", padding: "48px 40px" }}>
                  <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "3rem", color: "#B8973A", opacity: 0.3, lineHeight: 1, display: "block", marginBottom: "16px" }}>{v.n}</span>
                  <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", fontWeight: 500, color: "#FAF8F3", margin: "0 0 16px" }}>{v.title}</h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(250,248,243,0.65)", lineHeight: 1.8, margin: 0 }}>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Journey */}
        <div style={{ background: "#3B4A3E", padding: "80px 24px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <span className="section-label" style={{ color: "#B8973A" }}>My Journey</span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#FAF8F3", margin: "16px 0 32px", lineHeight: 1.25 }}>
              From curiosity to craft
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.75)", lineHeight: 1.9, marginBottom: "20px" }}>
              My crochet journey began with a simple curiosity and a desire to create with my hands. What started as learning stitches and experimenting with yarn gradually became a deep passion for transforming ordinary materials into extraordinary pieces of art.
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.75)", lineHeight: 1.9, marginBottom: "20px" }}>
              Over time, crochet became more than a craft — it became a creative language through which I could express my ideas, push boundaries, and design pieces that make people feel beautiful and confident. Every project has strengthened my love for the art and inspired me to build a brand that stands for creativity, authenticity, and craftsmanship.
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.75)", lineHeight: 1.9 }}>
              Today, Mo_FashionForge is more than a crochet brand — it is a celebration of artistry, individuality, and the beauty of handmade fashion. Each piece is created with intention, designed to make a statement, and crafted for those who appreciate fashion as an art form.
            </p>
          </div>
        </div>

        {/* Closing quote */}
        <div style={{ background: "#0F0F0F", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontStyle: "italic", fontWeight: 300, color: "#FAF8F3", lineHeight: 1.5, margin: "0 0 32px" }}>
              "Wear art. Embrace confidence. Express yourself."
            </p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 40px" }}>
              — Morayo, Founder & Creative Director
            </p>
            <Link
              to="/shop"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#B8973A", color: "#FAF8F3", padding: "16px 32px", textDecoration: "none", display: "inline-block" }}
            >
              Shop the Collection
            </Link>
          </div>
        </div>

        <Footer />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .values-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

import useReveal from "../hooks/useReveal";

const VALUES = [
  { n: "01", title: "Bold & Artistic",  text: "Fashion is more than clothing — it's a form of self-expression, a way to tell your story without saying a word." },
  { n: "02", title: "Handcrafted",      text: "Every piece is crocheted by hand, row by row. No shortcuts, no machines — only intention and skill." },
  { n: "03", title: "Made to Order",    text: "Nothing sits in a warehouse. Every garment is made specifically for the person who will wear it." },
  { n: "04", title: "Timeless Quality", text: "We create pieces that don't follow trends — they set them. Invest in something built to last." },
];

export default function ProcessSection() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ background: "#3B4A3E", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal" style={{ marginBottom: "56px" }}>
          <span className="section-label" style={{ color: "#B8973A" }}>Our Values</span>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 400, color: "#FAF8F3", margin: "12px 0 0" }}>
            What we stand for
          </h2>
        </div>
        <div className="reveal values-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2px" }}>
          {VALUES.map((v, i) => (
            <div key={v.n} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.15)", padding: "40px" }}>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "3rem", color: "#B8973A", opacity: 0.4, lineHeight: 1, display: "block" }}>{v.n}</span>
              <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", fontWeight: 500, color: "#FAF8F3", margin: "12px 0" }}>{v.title}</h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(250,248,243,0.65)", lineHeight: 1.75, margin: 0 }}>{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

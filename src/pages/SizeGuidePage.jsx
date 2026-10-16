import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

const WHATSAPP_URL = "https://wa.me/2348185123890";

// value helper: inches, optional centimetres
const v = (i, c) => ({ i, c });

const CHARTS = {
  adult: {
    tab: "Adult Shirt",
    title: "Adult Shirt Measurements",
    image: "/assets/size-guide/adult-shirt-size-chart.jpg",
    head: [
      { label: "Measurement" },
      { label: "L", sub: "Large" },
      { label: "XL", sub: "Extra Large" },
      { label: "XXL", sub: "Double Extra Large" },
    ],
    rows: [
      { label: "Chest round", sub: "Full circumference", values: [v("40", "102"), v("44", "112"), v("48", "122")] },
      { label: "Shirt length", sub: "Shoulder to hem", values: [v("26", "66"), v("27", "69"), v("28", "71")] },
      { label: "Shoulder width", sub: "Across back", values: [v("16.5", "42"), v("17.5", "44"), v("18.5", "47")] },
      { label: "Sleeve length", sub: "Shoulder to sleeve hem", values: [v("8.5", "22"), v("9", "23"), v("9.5", "24")] },
      { label: "Armhole", sub: "Front + back width", values: [v("10", "25"), v("11", "28"), v("12", "30")] },
      { label: "Collar width", sub: "Across", values: [v("2.5", "6.5"), v("2.75", "7"), v("3", "7.5")] },
    ],
    notes: [
      "This chart gives a comfortable, relaxed fit.",
      "Measurements may vary slightly depending on the yarn, stitch pattern and tension.",
    ],
  },

  baby: {
    tab: "Baby Shirt",
    title: "Baby Shirt Measurements",
    image: "/assets/size-guide/baby-shirt-size-chart.jpg",
    head: [
      { label: "Age" },
      { label: "Chest round" },
      { label: "Shirt length" },
      { label: "Armhole" },
    ],
    rows: [
      { label: "0–6 months", values: [v("18"), v("8.5"), v("8")] },
      { label: "6–12 months", values: [v("20"), v("10"), v("9")] },
      { label: "12–18 months", values: [v("22"), v("12"), v("10")] },
      { label: "18–24 months", values: [v("24"), v("14"), v("11")] },
    ],
    callout: "Collar width: 0–12 months, 2 inches · 1–3 years, 2.5–3 inches.",
    notes: [
      "Babies grow fast. If your little one is between sizes, choose the larger size.",
      "Measurements may vary slightly depending on the yarn, stitch pattern and design.",
    ],
  },

  dress: {
    tab: "Fitted Dress",
    title: "Fitted Dress Measurements",
    image: "/assets/size-guide/fitted-dress-size-chart.jpg",
    head: [
      { label: "Measurement" },
      { label: "S", sub: "UK 8/10" },
      { label: "M", sub: "UK 12/14" },
      { label: "L", sub: "UK 16/18" },
      { label: "XL", sub: "UK 20/22" },
      { label: "XXL", sub: "UK 24/26" },
    ],
    rows: [
      { label: "Bust", sub: "Fullest part", values: [v("34", "86"), v("36", "91"), v("38", "97"), v("42", "107"), v("46", "117")] },
      { label: "Waist", sub: "Narrowest part", values: [v("26", "66"), v("28", "71"), v("30", "76"), v("34", "86"), v("38", "97")] },
      { label: "Hip", sub: "Fullest part", values: [v("36", "91"), v("38", "97"), v("40", "102"), v("44", "112"), v("48", "122")] },
      { label: "Dress length", sub: "Shoulder to hem", values: [v("45", "114"), v("46", "117"), v("47", "119"), v("48", "122"), v("49", "124")] },
      { label: "Shoulder width", sub: "Shoulder tip to tip", values: [v("14", "36"), v("14.5", "37"), v("15", "38"), v("15.5", "39"), v("16", "41")] },
      { label: "Armhole", sub: "Shoulder to underarm", values: [v("7.5", "19"), v("8", "20"), v("8.5", "22"), v("9", "23"), v("9.5", "24")] },
      { label: "Sleeve length", sub: "Shoulder to wrist", values: [v("22", "56"), v("22.5", "57"), v("23", "58"), v("23.5", "60"), v("24", "61")] },
      { label: "Sleeve opening", sub: "Upper arm", values: [v("10", "25"), v("11", "28"), v("12", "30"), v("13", "33"), v("14", "36")] },
      { label: "Neck width", sub: "Back to front", values: [v("7", "18"), v("7.5", "19"), v("8", "20"), v("8.5", "22"), v("9", "23")] },
    ],
    howTo: [
      "Use a soft measuring tape.",
      "Keep the tape snug, not tight.",
      "Wear light clothing or your usual undergarments.",
      "Measure in inches (or cm) for accuracy.",
      "Compare with the chart and choose your size.",
    ],
    notes: [
      "These are standard guide values for fitted dresses and may vary slightly depending on the style, fabric and your personal preference.",
      "For a more relaxed fit, add 1–2 inches to the bust, waist and hip measurements.",
      "If you are between sizes, choose the larger size for comfort.",
    ],
  },
};

const CHART_ORDER = ["adult", "baby", "dress"];

const serif = "Cormorant Garamond, serif";
const sans = "Inter, sans-serif";

function SizeTable({ chart }) {
  const cell = { padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.08)", textAlign: "center", whiteSpace: "nowrap" };
  return (
    <div style={{ overflowX: "auto", border: "1px solid rgba(184,151,58,0.35)", borderRadius: "2px", background: "#fff" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: chart.head.length > 4 ? "640px" : "420px" }}>
        <caption style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>{chart.title}</caption>
        <thead>
          <tr style={{ background: "#3B4A3E" }}>
            {chart.head.map((h, i) => (
              <th key={h.label} scope="col" style={{ ...cell, borderBottom: "none", textAlign: i === 0 ? "left" : "center", color: "#FAF8F3", fontFamily: sans, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, position: i === 0 ? "sticky" : "static", left: 0, background: "#3B4A3E" }}>
                {h.label}
                {h.sub && <span style={{ display: "block", fontSize: "10px", letterSpacing: "0.04em", textTransform: "none", color: "rgba(250,248,243,0.65)", marginTop: "2px" }}>{h.sub}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" style={{ ...cell, textAlign: "left", fontWeight: 400, position: "sticky", left: 0, background: "#FAF8F3" }}>
                <span style={{ fontFamily: sans, fontSize: "13px", fontWeight: 600, color: "#0F0F0F", display: "block" }}>{row.label}</span>
                {row.sub && <span style={{ fontFamily: sans, fontSize: "11px", color: "#6B6B6B" }}>{row.sub}</span>}
              </th>
              {row.values.map((val, i) => (
                <td key={i} style={{ ...cell, fontFamily: serif, fontSize: "1.2rem", color: "#0F0F0F" }}>
                  {val.i}&quot;
                  {val.c && <span style={{ display: "block", fontFamily: sans, fontSize: "11px", color: "#6B6B6B" }}>({val.c} cm)</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  const [params, setParams] = useSearchParams();
  const key = CHARTS[params.get("chart")] ? params.get("chart") : "adult";
  const chart = CHARTS[key];

  useEffect(() => {
    document.title = "Size Guide | Mo_FashionForge";
  }, []);

  return (
    <>
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        <PageHero
          image="/assets/hero-custom.jpg"
          label="Size Guide"
          title="Find Your<br /><em>Perfect Fit</em>"
          subtitle="Measurement charts for baby outfits, adult shirts and fitted dresses."
        />

        {/* Intro */}
        <div style={{ padding: "64px 24px 32px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 400, color: "#0F0F0F", margin: "0 0 20px", lineHeight: 1.25 }}>
              Welcome to the MO FashionForge Crochet Size Guide
            </h2>
            <p style={{ fontFamily: sans, fontSize: "15px", color: "#6B6B6B", lineHeight: 1.9, margin: "0 0 16px" }}>
              Explore our measurement charts for different crochet pieces, from baby outfits to adult shirts and fitted dresses. Use our guides to find the right measurements for your desired fit before placing your order.
            </p>
            <p style={{ fontFamily: sans, fontSize: "15px", color: "#6B6B6B", lineHeight: 1.9, margin: 0 }}>
              Every piece is handmade with care, and measurements may vary slightly depending on the yarn, stitch pattern and design.
            </p>
          </div>
        </div>

        {/* Chart picker */}
        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 24px", background: "#FAF8F3", position: "sticky", top: "72px", zIndex: 10 }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", overflowX: "auto" }}>
            {CHART_ORDER.map((k) => (
              <button key={k} onClick={() => setParams({ chart: k }, { replace: true })} aria-pressed={k === key}
                style={{ fontFamily: sans, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "18px 24px", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", color: k === key ? "#0F0F0F" : "#6B6B6B", borderBottom: k === key ? "2px solid #B8973A" : "2px solid transparent" }}>
                {CHARTS[k].tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.8rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>{chart.title}</h2>
            <a href={chart.image} target="_blank" rel="noreferrer" style={{ fontFamily: sans, fontSize: "12px", color: "#B8973A", textDecoration: "none", borderBottom: "1px solid #B8973A" }}>
              Open chart image ↗
            </a>
          </div>

          <SizeTable chart={chart} />

          {chart.callout && (
            <p style={{ fontFamily: sans, fontSize: "14px", color: "#3B4A3E", background: "#F0EDE6", padding: "16px 20px", borderRadius: "2px", margin: "16px 0 0" }}>
              {chart.callout}
            </p>
          )}

          {chart.howTo && (
            <div style={{ marginTop: "32px" }}>
              <h3 style={{ fontFamily: serif, fontSize: "1.4rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 12px" }}>How to measure</h3>
              <ol style={{ fontFamily: sans, fontSize: "14px", color: "#3A3A3A", lineHeight: 1.9, paddingLeft: "20px", margin: 0 }}>
                {chart.howTo.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>
          )}

          <div style={{ marginTop: "32px" }}>
            <h3 style={{ fontFamily: serif, fontSize: "1.4rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 12px" }}>Good to know</h3>
            <ul style={{ fontFamily: sans, fontSize: "14px", color: "#3A3A3A", lineHeight: 1.9, paddingLeft: "20px", margin: 0 }}>
              {chart.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </div>

        {/* Help */}
        <div style={{ background: "#3B4A3E", padding: "64px 24px", textAlign: "center", marginTop: "40px" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 400, color: "#FAF8F3", margin: "0 0 16px" }}>
              Not sure which size to pick?
            </h2>
            <p style={{ fontFamily: sans, fontSize: "15px", color: "rgba(250,248,243,0.7)", lineHeight: 1.8, margin: "0 0 32px" }}>
              Message Morayo with your measurements and she will help you choose, or commission a piece made to your exact fit.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                style={{ fontFamily: sans, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#B8973A", color: "#FAF8F3", padding: "16px 28px", textDecoration: "none" }}>
                Chat on WhatsApp
              </a>
              <Link to="/custom-orders"
                style={{ fontFamily: sans, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", border: "1px solid #FAF8F3", color: "#FAF8F3", padding: "16px 28px", textDecoration: "none" }}>
                Start a Custom Order
              </Link>
            </div>
            <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: "1.1rem", color: "#B8973A", margin: "40px 0 0" }}>
              MO FashionForge — Handmade with love, designed for you.
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}

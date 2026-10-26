import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const font = "Inter, sans-serif";
const naira = (kobo) => `₦${(Number(kobo || 0) / 100).toLocaleString("en-NG")}`;
const pct = (a, b) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);
const lagosDay = (d) => d.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });

const card = { background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "20px" };
const smallLabel = { fontFamily: font, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", margin: "0 0 6px" };
const h2 = { fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 16px" };
const th = { padding: "10px 12px", textAlign: "left", fontFamily: font, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500, whiteSpace: "nowrap" };
const td = { padding: "10px 12px", fontFamily: font, fontSize: "13px", color: "#0F0F0F" };

const RANGES = [[7, "7 days"], [30, "30 days"], [90, "90 days"]];

const FUNNEL = [
  ["visited", "Visited the site"],
  ["viewed_product", "Viewed a product"],
  ["added_to_cart", "Added to cart"],
  ["reached_checkout", "Reached checkout"],
  ["started_payment", "Started payment"],
  ["paid_orders", "Paid orders"],
];

const DROP_HINTS = {
  viewed_product: "Many visitors leave without opening a piece. Check the homepage and shop: are the best pieces easy to find?",
  added_to_cart: "People look at pieces but don't add them to the cart. Check prices, photos, size information and descriptions.",
  reached_checkout: "People add to cart but don't go on to checkout. Is the delivery cost unclear? Is the cart easy to understand?",
  started_payment: "People reach checkout but don't pay. The form may feel long; follow up on WhatsApp if you have their number.",
  paid_orders: "People start paying but don't finish. Check for payment problems and follow up with those customers.",
};

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    supabase.rpc("analytics_summary", { p_days: days }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) { setError(error.message); setData(null); } else { setData(data); }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [days]);

  const series = useMemo(() => {
    const map = new Map((data?.daily || []).map((r) => [r.day, r]));
    return Array.from({ length: days }, (_, i) => {
      const key = lagosDay(new Date(Date.now() - (days - 1 - i) * 86400000));
      const r = map.get(key);
      return { day: key, visitors: r?.visitors || 0, pageviews: r?.pageviews || 0 };
    });
  }, [data, days]);

  const products = data?.products || [];
  const funnel = data?.funnel || {};
  const totals = data?.totals || {};
  const revenue = products.reduce((sum, p) => sum + Number(p.revenue || 0), 0);

  const insights = useMemo(() => {
    if (!data) return [];
    const out = [];
    if ((totals.visitors || 0) < 30) {
      out.push({ tone: "note", text: "There isn't much data yet. These numbers get more reliable after a couple of weeks of visitors." });
    }
    // Biggest drop between funnel steps
    let worst = null;
    for (let i = 1; i < FUNNEL.length; i++) {
      const prev = Number(funnel[FUNNEL[i - 1][0]] || 0);
      const cur = Number(funnel[FUNNEL[i][0]] || 0);
      if (prev >= 5) {
        const lost = 100 - pct(cur, prev);
        if (!worst || lost > worst.lost) worst = { key: FUNNEL[i][0], from: FUNNEL[i - 1][1], to: FUNNEL[i][1], lost };
      }
    }
    if (worst && worst.lost > 0) {
      out.push({ tone: "bad", text: `Biggest drop-off: ${worst.lost}% of people don't go from "${worst.from}" to "${worst.to}". ${DROP_HINTS[worst.key]}` });
    }
    const best = [...products].sort((a, b) => b.units - a.units)[0];
    if (best && best.units > 0) out.push({ tone: "good", text: `Best seller: ${best.name} (${best.units} sold, ${naira(best.revenue)}).` });
    const lookedNotWanted = products.filter((p) => p.views >= 10 && p.adds === 0).map((p) => p.name);
    if (lookedNotWanted.length) out.push({ tone: "bad", text: `Looked at often but never added to cart: ${lookedNotWanted.slice(0, 5).join(", ")}. Try better photos, a clearer price or description.` });
    const cartNoBuy = products.filter((p) => p.adds >= 3 && p.units === 0).map((p) => p.name);
    if (cartNoBuy.length) out.push({ tone: "bad", text: `Added to cart but never bought: ${cartNoBuy.slice(0, 5).join(", ")}. Something may be putting people off at checkout (price, delivery, sizing).` });
    if (Number(funnel.payment_not_completed || 0) > 0) {
      out.push({ tone: "note", text: `${funnel.payment_not_completed} online payment${funnel.payment_not_completed > 1 ? "s were" : " was"} started but not completed. Check your Orders page for those customers and message them on WhatsApp.` });
    }
    return out;
  }, [data, funnel, products, totals]);

  const maxVisitors = Math.max(1, ...series.map((s) => s.visitors));
  const funnelTop = Math.max(1, Number(funnel.visited || 0));
  const empty = data && !totals.pageviews;

  const kpis = [
    ["Visitors", Number(totals.visitors || 0).toLocaleString()],
    ["Page views", Number(totals.pageviews || 0).toLocaleString()],
    ["Paid orders", Number(funnel.paid_orders || 0).toLocaleString()],
    ["Visit to purchase", `${pct(Number(funnel.paid_orders || 0), Number(funnel.visited || 0))}%`],
    ["Sales", naira(revenue)],
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>Analytics</h1>
          <div style={{ display: "flex", gap: "4px" }}>
            {RANGES.map(([d, l]) => (
              <button key={d} onClick={() => setDays(d)} style={{ fontFamily: font, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 14px", border: "none", cursor: "pointer", borderRadius: "2px", background: days === d ? "#0F0F0F" : "#E5E5E5", color: days === d ? "#FAF8F3" : "#6B6B6B" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading && <p style={{ fontFamily: font, color: "#6B6B6B" }}>Loading...</p>}
        {error && <p style={{ fontFamily: font, color: "#DC2626", fontSize: "13px" }}>Couldn't load analytics: {error}</p>}
        {empty && !loading && (
          <div style={{ ...card, marginBottom: "24px" }}>
            <p style={{ fontFamily: font, fontSize: "14px", color: "#6B6B6B", margin: 0 }}>
              No visits recorded yet. Numbers will appear here as people browse the shop.
            </p>
          </div>
        )}

        {data && !empty && (
          <>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {kpis.map(([l, v]) => (
                <div key={l} style={card}>
                  <p style={smallLabel}>{l}</p>
                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: "#0F0F0F", margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>

            {/* What's working / what isn't */}
            {insights.length > 0 && (
              <div style={{ ...card, marginBottom: "24px" }}>
                <h2 style={h2}>What's working and what isn't</h2>
                {insights.map((i, idx) => (
                  <p key={idx} style={{ fontFamily: font, fontSize: "13px", lineHeight: 1.6, color: "#0F0F0F", margin: "0 0 10px", paddingLeft: "12px", borderLeft: `3px solid ${i.tone === "good" ? "#16A34A" : i.tone === "bad" ? "#DC2626" : "#B8973A"}` }}>
                    {i.text}
                  </p>
                ))}
              </div>
            )}

            {/* Daily visitors */}
            <div style={{ ...card, marginBottom: "24px" }}>
              <h2 style={h2}>Visitors per day</h2>
              <div style={{ display: "flex", alignItems: "flex-end", gap: days > 30 ? "1px" : "3px", height: "140px" }}>
                {series.map((s) => (
                  <div key={s.day} title={`${s.day}: ${s.visitors} visitors, ${s.pageviews} page views`} style={{ flex: 1, minWidth: 0, background: "#B8973A", opacity: s.visitors ? 1 : 0.15, height: `${Math.max(2, (s.visitors / maxVisitors) * 100)}%`, borderRadius: "1px 1px 0 0" }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: font, fontSize: "11px", color: "#6B6B6B", marginTop: "8px" }}>
                <span>{series[0]?.day}</span>
                <span>Most in one day: {maxVisitors}</span>
                <span>{series[series.length - 1]?.day}</span>
              </div>
            </div>

            {/* Funnel */}
            <div style={{ ...card, marginBottom: "24px" }}>
              <h2 style={h2}>Customer journey: where people drop off</h2>
              {FUNNEL.map(([key, name], i) => {
                const n = Number(funnel[key] || 0);
                const prev = i > 0 ? Number(funnel[FUNNEL[i - 1][0]] || 0) : 0;
                return (
                  <div key={key} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: font, fontSize: "13px", marginBottom: "4px", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ color: "#0F0F0F" }}>{name}</span>
                      <span style={{ color: "#6B6B6B" }}>
                        <strong style={{ color: "#0F0F0F" }}>{n.toLocaleString()}</strong>
                        {i > 0 && ` · ${pct(n, prev)}% of the step before · ${Math.max(0, prev - n).toLocaleString()} lost`}
                      </span>
                    </div>
                    <div style={{ background: "#F0EDE6", height: "10px", borderRadius: "2px" }}>
                      <div style={{ width: `${Math.max(1, pct(n, funnelTop))}%`, height: "100%", background: "#B8973A", borderRadius: "2px" }} />
                    </div>
                  </div>
                );
              })}
              <p style={{ fontFamily: font, fontSize: "12px", color: "#6B6B6B", margin: "8px 0 0", lineHeight: 1.6 }}>
                Steps count separate visits, except "Paid orders", which counts actual paid orders. Customers who pay by bank transfer count once Morayo marks the order paid.
              </p>
            </div>

            {/* Products */}
            <div style={{ ...card, marginBottom: "24px", overflow: "auto" }}>
              <h2 style={h2}>Products</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                    {["Product", "Views", "Added to cart", "Sold", "Sales", "Views to cart"].map((h) => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.product_id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                      <td style={td}>{p.name}</td>
                      <td style={td}>{p.views}</td>
                      <td style={td}>{p.adds}</td>
                      <td style={td}>{p.units}</td>
                      <td style={td}>{naira(p.revenue)}</td>
                      <td style={td}>{p.views ? `${pct(p.adds, p.views)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sources + pages */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              <div style={card}>
                <h2 style={h2}>Where visitors come from</h2>
                {(data.sources || []).length === 0 ? <p style={{ ...td, padding: 0, color: "#6B6B6B" }}>No data yet.</p> : (data.sources || []).map((s) => (
                  <div key={s.source} style={{ display: "flex", justifyContent: "space-between", ...td, padding: "6px 0" }}>
                    <span>{s.source}</span><strong>{s.sessions}</strong>
                  </div>
                ))}
                <p style={{ fontFamily: font, fontSize: "12px", color: "#6B6B6B", margin: "12px 0 0", lineHeight: 1.6 }}>
                  Tip: add <code>?utm_source=instagram</code> to the link in your Instagram bio (and <code>utm_source=whatsapp</code> to links you share on WhatsApp) so those visits show up under their own names instead of "direct".
                </p>
              </div>
              <div style={card}>
                <h2 style={h2}>Most visited pages</h2>
                {(data.pages || []).length === 0 ? <p style={{ ...td, padding: 0, color: "#6B6B6B" }}>No data yet.</p> : (data.pages || []).map((p) => (
                  <div key={p.path} style={{ display: "flex", justifyContent: "space-between", ...td, padding: "6px 0", gap: "12px" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.path}</span><strong>{p.views}</strong>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

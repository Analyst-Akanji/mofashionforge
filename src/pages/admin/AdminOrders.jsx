import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const RECEIPT_BUCKET = "receipts";
const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

const STATUS_COLORS = {
  pending: "#D97706", paid: "#2563EB", processing: "#7C3AED",
  shipped: "#EA580C", delivered: "#16A34A", cancelled: "#DC2626",
};

const ALL_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

const labelStyle = { fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", margin: "0 0 2px" };
const valueStyle = { fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0F0F", margin: 0, whiteSpace: "pre-wrap" };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    const { data, error: err } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (err) setError(`Couldn't load orders: ${err.message}`);
    else setOrders(data || []);
    setLoading(false);
  }

  async function refresh() {
    setLoading(true);
    setError("");
    await fetchOrders();
  }

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  function openOrder(order) {
    setSelected(order);
    setNewStatus(order.status);
    setAdminNotes(order.admin_notes || "");
    setReceiptUrl("");
    setError("");
  }

  async function saveOrder() {
    setSaving(true);
    setError("");
    // .select("id") lets us detect "0 rows changed" (e.g. blocked by permissions), which Supabase doesn't report as an error
    const { data, error: err } = await supabase
      .from("orders")
      .update({ status: newStatus, admin_notes: adminNotes, updated_at: new Date().toISOString() })
      .eq("id", selected.id)
      .select("id");
    if (err || !data?.length) {
      setError(`Couldn't save the order: ${err?.message || "no changes were saved (check permissions)"}`);
    } else {
      await fetchOrders();
      setSelected((prev) => ({ ...prev, status: newStatus, admin_notes: adminNotes }));
    }
    setSaving(false);
  }

  // The receipts bucket is private, so we ask Supabase for a temporary link (valid for 10 minutes)
  async function viewReceipt() {
    if (!selected?.receipt_path) return;
    setReceiptLoading(true);
    setError("");
    const { data, error: err } = await supabase.storage.from(RECEIPT_BUCKET).createSignedUrl(selected.receipt_path, 600);
    if (err || !data?.signedUrl) setError(`Couldn't open the receipt: ${err?.message || "no link was returned"}`);
    else setReceiptUrl(data.signedUrl);
    setReceiptLoading(false);
  }

  const receiptIsImage = /\.(jpe?g|png|webp)$/i.test(selected?.receipt_path || "");
  const items = Array.isArray(selected?.items) ? selected.items : [];

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>Orders</h1>
          <button onClick={refresh} disabled={loading} style={{ background: "none", border: "1px solid #E5E5E5", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 16px", color: "#6B6B6B" }}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontFamily: "Inter, sans-serif", fontSize: "13px", padding: "12px 16px", borderRadius: "2px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", flexWrap: "wrap" }}>
          {["all", ...ALL_STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 14px", border: "none", cursor: "pointer", borderRadius: "2px", background: filter === s ? "#0F0F0F" : "#E5E5E5", color: filter === s ? "#FAF8F3" : "#6B6B6B" }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "24px" }} className="orders-layout">
          {/* Orders table */}
          <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
            {loading ? (
              <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p>
            ) : visible.length === 0 ? (
              <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No orders found.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                    {["Order Ref", "Customer", "Total", "Status", "Date", ""].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #F0F0F0", background: selected?.id === order.id ? "#FEFBF3" : "transparent", cursor: "pointer" }} onClick={() => openOrder(order)}>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>{order.order_ref}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>{order.customer_name}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", whiteSpace: "nowrap" }}>{fmt((order.total || 0) / 100)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status], padding: "4px 10px", borderRadius: "999px" }}>{order.status}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", whiteSpace: "nowrap" }}>{fmtDate(order.created_at)}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", whiteSpace: "nowrap" }}>View →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Order detail panel */}
          {selected && (
            <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", height: "fit-content" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>{selected.order_ref}</h2>
                <button onClick={() => setSelected(null)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6B6B6B" }}>✕</button>
              </div>

              {[
                { label: "Customer", value: selected.customer_name },
                { label: "Email", value: selected.customer_email },
                { label: "Phone", value: selected.customer_phone },
                { label: "Delivery Address", value: selected.delivery_address },
                { label: "Total", value: fmt((selected.total || 0) / 100) },
                { label: "Payment Ref", value: selected.payment_ref || "—" },
              ].map((row) => (
                <div key={row.label} style={{ marginBottom: "12px" }}>
                  <p style={labelStyle}>{row.label}</p>
                  <p style={valueStyle}>{row.value}</p>
                </div>
              ))}

              {items.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={labelStyle}>Items</p>
                  {items.map((it, i) => (
                    <p key={i} style={{ ...valueStyle, marginBottom: "4px" }}>
                      {it.qty} × {it.name} — {fmt(((it.price || 0) * (it.qty || 1)) / 100)}
                    </p>
                  ))}
                </div>
              )}

              {selected.customer_notes && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={labelStyle}>Customer Notes</p>
                  <p style={valueStyle}>{selected.customer_notes}</p>
                </div>
              )}

              {/* Payment receipt */}
              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "16px", marginTop: "16px" }}>
                <p style={labelStyle}>Payment Receipt</p>
                {!selected.receipt_path ? (
                  <p style={{ ...valueStyle, color: "#6B6B6B" }}>No receipt uploaded.</p>
                ) : receiptUrl ? (
                  <div>
                    {receiptIsImage && (
                      <a href={receiptUrl} target="_blank" rel="noreferrer">
                        <img src={receiptUrl} alt="Payment receipt" style={{ width: "100%", maxHeight: "360px", objectFit: "contain", background: "#F5F5F5", borderRadius: "2px", display: "block", marginBottom: "8px" }} />
                      </a>
                    )}
                    <a href={receiptUrl} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#2563EB" }}>
                      Open receipt in a new tab ↗
                    </a>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B6B6B", margin: "6px 0 0" }}>This link expires in 10 minutes.</p>
                  </div>
                ) : (
                  <button onClick={viewReceipt} disabled={receiptLoading} style={{ background: "#0F0F0F", color: "#FAF8F3", border: "none", cursor: receiptLoading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 16px", opacity: receiptLoading ? 0.6 : 1 }}>
                    {receiptLoading ? "Opening..." : "View receipt"}
                  </button>
                )}
              </div>

              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "16px", marginTop: "16px" }}>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "8px" }}>Update Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", marginBottom: "12px", background: "#fff" }}>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "8px" }}>Admin Notes</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", resize: "vertical", boxSizing: "border-box", marginBottom: "12px" }} />

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={saveOrder} disabled={saving} style={{ flex: 1, background: "#B8973A", color: "#FAF8F3", border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px" }}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <a href={`https://wa.me/${selected.customer_phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#25D366", color: "#fff", textDecoration: "none", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px" }}>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .orders-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </AdminLayout>
  );
}

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

const STATUS_COLORS = {
  pending: "#D97706", paid: "#2563EB", processing: "#7C3AED",
  shipped: "#EA580C", delivered: "#16A34A", cancelled: "#DC2626",
};

const ALL_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  const visible = filter === "all" ? orders : orders.filter(o => o.status === filter);

  function openOrder(order) {
    setSelected(order);
    setNewStatus(order.status);
    setAdminNotes(order.admin_notes || "");
  }

  async function saveOrder() {
    setSaving(true);
    await supabase.from("orders").update({ status: newStatus, admin_notes: adminNotes, updated_at: new Date().toISOString() }).eq("id", selected.id);
    await fetchOrders();
    setSelected(prev => ({ ...prev, status: newStatus, admin_notes: adminNotes }));
    setSaving(false);
  }

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 24px" }}>Orders</h1>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", flexWrap: "wrap" }}>
          {["all", ...ALL_STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 14px", border: "none", cursor: "pointer", borderRadius: "2px", background: filter === s ? "#0F0F0F" : "#E5E5E5", color: filter === s ? "#FAF8F3" : "#6B6B6B" }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "24px" }}>
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
                    {["Order Ref", "Customer", "Total", "Status", "Date", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #F0F0F0", background: selected?.id === order.id ? "#FEFBF3" : "transparent", cursor: "pointer" }} onClick={() => openOrder(order)}>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}>{order.order_ref}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>{order.customer_name}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>{fmt((order.total || 0) / 100)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status], padding: "4px 10px", borderRadius: "999px" }}>{order.status}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", whiteSpace: "nowrap" }}>{fmtDate(order.created_at)}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A" }}>View →</td>
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
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6B6B6B" }}>✕</button>
              </div>

              {[
                { label: "Customer", value: selected.customer_name },
                { label: "Email", value: selected.customer_email },
                { label: "Phone", value: selected.customer_phone },
                { label: "Delivery Address", value: selected.delivery_address },
                { label: "Total", value: fmt((selected.total || 0) / 100) },
                { label: "Payment Ref", value: selected.payment_ref || "—" },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: "12px" }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", margin: "0 0 2px" }}>{row.label}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0F0F", margin: 0 }}>{row.value}</p>
                </div>
              ))}

              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "16px", marginTop: "16px" }}>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "8px" }}>Update Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", marginBottom: "12px", background: "#fff" }}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "8px" }}>Admin Notes</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", resize: "vertical", boxSizing: "border-box", marginBottom: "12px" }} />

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={saveOrder} disabled={saving} style={{ flex: 1, background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px" }}>
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
    </AdminLayout>
  );
}

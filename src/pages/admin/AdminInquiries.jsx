import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
const STATUSES = ["new", "reviewed", "quoted", "accepted", "declined"];
const STATUS_COLORS = { new: "#2563EB", reviewed: "#D97706", quoted: "#7C3AED", accepted: "#16A34A", declined: "#DC2626" };

export default function AdminInquiries() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    const { data } = await supabase.from("custom_order_inquiries").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  function open(item) { setSelected(item); setNotes(item.admin_notes || ""); setStatus(item.status); }

  async function save() {
    setSaving(true);
    await supabase.from("custom_order_inquiries").update({ status, admin_notes: notes }).eq("id", selected.id);
    await fetch();
    setSelected(prev => ({ ...prev, status, admin_notes: notes }));
    setSaving(false);
  }

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 24px" }}>Custom Order Inquiries</h1>
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
            {loading ? <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p> :
              items.length === 0 ? <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No inquiries yet.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                    {["Name", "Email", "Date", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} onClick={() => open(item)} style={{ borderBottom: "1px solid #F0F0F0", cursor: "pointer", background: selected?.id === item.id ? "#FEFBF3" : "transparent" }}>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B" }}>{item.email}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B" }}>{fmtDate(item.created_at)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: `${STATUS_COLORS[item.status]}20`, color: STATUS_COLORS[item.status], padding: "4px 10px", borderRadius: "999px" }}>{item.status}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A" }}>View →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {selected && (
            <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", height: "fit-content" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", fontWeight: 400, margin: 0 }}>{selected.name}</h2>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6B6B6B" }}>✕</button>
              </div>
              {[{ label: "Email", value: selected.email }, { label: "Phone", value: selected.phone }, { label: "Date", value: fmtDate(selected.created_at) }].map(r => (
                <div key={r.label} style={{ marginBottom: "12px" }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", margin: "0 0 2px" }}>{r.label}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0F0F", margin: 0 }}>{r.value}</p>
                </div>
              ))}
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", margin: "0 0 6px" }}>Description</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0F0F", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{selected.description}</p>
              </div>
              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "16px" }}>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%", padding: "10px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", marginBottom: "12px" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "10px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", resize: "vertical", boxSizing: "border-box", marginBottom: "12px" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={save} disabled={saving} style={{ flex: 1, background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px" }}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <a href={`https://wa.me/${selected.phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#25D366", color: "#fff", textDecoration: "none", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", padding: "12px" }}>
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

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

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data } = await supabase.from("custom_order_inquiries").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  function open(item) { setSelected(item); setNotes(item.admin_notes || ""); setStatus(item.status); }
  function close() { setSelected(null); }

  async function save() {
    setSaving(true);
    await supabase.from("custom_order_inquiries").update({ status, admin_notes: notes }).eq("id", selected.id);
    await fetchData();
    setSelected(prev => ({ ...prev, status, admin_notes: notes }));
    setSaving(false);
  }

  const cardStyle = { background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" };
  const labelStyle = { fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", margin: "0 0 2px" };
  const valueStyle = { fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0F0F0F", margin: "0 0 16px" };

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 24px" }}>
          Custom Order Inquiries
        </h1>

        {/* Detail panel — shows above table on mobile when selected */}
        {selected && (
          <div style={{ ...cardStyle, marginBottom: "20px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400, margin: 0 }}>{selected.name}</h2>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6B6B6B", padding: "4px 8px" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }} className="detail-grid">
              <div>
                <p style={labelStyle}>Email</p>
                <p style={valueStyle}>{selected.email}</p>
              </div>
              <div>
                <p style={labelStyle}>Phone</p>
                <p style={valueStyle}>{selected.phone}</p>
              </div>
              <div>
                <p style={labelStyle}>Date</p>
                <p style={valueStyle}>{fmtDate(selected.created_at)}</p>
              </div>
              <div>
                <p style={labelStyle}>Current Status</p>
                <p style={{ ...valueStyle, marginBottom: 0 }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: `${STATUS_COLORS[selected.status]}20`, color: STATUS_COLORS[selected.status], padding: "4px 10px", borderRadius: "999px" }}>
                    {selected.status}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ margin: "16px 0", padding: "16px", background: "#F5F5F5", borderRadius: "2px" }}>
              <p style={labelStyle}>Description</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#0F0F0F", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{selected.description}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }} className="detail-grid">
              <div>
                <label style={labelStyle}>Update Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", background: "#fff" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Admin Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", resize: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, minWidth: "120px", background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <a href={`https://wa.me/${selected.phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                style={{ flex: 1, minWidth: "120px", display: "flex", alignItems: "center", justifyContent: "center", background: "#25D366", color: "#fff", textDecoration: "none", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", padding: "12px" }}>
                WhatsApp
              </a>
              <a href={`mailto:${selected.email}`}
                style={{ flex: 1, minWidth: "120px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F0F0F", color: "#fff", textDecoration: "none", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", padding: "12px" }}>
                Email
              </a>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={cardStyle}>
          {loading ? (
            <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No inquiries yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                    {["Name", "Email", "Date", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} onClick={() => open(item)}
                      style={{ borderBottom: "1px solid #F0F0F0", cursor: "pointer", background: selected?.id === item.id ? "#FEFBF3" : "transparent" }}>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>{item.name}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B" }}>{item.email}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", whiteSpace: "nowrap" }}>{fmtDate(item.created_at)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: `${STATUS_COLORS[item.status]}20`, color: STATUS_COLORS[item.status], padding: "4px 10px", borderRadius: "999px", whiteSpace: "nowrap" }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", whiteSpace: "nowrap" }}>View →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  );
}

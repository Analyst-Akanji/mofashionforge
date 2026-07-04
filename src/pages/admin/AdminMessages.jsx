import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
const STATUS_COLORS = { unread: "#2563EB", read: "#D97706", replied: "#16A34A" };

export default function AdminMessages() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMessages(); }, []);

  async function fetchMessages() {
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from("contact_submissions").update({ status }).eq("id", id);
    await fetchMessages();
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  }

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 24px" }}>Messages</h1>
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
            {loading ? <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p> :
              items.length === 0 ? <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No messages yet.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                    {["Name", "Email", "Preview", "Date", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} onClick={() => { setSelected(item); updateStatus(item.id, item.status === "unread" ? "read" : item.status); }} style={{ borderBottom: "1px solid #F0F0F0", cursor: "pointer", background: selected?.id === item.id ? "#FEFBF3" : item.status === "unread" ? "#F0F7FF" : "transparent" }}>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: item.status === "unread" ? 700 : 400 }}>{item.name}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B" }}>{item.email}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.message?.slice(0, 60)}...</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", whiteSpace: "nowrap" }}>{fmtDate(item.created_at)}</td>
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
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", margin: "0 0 4px" }}>{selected.email}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6B6B6B", margin: "0 0 20px" }}>{fmtDate(selected.created_at)}</p>
              <div style={{ background: "#F5F5F5", padding: "16px", borderRadius: "2px", marginBottom: "20px" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#0F0F0F", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{selected.message}</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => updateStatus(selected.id, "replied")} style={{ flex: 1, background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px" }}>
                  Mark Replied
                </button>
                <a href={`mailto:${selected.email}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#0F0F0F", color: "#FAF8F3", textDecoration: "none", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", padding: "12px" }}>
                  Reply by Email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

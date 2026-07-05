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

  function open(item) {
    setSelected(item);
    if (item.status === "unread") updateStatus(item.id, "read");
  }

  const cardStyle = { background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };
  const labelStyle = { fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", margin: "0 0 4px" };

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 24px" }}>Messages</h1>

        {/* Detail panel — above table */}
        {selected && (
          <div style={{ ...cardStyle, marginBottom: "20px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400, margin: "0 0 4px" }}>{selected.name}</h2>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", margin: 0 }}>{selected.email} · {fmtDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6B6B6B", padding: "4px 8px" }}>✕</button>
            </div>

            <div style={{ background: "#F5F5F5", padding: "20px", borderRadius: "2px", marginBottom: "20px" }}>
              <p style={labelStyle}>Message</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#0F0F0F", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{selected.message}</p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: `${STATUS_COLORS[selected.status]}20`, color: STATUS_COLORS[selected.status], padding: "4px 12px", borderRadius: "999px" }}>
                {selected.status}
              </span>
              <button onClick={() => updateStatus(selected.id, "replied")}
                style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 20px", borderRadius: "2px" }}>
                Mark Replied
              </button>
              <a href={`mailto:${selected.email}`}
                style={{ display: "inline-flex", alignItems: "center", background: "#0F0F0F", color: "#fff", textDecoration: "none", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", padding: "10px 20px", borderRadius: "2px" }}>
                Reply by Email
              </a>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={cardStyle}>
          {loading ? (
            <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No messages yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                    {["Name", "Preview", "Date", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} onClick={() => open(item)}
                      style={{ borderBottom: "1px solid #F0F0F0", cursor: "pointer", background: selected?.id === item.id ? "#FEFBF3" : item.status === "unread" ? "#F0F7FF" : "transparent" }}>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: item.status === "unread" ? 700 : 400, whiteSpace: "nowrap" }}>{item.name}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.message?.slice(0, 60)}...
                      </td>
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
    </AdminLayout>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

const STATUS_COLORS = {
  pending: "#D97706", paid: "#2563EB", processing: "#7C3AED",
  shipped: "#EA580C", delivered: "#16A34A", cancelled: "#DC2626",
};

function StatCard({ label, value, sub, to }) {
  return (
    <Link to={to || "#"} style={{ textDecoration: "none", display: "block", background: "#fff", borderRadius: "4px", padding: "24px", borderTop: "3px solid #B8973A", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", margin: "0 0 8px" }}>{label}</p>
      <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2.2rem", color: "#0F0F0F", margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", margin: "6px 0 0" }}>{sub}</p>}
    </Link>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, inquiries: 0, messages: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, inquiriesRes, messagesRes, recentRes] = await Promise.all([
        supabase.from("orders").select("total, status"),
        supabase.from("custom_order_inquiries").select("id").eq("status", "new"),
        supabase.from("contact_submissions").select("id").eq("status", "unread"),
        supabase.from("orders").select("order_ref, customer_name, total, status, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        orders: orders.length,
        revenue,
        inquiries: (inquiriesRes.data || []).length,
        messages: (messagesRes.data || []).length,
      });
      setRecentOrders(recentRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 32px" }}>Overview</h1>

        {loading ? (
          <p style={{ color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }} className="stats-grid">
              <StatCard label="Total Orders" value={stats.orders} to="/admin/orders" />
              <StatCard label="Total Revenue" value={fmt(stats.revenue / 100)} sub="from paid orders" to="/admin/orders" />
              <StatCard label="New Inquiries" value={stats.inquiries} sub="awaiting review" to="/admin/inquiries" />
              <StatCard label="Unread Messages" value={stats.messages} to="/admin/messages" />
            </div>

            <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F0" }}>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>Recent Orders</h2>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ padding: "32px 24px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No orders yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                      {["Order Ref", "Customer", "Total", "Status", "Date", ""].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.order_ref} style={{ borderBottom: "1px solid #F0F0F0" }}>
                        <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F0F0F" }}>{order.order_ref}</td>
                        <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#1A1A1A" }}>{order.customer_name}</td>
                        <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#1A1A1A" }}>{fmt((order.total || 0) / 100)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status], padding: "4px 10px", borderRadius: "999px" }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B" }}>{fmtDate(order.created_at)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <Link to={`/admin/orders`} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", textDecoration: "none" }}>View →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
      <style>{`
        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </AdminLayout>
  );
}

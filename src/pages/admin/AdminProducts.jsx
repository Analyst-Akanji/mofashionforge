import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const CATEGORIES = ["earrings", "bucket_hats", "tops", "sweatshirts", "accessories", "limited"];

const emptyForm = { name: "", category: "tops", price: "", description: "", stock_qty: 0, is_active: true, is_limited: false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditId(null); setShowForm(true); }
  function openEdit(p) {
    setForm({ name: p.name, category: p.category, price: (p.price / 100).toString(), description: p.description || "", stock_qty: p.stock_qty || 0, is_active: p.is_active, is_limited: p.is_limited });
    setEditId(p.id);
    setShowForm(true);
  }

  async function saveProduct() {
    setSaving(true);
    const payload = { ...form, price: Math.round(parseFloat(form.price) * 100), updated_at: new Date().toISOString() };
    if (editId) {
      await supabase.from("products").update(payload).eq("id", editId);
    } else {
      await supabase.from("products").insert(payload);
    }
    await fetchProducts();
    setShowForm(false);
    setSaving(false);
  }

  async function toggleActive(p) {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    await fetchProducts();
  }

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>Products</h1>
          <button onClick={openNew} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 20px" }}>
            + Add Product
          </button>
        </div>

        {/* Product form */}
        {showForm && (
          <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "28px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400, margin: "0 0 24px" }}>{editId ? "Edit Product" : "New Product"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-grid">
              {[
                { key: "name", label: "Product Name *", type: "text" },
                { key: "price", label: "Price (₦) *", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Stock Quantity</label>
                <input type="number" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: parseInt(e.target.value) })} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", boxSizing: "border-box" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: "24px" }}>
                {[{ key: "is_active", label: "Active" }, { key: "is_limited", label: "Limited Edition" }].map(f => (
                  <label key={f.key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#1A1A1A" }}>
                    <input type="checkbox" checked={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={saveProduct} disabled={saving} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px" }}>
                {saving ? "Saving..." : "Save Product"}
              </button>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #E5E5E5", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", color: "#6B6B6B" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products table */}
        <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
          {loading ? (
            <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                  {["Product", "Category", "Price", "Stock", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F0F0F" }}>{p.name}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", textTransform: "capitalize" }}>{p.category?.replace("_", " ")}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>{fmt((p.price || 0) / 100)}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>{p.stock_qty || 0}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: p.is_active ? "#16A34A20" : "#DC262620", color: p.is_active ? "#16A34A" : "#DC2626", padding: "4px 10px", borderRadius: "999px" }}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEdit(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                        <button onClick={() => toggleActive(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6B6B6B", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          {p.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr !important; } }`}</style>
    </AdminLayout>
  );
}

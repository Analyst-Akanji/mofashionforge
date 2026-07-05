import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const CATEGORIES = ["earrings", "bucket_hats", "tops", "sweatshirts", "accessories", "limited"];
const emptyForm = { name: "", category: "tops", price: "", description: "", stock_qty: 0, is_active: true, is_limited: false, images: [] };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  function openNew() { setForm(emptyForm); setEditId(null); setShowForm(true); }
  function openEdit(p) {
    setForm({
      name: p.name, category: p.category,
      price: (p.price / 100).toString(),
      description: p.description || "",
      stock_qty: p.stock_qty || 0,
      is_active: p.is_active,
      is_limited: p.is_limited,
      images: p.images || [],
    });
    setEditId(p.id);
    setShowForm(true);
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (form.images.length + files.length > 4) {
      alert("Maximum 4 images per product.");
      return;
    }

    setUploading(true);
    const uploaded = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filename, file, { cacheControl: "3600", upsert: false });

      if (!error) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename);
        uploaded.push(urlData.publicUrl);
      }
    }

    setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
    setUploading(false);
    setUploadProgress("");
    e.target.value = "";
  }

  function removeImage(idx) {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  }

  async function saveProduct() {
    if (!form.name || !form.price) { alert("Name and price are required."); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: Math.round(parseFloat(form.price) * 100),
      description: form.description,
      stock_qty: parseInt(form.stock_qty) || 0,
      is_active: form.is_active,
      is_limited: form.is_limited,
      images: form.images,
      updated_at: new Date().toISOString(),
    };
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

  async function deleteProduct(id) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await supabase.from("products").delete().eq("id", id);
    await fetchProducts();
  }

  const inputStyle = { width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", boxSizing: "border-box" };
  const labelStyle = { fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" };

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>Products</h1>
          <button onClick={openNew} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 20px" }}>
            + Add Product
          </button>
        </div>

        {/* Product form */}
        {showForm && (
          <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400, margin: "0 0 24px" }}>{editId ? "Edit Product" : "New Product"}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-grid">
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Crochet Tote Bag" />
              </div>
              <div>
                <label style={labelStyle}>Price (₦) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} placeholder="e.g. 35000" />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Stock Quantity</label>
                <input type="number" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Brief description of the piece..." />
              </div>

              {/* Image upload */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Product Images (up to 4)</label>

                {/* Existing images */}
                {form.images.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {form.images.map((url, i) => (
                      <div key={i} style={{ position: "relative", width: "80px", height: "80px" }}>
                        <img src={url} alt={`Product ${i + 1}`} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "2px", border: "1px solid #E5E5E5" }} />
                        <button
                          onClick={() => removeImage(i)}
                          style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", background: "#DC2626", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {form.images.length < 4 && (
                  <div>
                    <label style={{ display: "inline-block", background: "#F5F5F5", border: "2px dashed #E5E5E5", borderRadius: "4px", padding: "20px 32px", cursor: "pointer", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#B8973A", margin: 0 }}>⏳ {uploadProgress}</p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", margin: "0 0 4px" }}>Click to upload photos</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#B8973A", margin: 0 }}>
                            {4 - form.images.length} slot{4 - form.images.length !== 1 ? "s" : ""} remaining · JPG or PNG
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", gap: "24px" }}>
                {[{ key: "is_active", label: "Active (visible on shop)" }, { key: "is_limited", label: "Limited Edition" }].map(f => (
                  <label key={f.key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#1A1A1A" }}>
                    <input type="checkbox" checked={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={saveProduct} disabled={saving || uploading} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", opacity: (saving || uploading) ? 0.7 : 1 }}>
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
          ) : products.length === 0 ? (
            <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No products yet. Add your first product above.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                  {["Photo", "Product", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: "12px 14px" }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "2px" }} />
                      ) : (
                        <div style={{ width: "48px", height: "48px", background: "#F0EDE6", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "#B8973A" }}>🧶</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F0F0F" }}>{p.name}</td>
                    <td style={{ padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", textTransform: "capitalize" }}>{p.category?.replace("_", " ")}</td>
                    <td style={{ padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>{fmt((p.price || 0) / 100)}</td>
                    <td style={{ padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: "13px", textAlign: "center" }}>{p.stock_qty || 0}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: p.is_active ? "#16A34A20" : "#DC262620", color: p.is_active ? "#16A34A" : "#DC2626", padding: "4px 10px", borderRadius: "999px" }}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button onClick={() => openEdit(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                        <button onClick={() => toggleActive(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6B6B6B", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          {p.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => deleteProduct(p.id)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
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

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";
import CategoryManager from "../../components/admin/CategoryManager";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;
const emptyForm = { name: "", category: "", price: "", description: "", stock_qty: 0, is_active: true, is_limited: false, images: [] };

const MAX_IMAGES = 4;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "product-images";

const prettyCategory = (c) => (c || "").replaceAll("_", " ");
// Public URL -> file name inside the bucket
const storageName = (url) => decodeURIComponent((url || "").split(`/${BUCKET}/`)[1] || "");

// Shrinks big phone photos (max 1600px, JPEG) before upload.
// Falls back to the original file if anything goes wrong.
async function compressImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (blob && blob.size < file.size) return { blob, ext: "jpg", type: "image/jpeg" };
  } catch (_) {
    /* fall through to the original file */
  }
  return { blob: file, ext: file.name.split(".").pop().toLowerCase(), type: file.type };
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [originalImages, setOriginalImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => { refreshAll(); }, []);

  async function fetchCategories() {
    const { data, error: err } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    if (err) setError(`Couldn't load categories: ${err.message}`);
    else setCategories(data || []);
  }

  // Used by the category manager: a rename, delete or "move products" changes both lists
  async function refreshAll() {
    await Promise.all([fetchCategories(), fetchProducts()]);
  }

  const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || (slug || "").replaceAll("_", " ");

  async function fetchProducts() {
    const { data, error: err } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (err) setError(`Couldn't load products: ${err.message}`);
    else setProducts(data || []);
    setLoading(false);
  }

  // Best effort: remove files from the bucket. Never blocks the UI.
  async function removeFromStorage(urls) {
    const names = urls.map(storageName).filter(Boolean);
    if (!names.length) return;
    const { error: err } = await supabase.storage.from(BUCKET).remove(names);
    if (err) console.error("Storage cleanup failed:", err.message);
  }

  // Images uploaded in the form but never saved (cancelled, or switched to another product)
  function discardUnsavedUploads() {
    removeFromStorage(form.images.filter((u) => !originalImages.includes(u)));
  }

  function openNew() {
    if (showForm) discardUnsavedUploads();
    setError("");
    setForm({ ...emptyForm, category: categories[0]?.slug || "" });
    setOriginalImages([]);
    setEditId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(p) {
    if (showForm) discardUnsavedUploads();
    setError("");
    const images = p.images || [];
    setForm({
      name: p.name, category: p.category,
      price: (p.price / 100).toString(),
      description: p.description || "",
      stock_qty: p.stock_qty || 0,
      is_active: p.is_active,
      is_limited: p.is_limited,
      images,
    });
    setOriginalImages(images);
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelForm() {
    discardUnsavedUploads();
    setShowForm(false);
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    e.target.value = "";
    if (!files.length) return;
    if (form.images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images per product.`);
      return;
    }
    const badType = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (badType) {
      setError(`"${badType.name}" isn't a JPG, PNG or WebP image.`);
      return;
    }

    setError("");
    setUploading(true);
    const uploaded = [];
    const failed = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`);
      const { blob, ext, type } = await compressImage(file);
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: err } = await supabase.storage
        .from(BUCKET)
        .upload(filename, blob, { cacheControl: "3600", upsert: false, contentType: type });

      if (err) {
        failed.push(file.name);
        console.error("Upload failed:", err.message);
      } else {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
        uploaded.push(urlData.publicUrl);
      }
    }

    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    if (failed.length) setError(`Couldn't upload: ${failed.join(", ")}. Please try again.`);
    setUploading(false);
    setUploadProgress("");
  }

  function removeImage(idx) {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  }

  async function saveProduct() {
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.category) { setError("Choose a category. Add one under \"Manage categories\" if the list is empty."); return; }
    const price = parseFloat(form.price);
    if (!Number.isFinite(price) || price <= 0) { setError("Enter a price greater than zero."); return; }

    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Math.round(price * 100),
      description: form.description,
      stock_qty: Math.max(0, parseInt(form.stock_qty, 10) || 0),
      is_active: form.is_active,
      is_limited: form.is_limited,
      images: form.images,
      updated_at: new Date().toISOString(),
    };

    const query = editId
      ? supabase.from("products").update(payload).eq("id", editId)
      : supabase.from("products").insert(payload);
    // .select("id") lets us detect "0 rows changed" (e.g. blocked by RLS), which Supabase doesn't report as an error
    const { data, error: err } = await query.select("id");

    if (err || !data?.length) {
      setError(`Couldn't save the product: ${err?.message || "no changes were saved (check permissions)"}`);
      setSaving(false);
      return; // keep the form open so nothing she typed is lost
    }

    // Images she removed while editing are now safe to delete from storage
    removeFromStorage(originalImages.filter((u) => !form.images.includes(u)));
    await fetchProducts();
    setShowForm(false);
    setSaving(false);
  }

  async function toggleActive(p) {
    if (busyId) return;
    setBusyId(p.id);
    setError("");
    const { data, error: err } = await supabase
      .from("products")
      .update({ is_active: !p.is_active, updated_at: new Date().toISOString() })
      .eq("id", p.id)
      .select("id");
    if (err || !data?.length) {
      setError(`Couldn't update "${p.name}": ${err?.message || "no changes were saved (check permissions)"}`);
    }
    await fetchProducts();
    setBusyId(null);
  }

  async function deleteProduct(p) {
    if (busyId) return;
    if (!confirm(`Delete "${p.name}"? This cannot be undone. (Deactivate hides it from the shop without deleting.)`)) return;
    setBusyId(p.id);
    setError("");
    const { data, error: err } = await supabase.from("products").delete().eq("id", p.id).select("id");
    if (err || !data?.length) {
      setError(`Couldn't delete "${p.name}": ${err?.message || "nothing was deleted (check permissions)"}`);
    } else {
      removeFromStorage(p.images || []);
    }
    await fetchProducts();
    setBusyId(null);
  }

  const inputStyle = { width: "100%", padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", boxSizing: "border-box" };
  const labelStyle = { fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" };

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>Products</h1>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => setShowCategories((v) => !v)} aria-expanded={showCategories} style={{ background: "none", color: "#0F0F0F", border: "1px solid #E5E5E5", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 20px" }}>
              {showCategories ? "Hide categories" : "Manage categories"}
            </button>
            <button onClick={openNew} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 20px" }}>
              + Add Product
            </button>
          </div>
        </div>

        {showCategories && (
          <CategoryManager categories={categories} products={products} onChanged={refreshAll} />
        )}

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
                  {categories.length === 0 && !form.category && <option value="">No categories yet</option>}
                  {form.category && !categories.some((c) => c.slug === form.category) && (
                    <option value={form.category}>{categoryName(form.category)} (not in your categories list)</option>
                  )}
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
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
                            {4 - form.images.length} slot{4 - form.images.length !== 1 ? "s" : ""} remaining · JPG, PNG or WebP
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
              <button onClick={cancelForm} style={{ background: "none", border: "1px solid #E5E5E5", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", color: "#6B6B6B" }}>
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
                    <td style={{ padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B" }}>{categoryName(p.category)}</td>
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
                        <button onClick={() => deleteProduct(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
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

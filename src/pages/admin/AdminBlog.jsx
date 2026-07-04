import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";

const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const emptyPost = { title: "", slug: "", excerpt: "", content: "", featured_image: "", is_published: false };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(emptyPost);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  function openNew() { setForm(emptyPost); setEditId(null); setShowEditor(true); }
  function openEdit(p) {
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || "", content: p.content, featured_image: p.featured_image || "", is_published: p.is_published });
    setEditId(p.id);
    setShowEditor(true);
  }

  function handleTitleChange(title) {
    setForm(prev => ({ ...prev, title, slug: prev.slug || slugify(title) }));
  }

  async function save() {
    setSaving(true);
    const payload = {
      ...form,
      updated_at: new Date().toISOString(),
      published_at: form.is_published ? new Date().toISOString() : null,
    };
    if (editId) {
      await supabase.from("blog_posts").update(payload).eq("id", editId);
    } else {
      await supabase.from("blog_posts").insert(payload);
    }
    await fetchPosts();
    setShowEditor(false);
    setSaving(false);
  }

  async function togglePublish(p) {
    await supabase.from("blog_posts").update({
      is_published: !p.is_published,
      published_at: !p.is_published ? new Date().toISOString() : null
    }).eq("id", p.id);
    await fetchPosts();
  }

  async function deletePost(id) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    await fetchPosts();
  }

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>Blog</h1>
          {!showEditor && (
            <button onClick={openNew} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 20px" }}>
              + New Post
            </button>
          )}
        </div>

        {showEditor && (
          <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "32px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", fontWeight: 400, margin: "0 0 24px" }}>{editId ? "Edit Post" : "New Post"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Title *</label>
                <input value={form.title} onChange={e => handleTitleChange(e.target.value)} style={{ width: "100%", padding: "12px 16px", fontFamily: "Inter, sans-serif", fontSize: "14px", border: "1px solid #E5E5E5", borderRadius: "2px", boxSizing: "border-box" }} placeholder="Post title" />
              </div>
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Slug (URL) *</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} style={{ width: "100%", padding: "12px 16px", fontFamily: "Inter, sans-serif", fontSize: "14px", border: "1px solid #E5E5E5", borderRadius: "2px", boxSizing: "border-box", color: "#B8973A" }} placeholder="post-url-slug" />
              </div>
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Excerpt (short description)</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} maxLength={200} style={{ width: "100%", padding: "12px 16px", fontFamily: "Inter, sans-serif", fontSize: "14px", border: "1px solid #E5E5E5", borderRadius: "2px", resize: "vertical", boxSizing: "border-box" }} placeholder="Brief summary shown on blog index..." />
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B6B6B", margin: "4px 0 0", textAlign: "right" }}>{form.excerpt.length}/200</p>
              </div>
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Featured Image URL</label>
                <input value={form.featured_image} onChange={e => setForm({ ...form, featured_image: e.target.value })} style={{ width: "100%", padding: "12px 16px", fontFamily: "Inter, sans-serif", fontSize: "14px", border: "1px solid #E5E5E5", borderRadius: "2px", boxSizing: "border-box" }} placeholder="https://... or /assets/image.jpg" />
              </div>
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" }}>Content *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={16} style={{ width: "100%", padding: "16px", fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: 1.8, border: "1px solid #E5E5E5", borderRadius: "2px", resize: "vertical", boxSizing: "border-box" }} placeholder="Write your article here. Separate paragraphs with a blank line." />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#1A1A1A" }}>
                <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} />
                Publish immediately (visible on blog page)
              </label>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={save} disabled={saving || !form.title || !form.slug || !form.content} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 28px", opacity: (!form.title || !form.slug || !form.content) ? 0.5 : 1 }}>
                {saving ? "Saving..." : editId ? "Update Post" : "Create Post"}
              </button>
              <button onClick={() => setShowEditor(false)} style={{ background: "none", border: "1px solid #E5E5E5", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 28px", color: "#6B6B6B" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
          {loading ? <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p> :
            posts.length === 0 ? <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No posts yet. Create your first post above.</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                  {["Title", "Status", "Date", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F0F0F", margin: "0 0 2px" }}>{p.title}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#B8973A", margin: 0 }}>/blog/{p.slug}</p>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: p.is_published ? "#16A34A20" : "#6B6B6B20", color: p.is_published ? "#16A34A" : "#6B6B6B", padding: "4px 10px", borderRadius: "999px" }}>
                        {p.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B" }}>{fmtDate(p.created_at)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => openEdit(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                        <button onClick={() => togglePublish(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: p.is_published ? "#D97706" : "#16A34A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          {p.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button onClick={() => deletePost(p.id)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

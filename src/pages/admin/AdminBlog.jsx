import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";
import { compressImage, ALLOWED_IMAGE_TYPES, storageNameFromUrl, randomFileName } from "../../lib/imageUtils";

const BUCKET = "blog-images";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const emptyPost = { title: "", slug: "", excerpt: "", content: "", featured_image: "", is_published: false };

const labelStyle = { fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "6px" };
const inputStyle = { width: "100%", padding: "12px 16px", fontFamily: "Inter, sans-serif", fontSize: "14px", border: "1px solid #E5E5E5", borderRadius: "2px", boxSizing: "border-box" };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(emptyPost);
  const [editId, setEditId] = useState(null);
  const [editPost, setEditPost] = useState(null); // the post as it was when opened
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const { data, error: err } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (err) setError(`Couldn't load posts: ${err.message}`);
    else setPosts(data || []);
    setLoading(false);
  }

  // Best effort: remove files from the bucket. Never blocks the UI.
  async function removeFromStorage(urls) {
    const names = urls.map((u) => storageNameFromUrl(u, BUCKET)).filter(Boolean);
    if (!names.length) return;
    const { error: err } = await supabase.storage.from(BUCKET).remove(names);
    if (err) console.error("Storage cleanup failed:", err.message);
  }

  // A cover image uploaded in the editor but never saved
  function discardUnsavedImage() {
    if (showEditor && form.featured_image && form.featured_image !== editPost?.featured_image) {
      removeFromStorage([form.featured_image]);
    }
  }

  function openNew() {
    discardUnsavedImage();
    setError("");
    setForm(emptyPost);
    setEditId(null);
    setEditPost(null);
    setSlugTouched(false);
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(p) {
    discardUnsavedImage();
    setError("");
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || "", content: p.content, featured_image: p.featured_image || "", is_published: p.is_published });
    setEditId(p.id);
    setEditPost(p);
    setSlugTouched(true); // never change the URL of an existing post by accident
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditor() {
    discardUnsavedImage();
    setShowEditor(false);
    setError("");
  }

  // The URL follows the title until she edits the URL herself
  function handleTitleChange(title) {
    setForm((prev) => ({ ...prev, title, slug: slugTouched ? prev.slug : slugify(title) }));
  }

  function handleSlugChange(value) {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(`"${file.name}" isn't a JPG, PNG or WebP image.`);
      return;
    }

    setError("");
    setUploading(true);
    const { blob, ext, type } = await compressImage(file);
    const filename = randomFileName("blog", ext);
    const { error: err } = await supabase.storage.from(BUCKET).upload(filename, blob, { cacheControl: "3600", upsert: false, contentType: type });

    if (err) {
      setError(`Couldn't upload the cover image: ${err.message}`);
    } else {
      // Replacing an unsaved upload: clean up the one we're replacing
      if (form.featured_image && form.featured_image !== editPost?.featured_image) removeFromStorage([form.featured_image]);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      setForm((prev) => ({ ...prev, featured_image: data.publicUrl }));
    }
    setUploading(false);
  }

  function removeImage() {
    if (form.featured_image && form.featured_image !== editPost?.featured_image) removeFromStorage([form.featured_image]);
    setForm((prev) => ({ ...prev, featured_image: "" }));
  }

  async function save() {
    const cleanSlug = slugify(form.slug);
    if (!form.title.trim()) { setError("Add a title."); return; }
    if (!cleanSlug) { setError("Add a URL for the post (letters, numbers and dashes)."); return; }
    if (!form.content.trim()) { setError("Write the article before saving."); return; }

    setSaving(true);
    setError("");
    const now = new Date().toISOString();
    const payload = {
      title: form.title.trim(),
      slug: cleanSlug,
      excerpt: form.excerpt.trim(),
      content: form.content,
      featured_image: form.featured_image,
      is_published: form.is_published,
      updated_at: now,
      // keep the original publish date when editing a post that's already live
      published_at: form.is_published ? (editPost?.published_at || now) : null,
    };

    const query = editId
      ? supabase.from("blog_posts").update(payload).eq("id", editId)
      : supabase.from("blog_posts").insert(payload);
    // .select("id") lets us detect "0 rows changed" (e.g. blocked by RLS), which Supabase doesn't report as an error
    const { data, error: err } = await query.select("id");

    if (err || !data?.length) {
      const msg = err?.code === "23505"
        ? "Another post already uses that URL. Change the URL and save again."
        : `Couldn't save the post: ${err?.message || "no changes were saved (check permissions)"}`;
      setError(msg);
      setSaving(false);
      return; // keep the editor open so nothing she typed is lost
    }

    // The old cover image is safe to delete now that the new one is saved
    if (editPost?.featured_image && editPost.featured_image !== form.featured_image) removeFromStorage([editPost.featured_image]);
    await fetchPosts();
    setShowEditor(false);
    setSaving(false);
  }

  async function togglePublish(p) {
    if (busyId) return;
    setBusyId(p.id);
    setError("");
    const { data, error: err } = await supabase
      .from("blog_posts")
      .update({
        is_published: !p.is_published,
        published_at: !p.is_published ? (p.published_at || new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", p.id)
      .select("id");
    if (err || !data?.length) setError(`Couldn't update "${p.title}": ${err?.message || "no changes were saved (check permissions)"}`);
    await fetchPosts();
    setBusyId(null);
  }

  async function deletePost(p) {
    if (busyId) return;
    if (!confirm(`Delete "${p.title}"? This cannot be undone. (Unpublish hides it from the site without deleting.)`)) return;
    setBusyId(p.id);
    setError("");
    const { data, error: err } = await supabase.from("blog_posts").delete().eq("id", p.id).select("id");
    if (err || !data?.length) setError(`Couldn't delete "${p.title}": ${err?.message || "nothing was deleted (check permissions)"}`);
    else removeFromStorage([p.featured_image]);
    await fetchPosts();
    setBusyId(null);
  }

  const canSave = form.title.trim() && form.slug.trim() && form.content.trim();

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: 0 }}>Blog</h1>
          {!showEditor && (
            <button onClick={openNew} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 20px" }}>
              + New Post
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontFamily: "Inter, sans-serif", fontSize: "13px", padding: "12px 16px", borderRadius: "2px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {showEditor && (
          <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", fontWeight: 400, margin: "0 0 24px" }}>{editId ? "Edit Post" : "New Post"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} style={inputStyle} placeholder="Post title" />
              </div>
              <div>
                <label style={labelStyle}>Page URL *</label>
                <input value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} style={{ ...inputStyle, color: "#B8973A" }} placeholder="post-url-slug" />
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B6B6B", margin: "4px 0 0" }}>
                  Appears as /blog/{slugify(form.slug) || "post-url-slug"}. Filled in from the title for new posts.
                </p>
              </div>
              <div>
                <label style={labelStyle}>Excerpt (short description)</label>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} maxLength={200} style={{ ...inputStyle, resize: "vertical" }} placeholder="Brief summary shown on the blog page..." />
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6B6B6B", margin: "4px 0 0", textAlign: "right" }}>{form.excerpt.length}/200</p>
              </div>

              <div>
                <label style={labelStyle}>Cover Image</label>
                {form.featured_image && (
                  <div style={{ position: "relative", width: "160px", marginBottom: "12px" }}>
                    <img src={form.featured_image} alt="Cover" style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: "2px", border: "1px solid #E5E5E5", display: "block" }} />
                    <button onClick={removeImage} aria-label="Remove cover image" style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", background: "#DC2626", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ✕
                    </button>
                  </div>
                )}
                <label style={{ display: "inline-block", background: "#F5F5F5", border: "2px dashed #E5E5E5", borderRadius: "4px", padding: "14px 24px", cursor: uploading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "13px", color: uploading ? "#B8973A" : "#6B6B6B" }}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: "none" }} />
                  {uploading ? "Uploading..." : form.featured_image ? "Replace image" : "Upload cover image"}
                </label>
              </div>

              <div>
                <label style={labelStyle}>Content *</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={16} style={{ ...inputStyle, padding: "16px", lineHeight: 1.8, resize: "vertical" }} placeholder="Write your article here. Separate paragraphs with a blank line." />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#1A1A1A" }}>
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                Published (visible on the blog page)
              </label>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
              <button onClick={save} disabled={saving || uploading || !canSave} style={{ background: "#B8973A", color: "#FAF8F3", border: "none", cursor: (saving || uploading || !canSave) ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 28px", opacity: (saving || uploading || !canSave) ? 0.5 : 1 }}>
                {saving ? "Saving..." : editId ? "Update Post" : "Save Post"}
              </button>
              <button onClick={cancelEditor} style={{ background: "none", border: "1px solid #E5E5E5", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 28px", color: "#6B6B6B" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
          {loading ? <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p> :
            posts.length === 0 ? <p style={{ padding: "32px", color: "#6B6B6B", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>No posts yet. Click "New Post" to write your first one.</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                  {["Title", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B6B6B", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F0F0F0", opacity: busyId === p.id ? 0.5 : 1 }}>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0F0F0F", margin: "0 0 2px" }}>{p.title}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#B8973A", margin: 0 }}>/blog/{p.slug}</p>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", textTransform: "uppercase", background: p.is_published ? "#16A34A20" : "#6B6B6B20", color: p.is_published ? "#16A34A" : "#6B6B6B", padding: "4px 10px", borderRadius: "999px" }}>
                        {p.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", whiteSpace: "nowrap" }}>{fmtDate(p.created_at)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <button onClick={() => openEdit(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Edit</button>
                        {p.is_published && (
                          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#2563EB", textDecoration: "none" }}>View on site</a>
                        )}
                        <button onClick={() => togglePublish(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: p.is_published ? "#D97706" : "#16A34A", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          {p.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button onClick={() => deletePost(p)} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Delete</button>
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

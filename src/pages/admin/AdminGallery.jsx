import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../lib/supabase";
import { compressImage, ALLOWED_IMAGE_TYPES, randomFileName } from "../../lib/imageUtils";

const BUCKET = "gallery-images";

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchPhotos(); }, []);

  async function fetchPhotos() {
    const { data, error: err } = await supabase.storage.from(BUCKET).list("", {
      limit: 1000,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (err) {
      setError(`Couldn't load the gallery: ${err.message}`);
    } else {
      setPhotos(
        (data || [])
          .filter((f) => f.name !== ".emptyFolderPlaceholder")
          .map((f) => ({
            name: f.name,
            url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
          }))
      );
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    e.target.value = "";
    if (!files.length) return;

    const badType = files.find((f) => !ALLOWED_IMAGE_TYPES.includes(f.type));
    if (badType) {
      setError(`"${badType.name}" isn't a JPG, PNG or WebP image.`);
      return;
    }

    setError("");
    setUploading(true);
    const failed = [];

    for (let i = 0; i < files.length; i++) {
      setProgress(`Uploading ${i + 1} of ${files.length}...`);
      const file = files[i];
      const { blob, ext, type } = await compressImage(file);
      const { error: err } = await supabase.storage
        .from(BUCKET)
        .upload(randomFileName("gallery", ext), blob, { cacheControl: "3600", upsert: false, contentType: type });
      if (err) {
        failed.push(file.name);
        console.error("Upload failed:", err.message);
      }
    }

    await fetchPhotos();
    if (failed.length) setError(`Couldn't upload: ${failed.join(", ")}. Please try again.`);
    setUploading(false);
    setProgress("");
  }

  async function handleDelete(name) {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setDeleting(name);
    setError("");
    // Storage reports a blocked delete (permissions) as an empty result, not an error
    const { data, error: err } = await supabase.storage.from(BUCKET).remove([name]);
    if (err || !data?.length) setError(`Couldn't delete the photo: ${err?.message || "nothing was deleted (check permissions)"}`);
    await fetchPhotos();
    setDeleting(null);
  }

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 4px" }}>Gallery</h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6B6B6B", margin: 0 }}>
              {photos.length} photo{photos.length !== 1 ? "s" : ""} — client looks and editorial shots
            </p>
          </div>

          <label style={{ display: "inline-block", background: "#B8973A", color: "#FAF8F3", cursor: uploading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 20px", opacity: uploading ? 0.7 : 1 }}>
            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
            {uploading ? progress : "+ Upload Photos"}
          </label>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontFamily: "Inter, sans-serif", fontSize: "13px", padding: "12px 16px", borderRadius: "2px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#6B6B6B", fontFamily: "Inter, sans-serif" }}>Loading...</p>
        ) : photos.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "4px", padding: "64px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#6B6B6B", fontStyle: "italic", margin: "0 0 8px" }}>No gallery photos yet</p>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#B8973A", margin: 0 }}>Click "Upload Photos" to add client looks</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }} className="gallery-admin-grid">
            {photos.map((photo) => (
              <div key={photo.name} style={{ position: "relative", background: "#F0EDE6", borderRadius: "2px", overflow: "hidden", opacity: deleting === photo.name ? 0.5 : 1 }}>
                <img
                  src={photo.url}
                  alt="Client in a Mo_FashionForge piece"
                  loading="lazy"
                  style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
                />
                <button
                  onClick={() => handleDelete(photo.name)}
                  disabled={deleting === photo.name}
                  aria-label="Delete photo"
                  style={{
                    position: "absolute", top: "8px", right: "8px",
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "#DC2626", color: "#fff", border: "none",
                    cursor: "pointer", fontSize: "14px", lineHeight: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "24px", padding: "16px 20px", background: "#FEF9EC", border: "1px solid rgba(184,151,58,0.3)", borderRadius: "4px" }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#92700A", margin: 0, lineHeight: 1.7 }}>
            <strong>Note:</strong> Photos uploaded here appear in the <strong>Client Photos</strong> tab on the public Gallery page automatically.
            For best results, upload square or portrait photos of clients wearing Mo_FashionForge pieces.
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) { .gallery-admin-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </AdminLayout>
  );
}

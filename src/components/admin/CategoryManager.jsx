import { useState } from "react";
import { supabase } from "../../lib/supabase";

const slugify = (name) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const font = { fontFamily: "Inter, sans-serif" };
const inputStyle = { ...font, flex: 1, minWidth: "180px", padding: "10px 12px", fontSize: "13px", border: "1px solid #E5E5E5", borderRadius: "2px", background: "#fff" };
const smallBtn = { ...font, fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", padding: "7px 12px", border: "1px solid #E5E5E5", background: "#fff", color: "#0F0F0F", cursor: "pointer", borderRadius: "2px" };

export default function CategoryManager({ categories, products, onChanged }) {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState(null); // category with products that is waiting for "move to" choice
  const [moveTo, setMoveTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const countFor = (slug) => products.filter((p) => p.category === slug).length;
  const nameTaken = (name, exceptId) =>
    categories.some((c) => c.id !== exceptId && c.name.trim().toLowerCase() === name.trim().toLowerCase());

  async function addCategory(e) {
    e.preventDefault();
    if (busy) return;
    const name = newName.trim();
    const slug = slugify(name);
    if (!slug) { setError("Enter a category name (letters or numbers)."); return; }
    if (nameTaken(name) || categories.some((c) => c.slug === slug)) {
      setError(`"${name}" already exists.`);
      return;
    }
    setBusy(true);
    setError("");
    const nextOrder = categories.reduce((max, c) => Math.max(max, c.sort_order || 0), 0) + 1;
    const { data, error: err } = await supabase
      .from("categories")
      .insert({ name, slug, sort_order: nextOrder })
      .select("id");
    if (err || !data?.length) {
      setError(`Couldn't add the category: ${err?.message || "nothing was saved (check permissions)"}`);
    } else {
      setNewName("");
      await onChanged();
    }
    setBusy(false);
  }

  async function saveName(c) {
    if (busy) return;
    const name = editName.trim();
    if (!name) { setError("The name can't be empty."); return; }
    if (nameTaken(name, c.id)) { setError(`"${name}" already exists.`); return; }
    setBusy(true);
    setError("");
    const { data, error: err } = await supabase.from("categories").update({ name }).eq("id", c.id).select("id");
    if (err || !data?.length) {
      setError(`Couldn't rename it: ${err?.message || "nothing was saved (check permissions)"}`);
    } else {
      setEditId(null);
      await onChanged();
    }
    setBusy(false);
  }

  async function reorder(c, dir) {
    if (busy) return;
    const idx = categories.findIndex((x) => x.id === c.id);
    if (idx + dir < 0 || idx + dir >= categories.length) return;
    setBusy(true);
    setError("");
    // swap the two in the list, then number everything 1..n so ties can never happen
    const list = [...categories];
    [list[idx], list[idx + dir]] = [list[idx + dir], list[idx]];
    const changes = list
      .map((cat, i) => ({ cat, order: i + 1 }))
      .filter(({ cat, order }) => cat.sort_order !== order);
    const results = await Promise.all(
      changes.map(({ cat, order }) =>
        supabase.from("categories").update({ sort_order: order }).eq("id", cat.id).select("id")
      )
    );
    const failed = results.find((r) => r.error || !r.data?.length);
    if (failed) {
      setError(`Couldn't save the new order: ${failed.error?.message || "nothing was saved (check permissions)"}`);
    }
    await onChanged();
    setBusy(false);
  }

  function startDelete(c) {
    setError("");
    const n = countFor(c.slug);
    if (n === 0) {
      if (confirm(`Delete the category "${c.name}"?`)) doDelete(c, null);
      return;
    }
    const others = categories.filter((x) => x.id !== c.id);
    if (!others.length) {
      setError(`"${c.name}" has ${n} product${n > 1 ? "s" : ""} and there's no other category to move them to. Add another category first.`);
      return;
    }
    setDeleting(c);
    setMoveTo(others[0].slug);
  }

  async function doDelete(c, targetSlug) {
    if (busy) return;
    setBusy(true);
    setError("");

    if (targetSlug) {
      const expected = countFor(c.slug);
      const { data, error: err } = await supabase
        .from("products")
        .update({ category: targetSlug, updated_at: new Date().toISOString() })
        .eq("category", c.slug)
        .select("id");
      if (err || (data?.length || 0) < expected) {
        setError(`Couldn't move the products, so "${c.name}" was not deleted${err ? `: ${err.message}` : " (check permissions)"}.`);
        await onChanged();
        setBusy(false);
        return;
      }
    }

    const { data, error: err } = await supabase.from("categories").delete().eq("id", c.id).select("id");
    if (err || !data?.length) {
      setError(`Couldn't delete "${c.name}": ${err?.message || "nothing was deleted (check permissions)"}`);
    } else {
      setDeleting(null);
    }
    await onChanged();
    setBusy(false);
  }

  return (
    <div style={{ background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", marginBottom: "24px" }}>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400, margin: "0 0 6px" }}>Categories</h2>
      <p style={{ ...font, fontSize: "13px", color: "#6B6B6B", margin: "0 0 20px", lineHeight: 1.6 }}>
        These are the tabs on the shop page, in this order. Renaming a category never moves its products. A category only shows in the shop once it has at least one active product.
      </p>

      {error && (
        <div role="alert" style={{ ...font, background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", padding: "10px 14px", borderRadius: "2px", marginBottom: "16px", fontSize: "13px", display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "#B91C1C", padding: 0 }}>✕</button>
        </div>
      )}

      {categories.length === 0 && (
        <p style={{ ...font, fontSize: "13px", color: "#6B6B6B", margin: "0 0 16px" }}>No categories yet. Add your first one below.</p>
      )}

      <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0 }}>
        {categories.map((c, i) => {
          const n = countFor(c.slug);
          const editing = editId === c.id;
          return (
            <li key={c.id} style={{ borderBottom: "1px solid #F0F0F0", padding: "12px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {editing ? (
                  <>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveName(c); if (e.key === "Escape") setEditId(null); }} style={inputStyle} autoFocus />
                    <button onClick={() => saveName(c)} disabled={busy} style={{ ...smallBtn, background: "#B8973A", borderColor: "#B8973A", color: "#FAF8F3" }}>Save</button>
                    <button onClick={() => setEditId(null)} style={smallBtn}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ ...font, fontSize: "14px", color: "#0F0F0F", flex: 1, minWidth: "140px" }}>
                      {c.name} <span style={{ color: "#6B6B6B", fontSize: "12px" }}>· {n} product{n === 1 ? "" : "s"}</span>
                    </span>
                    <button onClick={() => reorder(c, -1)} disabled={busy || i === 0} aria-label={`Move ${c.name} up`} style={{ ...smallBtn, opacity: i === 0 ? 0.4 : 1 }}>↑</button>
                    <button onClick={() => reorder(c, 1)} disabled={busy || i === categories.length - 1} aria-label={`Move ${c.name} down`} style={{ ...smallBtn, opacity: i === categories.length - 1 ? 0.4 : 1 }}>↓</button>
                    <button onClick={() => { setEditId(c.id); setEditName(c.name); setError(""); }} style={smallBtn}>Rename</button>
                    <button onClick={() => startDelete(c)} disabled={busy} style={{ ...smallBtn, color: "#DC2626", borderColor: "#FECACA" }}>Delete</button>
                  </>
                )}
              </div>

              {deleting?.id === c.id && (
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "2px", padding: "14px", marginTop: "12px" }}>
                  <p style={{ ...font, fontSize: "13px", color: "#92400E", margin: "0 0 10px", lineHeight: 1.6 }}>
                    {countFor(c.slug)} product{countFor(c.slug) === 1 ? " is" : "s are"} in "{c.name}". Move {countFor(c.slug) === 1 ? "it" : "them"} to:
                  </p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} style={inputStyle}>
                      {categories.filter((x) => x.id !== c.id).map((x) => (
                        <option key={x.id} value={x.slug}>{x.name}</option>
                      ))}
                    </select>
                    <button onClick={() => doDelete(c, moveTo)} disabled={busy} style={{ ...smallBtn, background: "#DC2626", borderColor: "#DC2626", color: "#fff" }}>
                      {busy ? "Working..." : "Move and delete"}
                    </button>
                    <button onClick={() => setDeleting(null)} style={smallBtn}>Cancel</button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={addCategory} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category, e.g. Skirts" style={inputStyle} aria-label="New category name" />
        <button type="submit" disabled={busy || !newName.trim()} style={{ ...smallBtn, background: "#0F0F0F", borderColor: "#0F0F0F", color: "#FAF8F3", opacity: busy || !newName.trim() ? 0.6 : 1 }}>
          Add category
        </button>
      </form>
    </div>
  );
}

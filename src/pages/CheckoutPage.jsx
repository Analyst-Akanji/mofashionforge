import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { compressImage } from "../lib/compressImage";
import { BUSINESS } from "../content/policyContent";
import { BANK, CHECKOUT } from "../content/paymentDetails";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

const heading = { fontFamily: "Cormorant Garamond, serif", fontWeight: 400, color: "#0F0F0F" };
const labelStyle = { fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B", display: "block", marginBottom: "8px" };
const inputStyle = { width: "100%", background: "#fff", border: "1px solid #D9D5CB", color: "#0F0F0F", fontFamily: "Inter, sans-serif", fontSize: "14px", padding: "14px 16px", outline: "none", borderRadius: "2px", boxSizing: "border-box" };
const card = { background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "2px", padding: "28px", marginBottom: "24px" };
const bodyText = { fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", lineHeight: 1.7 };

const fmt = (kobo) => `₦${(Number(kobo || 0) / 100).toLocaleString("en-NG")}`;
const makeOrderRef = () =>
  `MFF-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

function DetailRow({ label, value, onCopy, copied }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(250,248,243,0.1)", flexWrap: "wrap" }}>
      <div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.5)", margin: "0 0 4px" }}>{label}</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#FAF8F3", margin: 0, fontWeight: 500 }}>{value}</p>
      </div>
      {onCopy && (
        <button type="button" onClick={onCopy}
          style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "1px solid #B8973A", color: "#B8973A", padding: "8px 14px", cursor: "pointer", borderRadius: "2px" }}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, setQty, removeItem, clear } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [done, setDone] = useState(null); // { orderRef, total }

  const paymentReady = Boolean(BANK.accountNumber);

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard blocked - the number is still visible to copy by hand */
    }
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Please upload your receipt as a JPG, PNG, WebP or PDF file.");
      return;
    }
    setError("");
    setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving || !items.length) return;
    setError("");

    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone / WhatsApp number.");
      return;
    }
    if (!file) {
      setError("Please upload your payment receipt.");
      return;
    }

    setSaving(true);
    const orderRef = makeOrderRef();

    // 1) Upload the receipt (private bucket)
    const { blob, ext, type } = await compressImage(file, { maxSize: 2000, quality: 0.9, minBytes: 1.5 * 1024 * 1024 });
    if (blob.size > MAX_RECEIPT_BYTES) {
      setError("That receipt file is too large (max 5 MB). Please upload a smaller one or a screenshot.");
      setSaving(false);
      return;
    }
    const receiptPath = `${orderRef}/receipt-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("receipts")
      .upload(receiptPath, blob, { contentType: type, upsert: false });
    if (uploadErr) {
      console.error("Receipt upload failed:", uploadErr.message);
      setError("We couldn't upload your receipt. Please check your connection and try again.");
      setSaving(false);
      return;
    }

    // 2) Create the order
    const { error: orderErr } = await supabase.from("orders").insert({
      order_ref: orderRef,
      customer_name: form.name.trim(),
      customer_email: form.email.trim(),
      customer_phone: form.phone.trim(),
      delivery_address: form.address.trim(),
      customer_notes: form.notes.trim() || null,
      items: items.map(({ id, name, price, qty }) => ({ product_id: id, name, price, qty })),
      subtotal: total, // kobo, same as total (delivery fee is confirmed separately)
      total,
      status: "pending",
      receipt_path: receiptPath,
    });
    if (orderErr) {
      console.error("Order insert failed:", orderErr.message);
      setError(`We couldn't place your order. Please try again, or send your receipt to Morayo on WhatsApp (${BUSINESS.whatsapp}).`);
      setSaving(false);
      return;
    }

    setDone({ orderRef, total });
    clear();
    setSaving(false);
  }

  // ── Confirmation ──
  if (done) {
    const waText = encodeURIComponent(`Hi Morayo, I've placed order ${done.orderRef} and uploaded my payment receipt.`);
    return (
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        <div style={{ maxWidth: "620px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <span className="section-label">Order received</span>
          <h1 style={{ ...heading, fontSize: "clamp(2rem, 5vw, 3rem)", margin: "16px 0 12px" }}>Thank you!</h1>
          <p style={{ ...bodyText, margin: "0 0 24px" }}>
            Your order <strong style={{ color: "#0F0F0F" }}>{done.orderRef}</strong> ({fmt(done.total)}) is in. Morayo will check your payment and confirm {CHECKOUT.verificationTime} by WhatsApp or email.
          </p>
          <p style={{ ...bodyText, margin: "0 0 32px" }}>We're also emailing a confirmation to {form.email}. If it doesn't arrive in a few minutes, check your spam folder. Please keep your order reference handy in case you need to reach us.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`${BUSINESS.whatsappUrl}?text=${waText}`} target="_blank" rel="noreferrer"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#0F0F0F", color: "#FAF8F3", padding: "14px 22px", textDecoration: "none" }}>
              Message Morayo
            </a>
            <Link to="/shop"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid #0F0F0F", color: "#0F0F0F", padding: "14px 22px", textDecoration: "none" }}>
              Back to shop
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // ── Empty cart ──
  if (!items.length) {
    return (
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
          <h1 style={{ ...heading, fontSize: "2.2rem", margin: "0 0 12px" }}>Your cart is empty</h1>
          <p style={{ ...bodyText, margin: "0 0 28px" }}>Pick a piece from the shop and it will show up here.</p>
          <Link to="/shop"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", background: "#B8973A", color: "#FAF8F3", padding: "16px 32px", textDecoration: "none", display: "inline-block" }}>
            Browse the shop
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const textField = (name, label, type = "text") => (
    <div key={name}>
      <label htmlFor={`f-${name}`} style={labelStyle}>{label}</label>
      <input id={`f-${name}`} type={type} required value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })} style={inputStyle} />
    </div>
  );

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
      <div style={{ background: "#3B4A3E", padding: "56px 24px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <span className="section-label">Checkout</span>
          <h1 style={{ ...heading, color: "#FAF8F3", fontSize: "clamp(2rem, 5vw, 3rem)", margin: "12px 0 0" }}>Complete your order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 64px" }}>
        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "40px", alignItems: "start" }}>
          {/* LEFT: details, payment, receipt */}
          <div>
            <div style={card}>
              <h2 style={{ ...heading, fontSize: "1.5rem", margin: "0 0 20px" }}>1. Your details</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {textField("name", "Full name *")}
                {textField("email", "Email address *", "email")}
                {textField("phone", "Phone / WhatsApp number *", "tel")}
                <div>
                  <label htmlFor="f-address" style={labelStyle}>Delivery address *</label>
                  <textarea id="f-address" required rows={3} value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div>
                  <label htmlFor="f-notes" style={labelStyle}>Size, colour or other notes</label>
                  <textarea id="f-notes" rows={3} value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Your size or measurements, preferred colours, anything Morayo should know..."
                    style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              </div>
            </div>

            <div style={card}>
              <h2 style={{ ...heading, fontSize: "1.5rem", margin: "0 0 8px" }}>2. Pay by bank transfer</h2>
              <p style={{ ...bodyText, margin: "0 0 20px" }}>
                Transfer exactly <strong style={{ color: "#0F0F0F" }}>{fmt(total)}</strong> to the account below, then upload your receipt in step 3.
              </p>
              {paymentReady ? (
                <div style={{ background: "#0F0F0F", padding: "8px 24px", borderRadius: "2px" }}>
                  {BANK.bankName && <DetailRow label="Bank" value={BANK.bankName} />}
                  {BANK.accountName && <DetailRow label="Account name" value={BANK.accountName} />}
                  <DetailRow label="Account number" value={BANK.accountNumber}
                    onCopy={() => copy(BANK.accountNumber, "acct")} copied={copied === "acct"} />
                  <DetailRow label="Amount to send" value={fmt(total)}
                    onCopy={() => copy(String(total / 100), "amt")} copied={copied === "amt"} />
                </div>
              ) : (
                <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", padding: "16px", borderRadius: "2px" }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#92400E", margin: "0 0 10px" }}>
                    Payment details aren't available online yet. Please message Morayo on WhatsApp to complete your order.
                  </p>
                  <a href={BUSINESS.whatsappUrl} target="_blank" rel="noreferrer"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#92400E" }}>
                    Chat on WhatsApp →
                  </a>
                </div>
              )}
              <p style={{ ...bodyText, fontSize: "13px", margin: "16px 0 0" }}>{CHECKOUT.deliveryNote}</p>
            </div>

            <div style={card}>
              <h2 style={{ ...heading, fontSize: "1.5rem", margin: "0 0 8px" }}>3. Upload your receipt</h2>
              <p style={{ ...bodyText, margin: "0 0 16px" }}>A screenshot or PDF of your transfer confirmation (JPG, PNG, WebP or PDF, up to 5 MB).</p>
              <label htmlFor="f-receipt"
                style={{ display: "block", border: "1px dashed #B8973A", padding: "24px", textAlign: "center", cursor: "pointer", borderRadius: "2px", background: "#FAF8F3", fontFamily: "Inter, sans-serif", fontSize: "13px", color: file ? "#0F0F0F" : "#6B6B6B" }}>
                {file ? `✓ ${file.name} (tap to change)` : "Tap to choose your receipt"}
              </label>
              <input id="f-receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFile} style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, overflow: "hidden" }} />
            </div>

            {error && (
              <p role="alert" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#B91C1C", background: "#FEF2F2", border: "1px solid #FECACA", padding: "12px 16px", borderRadius: "2px", margin: "0 0 16px" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={saving || !paymentReady}
              style={{ width: "100%", background: "#B8973A", color: "#FAF8F3", border: "none", fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "18px 32px", cursor: saving || !paymentReady ? "not-allowed" : "pointer", opacity: saving || !paymentReady ? 0.6 : 1 }}>
              {saving ? "Submitting..." : "Submit order & receipt"}
            </button>
          </div>

          {/* RIGHT: order summary */}
          <aside className="checkout-summary" style={{ ...card, marginBottom: 0, position: "sticky", top: "96px" }}>
            <h2 style={{ ...heading, fontSize: "1.5rem", margin: "0 0 20px" }}>Order summary</h2>
            {items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: "14px", padding: "14px 0", borderBottom: "1px solid #F0EDE6" }}>
                {item.image && (
                  <img src={item.image} alt={item.name} style={{ width: "64px", height: "80px", objectFit: "cover", borderRadius: "2px", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...heading, fontSize: "1.05rem", margin: "0 0 4px" }}>{item.name}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#3B4A3E", margin: "0 0 10px" }}>{fmt(item.price)}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button type="button" aria-label={`Decrease quantity of ${item.name}`} onClick={() => setQty(item.id, item.qty - 1)} disabled={item.qty <= 1}
                      style={{ width: "28px", height: "28px", border: "1px solid #D9D5CB", background: "#fff", cursor: item.qty <= 1 ? "not-allowed" : "pointer", borderRadius: "2px" }}>−</button>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", minWidth: "16px", textAlign: "center" }}>{item.qty}</span>
                    <button type="button" aria-label={`Increase quantity of ${item.name}`} onClick={() => setQty(item.id, item.qty + 1)}
                      style={{ width: "28px", height: "28px", border: "1px solid #D9D5CB", background: "#fff", cursor: "pointer", borderRadius: "2px" }}>+</button>
                    <button type="button" onClick={() => removeItem(item.id)}
                      style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#DC2626", padding: 0 }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "20px" }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B6B6B" }}>Total to pay</span>
              <span style={{ ...heading, fontSize: "1.8rem", fontWeight: 500, color: "#3B4A3E" }}>{fmt(total)}</span>
            </div>
            <p style={{ ...bodyText, fontSize: "12px", margin: "10px 0 0" }}>Made to order. Allow 5–9 working days after your payment is confirmed.</p>
          </aside>
        </div>
      </form>

      <Footer />
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { BUSINESS } from "../content/policyContent";

const heading = { fontFamily: "Cormorant Garamond, serif", fontWeight: 400, color: "#0F0F0F" };
const bodyText = { fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", lineHeight: 1.7 };
const btn = { fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "14px 22px", textDecoration: "none", display: "inline-block" };

// Route: /checkout/success  (paystack-init sends customers here after payment)
export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";
  const { clear } = useCart();
  const [phase, setPhase] = useState("checking"); // checking | paid | failed | unknown
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!reference) { setPhase("unknown"); return; }

    (async () => {
      const { data, error } = await supabase.functions.invoke("paystack-verify", { body: { reference } });
      if (error || !data) { setPhase("unknown"); return; }
      if (data.paid) {
        clear();
        setPhase("paid");
      } else if (data.status === "abandoned" || data.status === "failed") {
        setPhase("failed");
      } else {
        setPhase("unknown"); // pending / not found yet - the webhook will still settle it
      }
    })();
  }, [reference, clear]);

  const waText = encodeURIComponent(`Hi Morayo, I just paid for order ${reference}.`);
  const waLink = (
    <a href={`${BUSINESS.whatsappUrl}?text=${waText}`} target="_blank" rel="noreferrer"
      style={{ ...btn, background: "#0F0F0F", color: "#FAF8F3" }}>Message Morayo</a>
  );

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        {phase === "checking" && (
          <>
            <h1 style={{ ...heading, fontSize: "2.2rem", margin: "0 0 12px" }}>Confirming your payment…</h1>
            <p style={bodyText}>Please don't close this page.</p>
          </>
        )}

        {phase === "paid" && (
          <>
            <span className="section-label">Payment received</span>
            <h1 style={{ ...heading, fontSize: "clamp(2rem, 5vw, 3rem)", margin: "16px 0 12px" }}>Thank you!</h1>
            <p style={{ ...bodyText, margin: "0 0 24px" }}>
              Your payment for order <strong style={{ color: "#0F0F0F" }}>{reference}</strong> went through. Morayo will be in touch by WhatsApp or email about your order. Please keep your order reference handy.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {waLink}
              <Link to="/shop" style={{ ...btn, border: "1px solid #0F0F0F", color: "#0F0F0F" }}>Back to shop</Link>
            </div>
          </>
        )}

        {phase === "failed" && (
          <>
            <h1 style={{ ...heading, fontSize: "2.2rem", margin: "0 0 12px" }}>Payment not completed</h1>
            <p style={{ ...bodyText, margin: "0 0 24px" }}>No money was taken. Your cart is still saved, so you can try again.</p>
            <Link to="/checkout" style={{ ...btn, background: "#B8973A", color: "#FAF8F3" }}>Back to checkout</Link>
          </>
        )}

        {phase === "unknown" && (
          <>
            <h1 style={{ ...heading, fontSize: "2.2rem", margin: "0 0 12px" }}>We're still confirming your payment</h1>
            <p style={{ ...bodyText, margin: "0 0 24px" }}>
              If you were charged, your order will be confirmed shortly. If you don't hear from us, message Morayo with your order reference{reference ? ` (${reference})` : ""}.
            </p>
            {waLink}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}

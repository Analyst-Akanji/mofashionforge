import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { BUSINESS } from "../content/policyContent";

const heading = { fontFamily: "Cormorant Garamond, serif", fontWeight: 400, color: "#0F0F0F" };
const bodyText = { fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", lineHeight: 1.7 };
const btnDark = { fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#0F0F0F", color: "#FAF8F3", padding: "14px 22px", textDecoration: "none", border: "none", cursor: "pointer" };
const btnLight = { fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid #0F0F0F", color: "#0F0F0F", padding: "14px 22px", textDecoration: "none", background: "none", cursor: "pointer" };

const MAX_CHECKS = 5;

// Paystack sends the customer here with ?reference=... after they pay (or cancel).
export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref") || "";
  const { clear } = useCart();
  const [state, setState] = useState(reference ? "checking" : "missing"); // checking | paid | failed | waiting | missing
  const [round, setRound] = useState(0); // bump to check again
  const checks = useRef(0);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer;
    checks.current = 0;
    setState("checking");

    async function check() {
      checks.current += 1;
      const { data, error } = await supabase.functions.invoke("paystack-verify", { body: { reference } });
      if (cancelled) return;

      if (!error && data?.paid) {
        clear(); // only now is the cart emptied
        setState("paid");
        return;
      }
      if (!error && ["failed", "abandoned", "reversed"].includes(data?.status)) {
        setState("failed");
        return;
      }
      // still processing (bank transfers can take a moment), or a temporary network problem
      if (checks.current < MAX_CHECKS) {
        timer = setTimeout(check, 3000);
        return;
      }
      setState("waiting");
    }

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reference, round, clear]);

  const waText = encodeURIComponent(`Hi Morayo, about my order ${reference}.`);
  const whatsapp = (
    <a href={`${BUSINESS.whatsappUrl}?text=${waText}`} target="_blank" rel="noreferrer" style={btnDark}>
      Message Morayo
    </a>
  );

  let content;
  if (state === "checking") {
    content = (
      <>
        <span className="section-label">One moment</span>
        <h1 style={{ ...heading, fontSize: "clamp(2rem, 5vw, 3rem)", margin: "16px 0 12px" }}>Confirming your payment...</h1>
        <p style={bodyText}>Please don't close this page.</p>
      </>
    );
  } else if (state === "paid") {
    content = (
      <>
        <span className="section-label">Payment received</span>
        <h1 style={{ ...heading, fontSize: "clamp(2rem, 5vw, 3rem)", margin: "16px 0 12px" }}>Thank you!</h1>
        <p style={{ ...bodyText, margin: "0 0 24px" }}>
          Your order <strong style={{ color: "#0F0F0F" }}>{reference}</strong> is confirmed and paid. Morayo will start making your piece and keep you updated by WhatsApp or email.
        </p>
        <p style={{ ...bodyText, margin: "0 0 32px" }}>Please keep your order reference handy in case you need to reach us.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {whatsapp}
          <Link to="/shop" style={btnLight}>Back to shop</Link>
        </div>
      </>
    );
  } else if (state === "failed") {
    content = (
      <>
        <span className="section-label">Payment not completed</span>
        <h1 style={{ ...heading, fontSize: "clamp(2rem, 5vw, 3rem)", margin: "16px 0 12px" }}>That didn't go through</h1>
        <p style={{ ...bodyText, margin: "0 0 32px" }}>
          Your payment wasn't completed, and your cart is still saved. You can try again. If you think you were charged, message Morayo with this reference: <strong style={{ color: "#0F0F0F" }}>{reference}</strong>.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/checkout" style={btnDark}>Try again</Link>
          <a href={`${BUSINESS.whatsappUrl}?text=${waText}`} target="_blank" rel="noreferrer" style={btnLight}>Message Morayo</a>
        </div>
      </>
    );
  } else if (state === "waiting") {
    content = (
      <>
        <span className="section-label">Still confirming</span>
        <h1 style={{ ...heading, fontSize: "clamp(2rem, 5vw, 3rem)", margin: "16px 0 12px" }}>We're waiting on your bank</h1>
        <p style={{ ...bodyText, margin: "0 0 32px" }}>
          If you've already paid, you don't need to do anything. We confirm payments automatically and Morayo will message you. Your reference is <strong style={{ color: "#0F0F0F" }}>{reference}</strong>.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setRound((r) => r + 1)} style={btnDark}>Check again</button>
          <a href={`${BUSINESS.whatsappUrl}?text=${waText}`} target="_blank" rel="noreferrer" style={btnLight}>Message Morayo</a>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <h1 style={{ ...heading, fontSize: "clamp(2rem, 5vw, 3rem)", margin: "0 0 12px" }}>No payment to check</h1>
        <p style={{ ...bodyText, margin: "0 0 28px" }}>We couldn't find a payment reference on this page.</p>
        <Link to="/shop" style={btnDark}>Back to shop</Link>
      </>
    );
  }

  return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }} aria-live="polite">
        {content}
      </div>
      <Footer />
    </main>
  );
}

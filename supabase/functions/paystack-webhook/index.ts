// supabase/functions/paystack-webhook/index.ts
//
// Paystack calls this URL by itself when a payment succeeds, even if the customer closed
// their browser. This is the reliable way orders get marked paid.
//
// IMPORTANT: deploy with JWT verification OFF (Paystack doesn't send a Supabase token):
//   supabase functions deploy paystack-webhook --no-verify-jwt
// Security comes from the signature check below instead.

import { createClient } from "npm:@supabase/supabase-js@2";

// Paystack signs the raw body with HMAC-SHA512 using your secret key and sends it in x-paystack-signature
async function validSignature(raw: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.length !== signature.length) return false;
  let diff = 0; // constant-time comparison
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

// deno-lint-ignore no-explicit-any
async function settleOrder(db: any, tx: any) {
  const reference = String(tx?.reference ?? "");
  const { data: order, error } = await db
    .from("orders")
    .select("id, order_ref, total, status, payment_method")
    .eq("order_ref", reference)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order || order.payment_method !== "paystack") return { ok: false, reason: "order_not_found" };
  if (tx.status !== "success") return { ok: false, reason: `payment_${tx.status}` };
  if (tx.currency !== "NGN" || Number(tx.amount) !== Number(order.total)) {
    console.error(`Amount mismatch for ${reference}: paid ${tx.amount} ${tx.currency}, expected ${order.total} NGN`);
    return { ok: false, reason: "amount_mismatch" };
  }
  if (order.status === "cancelled") return { ok: false, reason: "order_cancelled" };
  if (order.status === "pending") {
    const now = new Date().toISOString();
    const { error: uErr } = await db
      .from("orders")
      .update({ status: "paid", payment_ref: reference, paid_at: now, updated_at: now })
      .eq("id", order.id)
      .eq("status", "pending");
    if (uErr) throw new Error(uErr.message);
  }
  return { ok: true, order_ref: order.order_ref };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret) {
    console.error("Missing PAYSTACK_SECRET_KEY secret");
    return new Response("Not configured", { status: 500 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  if (!(await validSignature(raw, signature, secret))) {
    return new Response("Invalid signature", { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (event?.event === "charge.success") {
    try {
      const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const result = await settleOrder(db, event.data);
      if (!result.ok) console.error("Webhook could not settle order:", result.reason, event.data?.reference);
    } catch (e) {
      console.error("Webhook error:", (e as Error).message);
      return new Response("Error", { status: 500 }); // a 500 makes Paystack retry later
    }
  }

  return new Response("ok", { status: 200 });
});

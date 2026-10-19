// supabase/functions/paystack-verify/index.ts
//
// Called by the "payment complete" page when the customer comes back from Paystack.
// It asks Paystack directly whether the payment succeeded (never trusting the browser),
// checks the amount matches the order, and marks the order paid. Safe to call many times.

import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_URL = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");
const ALLOWED_ORIGINS = [SITE_URL, "http://localhost:5173"].filter(Boolean);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : SITE_URL,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed." }, 405);

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret) {
    console.error("Missing PAYSTACK_SECRET_KEY secret");
    return json(req, { error: "Payment checking isn't available right now." }, 500);
  }

  let reference = "";
  try {
    reference = String((await req.json())?.reference ?? "");
  } catch {
    return json(req, { error: "Invalid request." }, 400);
  }
  if (!/^MFF-[A-Z0-9]{8}$/.test(reference)) return json(req, { error: "Invalid reference." }, 400);

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const out = await res.json().catch(() => null);

  if (!res.ok || !out?.data) {
    // Paystack doesn't know this payment yet (e.g. the customer never reached the payment page)
    return json(req, { paid: false, status: "unknown", order_ref: reference });
  }

  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const result = await settleOrder(db, out.data);
    return json(req, { paid: result.ok, status: out.data.status, order_ref: reference });
  } catch (e) {
    console.error("Could not update the order:", (e as Error).message);
    return json(req, { error: "We couldn't confirm your order just now." }, 500);
  }
});

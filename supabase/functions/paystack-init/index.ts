// supabase/functions/paystack-init/index.ts
//
// Starts an online payment. The browser sends the customer's details and the cart
// (product id, size, quantity ONLY). Prices are read from the products table here,
// so nobody can change the amount from the browser. The order is saved as "pending",
// then a Paystack payment link is returned.

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

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function makeOrderRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "MFF-" + Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed." }, 405);

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret || !SITE_URL) {
    console.error("Missing PAYSTACK_SECRET_KEY or SITE_URL secret");
    return json(req, { error: "Online payment isn't available right now." }, 500);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid request." }, 400);
  }

  // ── Customer details ──
  const name = str(body?.customer?.name, 120);
  const email = str(body?.customer?.email, 200);
  const phone = str(body?.customer?.phone, 40);
  const address = str(body?.customer?.address, 600);
  const notes = str(body?.notes, 1000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, "").length < 10 || !address) {
    return json(req, { error: "Please check your name, email, phone number and delivery address." }, 400);
  }

  // ── Cart ──
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (rawItems.length < 1 || rawItems.length > 20) {
    return json(req, { error: "Your cart is empty or too large." }, 400);
  }
  const requested = rawItems.map((i: Record<string, unknown>) => ({
    product_id: str(i?.product_id, 80),
    size: i?.size ? str(i.size, 40) : null,
    qty: Number(i?.qty),
  }));
  if (requested.some((i: { product_id: string; qty: number }) => !i.product_id || !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 10)) {
    return json(req, { error: "Something is wrong with the items in your cart." }, 400);
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const ids = [...new Set(requested.map((i: { product_id: string }) => i.product_id))];
  const { data: products, error: pErr } = await db
    .from("products")
    .select("id, name, price, sizes, is_active")
    .in("id", ids);
  if (pErr) {
    console.error("Could not read products:", pErr.message);
    return json(req, { error: "We couldn't check your cart. Please try again." }, 500);
  }
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  const lines: { product_id: string; size: string | null; name: string; price: number; qty: number }[] = [];
  for (const r of requested) {
    const p = byId.get(r.product_id);
    if (!p || !p.is_active) {
      return json(req, { error: "A piece in your cart is no longer available. Please remove it and try again." }, 400);
    }
    const sizes: string[] = Array.isArray(p.sizes) ? p.sizes : [];
    if (sizes.length > 0 && (!r.size || !sizes.includes(r.size))) {
      return json(req, { error: `Please choose a size for ${p.name}.` }, 400);
    }
    lines.push({
      product_id: p.id,
      size: sizes.length > 0 ? r.size : null,
      name: p.name,
      price: p.price, // kobo, straight from the database
      qty: r.qty,
    });
  }

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  if (!Number.isInteger(total) || total <= 0) {
    return json(req, { error: "We couldn't work out the total for your cart." }, 400);
  }

  // ── Save the order (unpaid until Paystack confirms) ──
  const orderRef = makeOrderRef();
  const { data: order, error: oErr } = await db
    .from("orders")
    .insert({
      order_ref: orderRef,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      delivery_address: address,
      customer_notes: notes || null,
      items: lines,
      subtotal: total,
      total,
      status: "pending",
      payment_method: "paystack",
    })
    .select("id")
    .single();
  if (oErr || !order) {
    console.error("Could not save the order:", oErr?.message);
    return json(req, { error: "We couldn't place your order. Please try again." }, 500);
  }

  // ── Ask Paystack for a payment link ──
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      amount: total, // kobo
      currency: "NGN",
      reference: orderRef,
      callback_url: `${SITE_URL}/checkout/success`,
      metadata: { order_ref: orderRef, customer_name: name, phone },
    }),
  });
  const out = await res.json().catch(() => null);

  if (!res.ok || !out?.status || !out?.data?.authorization_url) {
    console.error("Paystack initialize failed:", res.status, out?.message);
    await db.from("orders").delete().eq("id", order.id); // don't leave an unpayable order behind
    return json(req, { error: "We couldn't start the online payment. Please try again in a moment." }, 502);
  }

  return json(req, { authorization_url: out.data.authorization_url, reference: orderRef });
});

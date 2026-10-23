// Supabase Edge Function: send-order-emails
// Put this file at: supabase/functions/send-order-emails/index.ts
//
// Triggered by a Database Webhook on the `orders` table (events: Insert + Update).
//   INSERT                    -> "order received" email to the customer + "new order" email to Morayo
//   UPDATE status -> 'paid'   -> "payment confirmed" email to the customer
//
// Secrets it needs (Dashboard -> Edge Functions -> Secrets, or `supabase secrets set`):
//   RESEND_API_KEY      API key from resend.com
//   MAIL_FROM           e.g.  Mo_FashionForge <orders@mofashionforge.com>   (domain must be verified in Resend)
//   ADMIN_NOTIFY_EMAIL  where Morayo's "new order" email goes (comma-separate for more than one)
//   SITE_URL            e.g.  https://mofashionforge.com
//   WEBHOOK_SECRET      any long random string; the same value goes in the webhook's x-webhook-secret header
//   VERIFY_WINDOW       optional, defaults to "within 24 hours" (keep in step with src/content/paymentDetails.js)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "";
const ADMIN_NOTIFY_EMAIL = (Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const SITE_URL = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";
const VERIFY_WINDOW = Deno.env.get("VERIFY_WINDOW") ?? "within 24 hours";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Keep these in step with src/content/policyContent.js
const BRAND = "Mo_FashionForge";
const OWNER = "Morayo";
const WHATSAPP_DISPLAY = "+234 818 512 8390";
const WHATSAPP_URL = "https://wa.me/2348185123890";
const PRODUCTION_TIME = "5–9 working days";

type OrderItem = { product_id?: string | number; name: string; price: number; qty: number };
type Order = {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  customer_notes: string | null;
  items: OrderItem[] | null;
  total: number;
  status: string;
  receipt_path: string | null;
  customer_email_sent_at: string | null;
  admin_email_sent_at: string | null;
  paid_email_sent_at: string | null;
};
type Mail = { subject: string; html: string; text: string };

// ── helpers ────────────────────────────────────────────────────────────────

// Everything that came from the customer is escaped before it goes into HTML.
const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const oneLine = (v: unknown) => String(v ?? "").replace(/[\r\n]+/g, " ").trim();
const naira = (kobo: number) => `₦${(Number(kobo || 0) / 100).toLocaleString("en-NG")}`;
const isEmail = (s: unknown) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const firstName = (name: string) => oneLine(name).split(/\s+/)[0] || "there";

// Turns 0803... or +234803... into the digits wa.me expects
function waNumber(phone: string) {
  const d = String(phone ?? "").replace(/\D/g, "");
  if (d.startsWith("234")) return d;
  if (d.startsWith("0")) return "234" + d.slice(1);
  return d;
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// ── email templates ────────────────────────────────────────────────────────

function layout(heading: string, inner: string) {
  return `<!doctype html>
<html><body style="margin:0;background:#FAF8F3;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#0F0F0F;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #E8E4D9;">
    <tr><td style="background:#3B4A3E;padding:22px 28px;font-family:Georgia,serif;font-size:22px;color:#FAF8F3;">${esc(BRAND)}</td></tr>
    <tr><td style="padding:28px;font-size:14px;line-height:1.7;">
      <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:0 0 16px;">${esc(heading)}</h1>
      ${inner}
    </td></tr>
    <tr><td style="padding:16px 28px;border-top:1px solid #E8E4D9;font-size:12px;color:#6B6B6B;">
      Questions? Reply to this email or WhatsApp ${esc(OWNER)} on <a href="${WHATSAPP_URL}" style="color:#B8973A;">${esc(WHATSAPP_DISPLAY)}</a>.
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

function itemsHtml(items: OrderItem[], total: number) {
  const rows = items
    .map((i) => {
      const qty = Number(i.qty) || 1;
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE6;">${esc(i.name)} <span style="color:#6B6B6B;">× ${qty}</span></td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE6;">${naira(Number(i.price) * qty)}</td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    ${rows}
    <tr><td style="padding:12px 0 0;font-weight:bold;">Total</td><td align="right" style="padding:12px 0 0;font-weight:bold;">${naira(total)}</td></tr>
  </table>`;
}

function itemsText(items: OrderItem[], total: number) {
  const lines = items.map((i) => {
    const qty = Number(i.qty) || 1;
    return `- ${oneLine(i.name)} x ${qty}: ${naira(Number(i.price) * qty)}`;
  });
  return `${lines.join("\n")}\nTotal: ${naira(total)}`;
}

const itemsOf = (o: Order): OrderItem[] => (Array.isArray(o.items) ? o.items : []);

function customerReceivedMail(o: Order): Mail {
  const items = itemsOf(o);
  const html = layout(
    "We've received your order",
    `<p>Hi ${esc(firstName(o.customer_name))},</p>
     <p>Thank you for your order. We've received it together with your payment receipt.</p>
     <p style="background:#FAF8F3;border:1px solid #E8E4D9;padding:12px 16px;margin:16px 0;"><strong>Order reference:</strong> ${esc(o.order_ref)}</p>
     ${itemsHtml(items, o.total)}
     <h2 style="font-family:Georgia,serif;font-weight:normal;font-size:18px;margin:24px 0 8px;">What happens next</h2>
     <ol style="padding-left:20px;margin:0 0 16px;">
       <li>${esc(OWNER)} checks your transfer ${esc(VERIFY_WINDOW)} and confirms by email or WhatsApp.</li>
       <li>Your piece is made to order and takes ${esc(PRODUCTION_TIME)} once payment is confirmed.</li>
       <li>${esc(OWNER)} will confirm the delivery fee with you on WhatsApp. It isn't included in the total above.</li>
     </ol>
     <p style="margin:0 0 4px;"><strong>Delivering to:</strong><br>${esc(o.delivery_address).replace(/\n/g, "<br>")}</p>`
  );
  const text = `Hi ${firstName(o.customer_name)},

Thank you for your order. We've received it together with your payment receipt.

Order reference: ${oneLine(o.order_ref)}

${itemsText(items, o.total)}

What happens next:
1. ${OWNER} checks your transfer ${VERIFY_WINDOW} and confirms by email or WhatsApp.
2. Your piece is made to order and takes ${PRODUCTION_TIME} once payment is confirmed.
3. ${OWNER} will confirm the delivery fee with you on WhatsApp. It isn't included in the total above.

Delivering to: ${oneLine(o.delivery_address)}

Questions? Reply to this email or WhatsApp ${OWNER} on ${WHATSAPP_DISPLAY}.`;
  return { subject: `We've received your order ${oneLine(o.order_ref)} | ${BRAND}`, html, text };
}

function adminNewOrderMail(o: Order): Mail {
  const items = itemsOf(o);
  const wa = `https://wa.me/${waNumber(o.customer_phone)}`;
  const adminLink = SITE_URL ? `${SITE_URL}/admin/orders` : "";
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6B6B6B;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;">${value}</td></tr>`;
  const html = layout(
    "New order received",
    `<p style="background:#FAF8F3;border:1px solid #E8E4D9;padding:12px 16px;margin:0 0 16px;"><strong>${esc(o.order_ref)}</strong> · ${naira(o.total)}</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
       ${row("Customer", esc(o.customer_name))}
       ${row("Email", `<a href="mailto:${esc(o.customer_email)}" style="color:#B8973A;">${esc(o.customer_email)}</a>`)}
       ${row("Phone", `<a href="${wa}" style="color:#B8973A;">${esc(o.customer_phone)}</a> (WhatsApp)`)}
       ${row("Address", esc(o.delivery_address).replace(/\n/g, "<br>"))}
       ${row("Notes", o.customer_notes ? esc(o.customer_notes).replace(/\n/g, "<br>") : "—")}
       ${row("Receipt", o.receipt_path ? "Uploaded. Open the order in the admin to view it." : "None")}
     </table>
     ${itemsHtml(items, o.total)}
     <p style="margin:0 0 16px;">Check the transfer against the total above, then mark the order as paid.</p>
     ${adminLink ? `<p style="margin:0;"><a href="${esc(adminLink)}" style="display:inline-block;background:#B8973A;color:#FAF8F3;text-decoration:none;padding:12px 20px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Open orders</a></p>` : ""}`
  );
  const text = `New order ${oneLine(o.order_ref)} (${naira(o.total)})

Customer: ${oneLine(o.customer_name)}
Email: ${oneLine(o.customer_email)}
Phone: ${oneLine(o.customer_phone)}
Address: ${oneLine(o.delivery_address)}
Notes: ${o.customer_notes ? oneLine(o.customer_notes) : "-"}
Receipt: ${o.receipt_path ? "uploaded (open the order in the admin to view it)" : "none"}

${itemsText(items, o.total)}

Check the transfer against the total above, then mark the order as paid.${adminLink ? `\n${adminLink}` : ""}`;
  return { subject: `New order ${oneLine(o.order_ref)} | ${naira(o.total)}`, html, text };
}

function customerPaidMail(o: Order): Mail {
  const html = layout(
    "Payment confirmed",
    `<p>Hi ${esc(firstName(o.customer_name))},</p>
     <p>Good news: ${esc(OWNER)} has confirmed your payment for order <strong>${esc(o.order_ref)}</strong> (${naira(o.total)}).</p>
     <p>Your piece is now being made. Made-to-order pieces take ${esc(PRODUCTION_TIME)}. We'll message you when it's finished and on its way.</p>
     <p style="margin:0;">Thank you for supporting handmade.</p>`
  );
  const text = `Hi ${firstName(o.customer_name)},

Good news: ${OWNER} has confirmed your payment for order ${oneLine(o.order_ref)} (${naira(o.total)}).

Your piece is now being made. Made-to-order pieces take ${PRODUCTION_TIME}. We'll message you when it's finished and on its way.

Thank you for supporting handmade.`;
  return { subject: `Payment confirmed for order ${oneLine(o.order_ref)} | ${BRAND}`, html, text };
}

// ── sending ────────────────────────────────────────────────────────────────

async function sendEmail(opts: { to: string[]; replyTo?: string; idempotencyKey: string } & Mail) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": opts.idempotencyKey, // protects against double-sends if the webhook fires twice
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// ── webhook entry point ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  if (!WEBHOOK_SECRET || !safeEqual(req.headers.get("x-webhook-secret") ?? "", WEBHOOK_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }
  if (!RESEND_API_KEY || !MAIL_FROM) {
    console.error("send-order-emails: RESEND_API_KEY or MAIL_FROM is not set");
    return json({ error: "not configured" }, 500);
  }

  let payload: { type?: string; table?: string; record?: Order; old_record?: Order | null };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  if (payload.table !== "orders" || !payload.record) return json({ ignored: true });

  const order = payload.record;
  const ref = String(order.order_ref ?? "").replace(/[^A-Za-z0-9_-]/g, ""); // safe for use in a header
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const results: Record<string, string> = {};

  async function run(
    label: string,
    sentColumn: string,
    to: string[],
    build: () => Mail,
    replyTo?: string
  ) {
    try {
      await sendEmail({ to, replyTo, idempotencyKey: `${ref}-${label}`, ...build() });
      const { error } = await supabase
        .from("orders")
        .update({ [sentColumn]: new Date().toISOString() })
        .eq("id", order.id);
      if (error) console.error(`Couldn't record ${label} email for ${ref}:`, error.message);
      results[label] = "sent";
    } catch (e) {
      console.error(`${label} email failed for ${ref}:`, e);
      results[label] = "failed";
    }
  }

  if (payload.type === "INSERT") {
    const jobs: Promise<void>[] = [];
    if (isEmail(order.customer_email) && !order.customer_email_sent_at) {
      jobs.push(
        run("customer-received", "customer_email_sent_at", [order.customer_email], () => customerReceivedMail(order), ADMIN_NOTIFY_EMAIL[0])
      );
    }
    if (ADMIN_NOTIFY_EMAIL.length && !order.admin_email_sent_at) {
      jobs.push(
        run(
          "admin-new-order",
          "admin_email_sent_at",
          ADMIN_NOTIFY_EMAIL,
          () => adminNewOrderMail(order),
          isEmail(order.customer_email) ? order.customer_email : undefined
        )
      );
    }
    await Promise.all(jobs);
  } else if (payload.type === "UPDATE") {
    const becamePaid = payload.old_record?.status !== "paid" && order.status === "paid";
    if (becamePaid && !order.paid_email_sent_at && isEmail(order.customer_email)) {
      await run("customer-paid", "paid_email_sent_at", [order.customer_email], () => customerPaidMail(order), ADMIN_NOTIFY_EMAIL[0]);
    }
  }

  return json({ ok: true, results });
});

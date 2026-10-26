// Lightweight first-party analytics: anonymous ids only (no names, emails or IP addresses).
import { supabase } from "./supabase";

const VISITOR_KEY = "mff_vid";
const SESSION_KEY = "mff_sid";
const FIRST_KEY = "mff_first";

let memVisitor = null;
let memSession = null;

const rid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;

function visitorId() {
  try {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) { v = rid(); localStorage.setItem(VISITOR_KEY, v); }
    return v;
  } catch {
    return (memVisitor ??= rid());
  }
}

function sessionId() {
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) { s = rid(); sessionStorage.setItem(SESSION_KEY, s); sessionStorage.setItem(FIRST_KEY, "1"); }
    return s;
  } catch {
    return (memSession ??= rid());
  }
}

function takeFirstFlag() {
  try {
    const first = sessionStorage.getItem(FIRST_KEY) === "1";
    if (first) sessionStorage.removeItem(FIRST_KEY);
    return first;
  } catch {
    return false;
  }
}

// Don't count Morayo's own browsing: logged-in admin sessions, the /admin area, or a manual opt-out.
function skip() {
  try {
    if (window.location.pathname.startsWith("/admin")) return true;
    if (navigator.doNotTrack === "1") return true;
    if (localStorage.getItem("mff_no_track") === "1") return true;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) return true;
    }
  } catch { /* ignore */ }
  return false;
}

function trafficSource() {
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) return utm.toLowerCase().slice(0, 40);
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    if (host && host !== window.location.hostname) return host.slice(0, 60);
  } catch { /* no referrer */ }
  return "direct";
}

export function track(event, { product_id = null, meta = null, path = null } = {}) {
  try {
    if (skip()) return;
    const row = {
      visitor_id: visitorId(),
      session_id: sessionId(),
      event,
      path: (path ?? window.location.pathname).slice(0, 300),
      product_id: product_id ? String(product_id).slice(0, 80) : null,
      meta,
    };
    supabase.from("analytics_events").insert(row).then(() => {}, () => {});
  } catch { /* analytics must never break the shop */ }
}

export function trackPageView(path) {
  const first = takeFirstFlag();
  track("page_view", { path, meta: first ? { first: true, source: trafficSource() } : null });
}

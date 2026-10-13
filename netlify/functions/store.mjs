// Shared site data store: /.netlify/functions/store
// GET  ?key=<name>                 -> stored JSON (or null)
// POST {key, value}                -> admin-only overwrite
// POST {key, value, append: true}  -> public append (enquiries, bookings, reviews)
import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";

const KEYS = ["settings", "projects", "reviews", "clients", "services", "enquiries", "bookings"];
const ADMIN_READ_ONLY = ["enquiries", "bookings"];
const APPENDABLE = ["enquiries", "bookings", "reviews"];
const MAX_APPEND_BYTES = 100 * 1024;
const MAX_ADMIN_BYTES = 4 * 1024 * 1024;
const MAX_ITEMS = 2000;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });

function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  const given = req.headers.get("x-admin-token");
  if (!expected || !given) return false;
  const a = Buffer.from(given), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const isObject = v => v !== null && typeof v === "object" && !Array.isArray(v);
const newId = () => "id" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export default async (req) => {
  const store = getStore({ name: "site-data", consistency: "strong" });
  const admin = isAdmin(req);

  if (req.method === "GET") {
    const key = new URL(req.url).searchParams.get("key");
    if (!KEYS.includes(key)) return json({ error: "Unknown key" }, 400);
    if (ADMIN_READ_ONLY.includes(key) && !admin) return json({ error: "Forbidden" }, 403);
    let value = await store.get(key, { type: "json" });
    if (key === "reviews" && !admin && Array.isArray(value)) {
      // public visitors only see approved reviews, without reviewer emails
      value = value.filter(r => r && r.approved === true).map(({ email, ...r }) => r);
    }
    return json(value ?? null);
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const raw = await req.text();
  const limit = admin ? MAX_ADMIN_BYTES : MAX_APPEND_BYTES;
  if (raw.length > limit) return json({ error: "Payload too large" }, 400);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!isObject(body) || !KEYS.includes(body.key)) return json({ error: "Invalid request" }, 400);
  const { key, value } = body;

  if (body.append) {
    if (!APPENDABLE.includes(key)) return json({ error: "Forbidden" }, 403);
    if (!isObject(value)) return json({ error: "Value must be an object" }, 400);
    const item = { ...value, id: newId(), created: new Date().toISOString() };
    if (key === "reviews") {
      Object.assign(item, { approved: false, status: "pending", featured: false, date: item.created.slice(0, 10) });
    }
    const list = (await store.get(key, { type: "json" })) || [];
    list.unshift(item);
    if (list.length > MAX_ITEMS) list.length = MAX_ITEMS;
    await store.setJSON(key, list);
    return json({ ok: true, id: item.id });
  }

  if (!admin) return json({ error: "Forbidden" }, 403);
  if (value === undefined) return json({ error: "Missing value" }, 400);
  let toSave = value;
  if (key === "reviews" && Array.isArray(value)) {
    // keep the public "approved" flag in sync with the admin's status field
    toSave = value.map(r => ({ ...r, approved: r.status === "approved" }));
  }
  await store.setJSON(key, toSave);
  return json({ ok: true });
};

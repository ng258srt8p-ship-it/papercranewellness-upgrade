/**
 * papercrane-cms — Cloudflare Worker + D1 CMS API for Paper Crane Wellness.
 *
 * Public:
 *   GET /api/health
 *   GET /api/content               → [{ slug, title, updated_at }]
 *   GET /api/content/:slug         → { slug, title, body, meta, updated_at }
 *
 * Admin (Authorization: Bearer <CMS_ADMIN_TOKEN>):
 *   GET    /api/admin/content          → full list (incl. body)
 *   PUT    /api/admin/content/:slug    → upsert { title, body, meta? }
 *   DELETE /api/admin/content/:slug    → delete
 *
 * CORS is limited to the site's origins (ALLOWED_ORIGINS env override).
 */

type Env = {
  DB: D1Database;
  CMS_ADMIN_TOKEN?: string;
  ALLOWED_ORIGINS?: string;
};

const DEFAULT_ALLOWED_ORIGINS = [
  "https://papercranewellness.pages.dev",
  "https://www.papercranewellness.com",
  "https://papercranewellness.com",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const MAX_TITLE = 300;
const MAX_BODY = 100_000;
const MAX_META = 5_000;

type ContentRow = {
  slug: string;
  title: string;
  body: string;
  meta: string;
  updated_at: string;
};

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
}

function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> {
  if (!origin || !allowed.includes(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
  };
}

function parseJsonField(raw: string | null | undefined, fallback: unknown): unknown {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function rowToPublic(row: ContentRow) {
  return {
    slug: row.slug,
    title: row.title,
    body: parseJsonField(row.body, ""),
    meta: parseJsonField(row.meta, {}),
    updated_at: row.updated_at,
  };
}

function rowToList(row: ContentRow) {
  return { slug: row.slug, title: row.title, updated_at: row.updated_at };
}

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  if (ba.byteLength !== bb.byteLength) return false;
  return crypto.subtle.timingSafeEqual(ba, bb);
}

async function isAuthorized(request: Request, env: Env): Promise<boolean> {
  const expected = env.CMS_ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) return false;
  return timingSafeEqual(m[1], expected);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const allowed = (env.ALLOWED_ORIGINS ?? DEFAULT_ALLOWED_ORIGINS.join(",")).split(",").map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get("origin");
    const cors = corsHeaders(origin, allowed);
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "papercrane-cms", time: new Date().toISOString() }, 200, cors);
    }

    // /api/content → list; /api/content/:slug → one
    const contentMatch = /^\/api\/content(?:\/([a-z0-9-]{1,64}))?$/.exec(url.pathname);
    if (contentMatch && method === "GET") {
      const slug = contentMatch[1];
      if (slug) {
        if (!SLUG_RE.test(slug)) return json({ error: "invalid slug" }, 400, cors);
        const res = await env.DB.prepare("SELECT * FROM content WHERE slug = ?").bind(slug).first<ContentRow>();
        if (!res) return json({ error: "not found" }, 404, cors);
        return json(rowToPublic(res), 200, cors);
      }
      const res = await env.DB.prepare("SELECT * FROM content ORDER BY slug").all<ContentRow>();
      return json(res.results.map(rowToList), 200, cors);
    }

    // /api/admin/content[/:slug]
    const adminMatch = /^\/api\/admin\/content(?:\/([a-z0-9-]{1,64}))?$/.exec(url.pathname);
    if (adminMatch) {
      if (!env.CMS_ADMIN_TOKEN) return json({ error: "admin disabled: no token configured" }, 503, cors);
      const authed = await isAuthorized(request, env);
      if (!authed) return json({ error: "unauthorized" }, 401, cors);

      const slug = adminMatch[1];
      if (!slug && method === "GET") {
        const res = await env.DB.prepare("SELECT * FROM content ORDER BY slug").all<ContentRow>();
        return json(res.results.map(rowToPublic), 200, cors);
      }
      if (slug) {
        if (!SLUG_RE.test(slug)) return json({ error: "invalid slug" }, 400, cors);
        if (method === "GET") {
          const row = await env.DB.prepare("SELECT * FROM content WHERE slug = ?").bind(slug).first<ContentRow>();
          if (!row) return json({ error: "not found" }, 404, cors);
          return json(rowToPublic(row), 200, cors);
        }
        if (method === "DELETE") {
          const res = await env.DB.prepare("DELETE FROM content WHERE slug = ?").bind(slug).run();
          const changed = (res.meta?.changes as number | undefined) ?? 0;
          if (!changed) return json({ error: "not found" }, 404, cors);
          return json({ ok: true, deleted: slug }, 200, cors);
        }
        if (method === "PUT") {
          let input: { title?: unknown; body?: unknown; meta?: unknown };
          try {
            input = (await request.json()) as typeof input;
          } catch {
            return json({ error: "invalid JSON body" }, 400, cors);
          }
          if (typeof input.title !== "string" || !input.title.trim()) {
            return json({ error: "title must be a non-empty string" }, 400, cors);
          }
          if (input.title.length > MAX_TITLE) return json({ error: "title too long" }, 400, cors);

          const bodyStr = typeof input.body === "string" ? input.body : JSON.stringify(input.body ?? "");
          if (bodyStr.length > MAX_BODY) return json({ error: "body too long" }, 400, cors);
          try {
            JSON.parse(bodyStr);
          } catch {
            return json({ error: "body must be valid JSON" }, 400, cors);
          }

          let metaStr = "{}";
          if (input.meta !== undefined) {
            metaStr = typeof input.meta === "string" ? input.meta : JSON.stringify(input.meta);
            if (metaStr.length > MAX_META) return json({ error: "meta too long" }, 400, cors);
            try {
              JSON.parse(metaStr);
            } catch {
              return json({ error: "meta must be valid JSON" }, 400, cors);
            }
          }

          const now = new Date().toISOString();
          await env.DB.prepare(
            `INSERT INTO content (slug, title, body, meta, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(slug) DO UPDATE SET title = excluded.title,
               body = excluded.body, meta = excluded.meta, updated_at = excluded.updated_at`
          ).bind(slug, input.title.trim(), bodyStr, metaStr, now).run();
          const row = await env.DB.prepare("SELECT * FROM content WHERE slug = ?").bind(slug).first<ContentRow>();
          return json(rowToPublic(row!), 200, cors);
        }
        return json({ error: "method not allowed" }, 405, cors);
      }
      return json({ error: "method not allowed" }, 405, cors);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not found" }, 404, cors);
    }

    return new Response("papercrane-cms: API only under /api/*", { status: 404 });
  },
};

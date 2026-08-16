# Paper Crane CMS — Cloudflare Worker + D1

A tiny content API for the Paper Crane Wellness site. The Pages SPA fetches
content from this worker at page-load; the admin UI (`/#/admin` on the site)
writes through it. Copy edits go live immediately — no site re-deploy.

## Files

| File | Purpose |
|---|---|
| `worker.ts` | The worker (request router, auth, CORS, D1 access) |
| `wrangler.toml` | Worker config — binds the `papercrane-content` D1 database |
| `schema.sql` | D1 schema (the `content` table) |
| `seed.sql` | Initial content (announcement, FAQ, contact details) |

## Content model

One row per slug:

| slug | Used by | `body` shape |
|---|---|---|
| `announcement` | Announcement bar on the home page | `{ text, link?, linkText? }` (empty `text` = bar hidden) |
| `faq` | FAQ page (replaces the bundled list) | `{ items: [{ q, a }] }` |
| `contact` | Contact page field overrides | `{ address?, email?, phone?, virtual?, insurance?, notes? }` |

`body` is stored as **raw JSON text** (not double-encoded) and returned as a
parsed object. If a slug is missing or the worker is unreachable, the SPA
falls back to the bundled copy in `src/data/site.ts`.

## API

Base: `https://papercrane-cms.vqh9mnrdbp.workers.dev`

### Public

| Method & path | Returns |
|---|---|
| `GET /api/health` | `{ ok: true }` |
| `GET /api/content` | `[{ slug, title, updated_at }]` |
| `GET /api/content/:slug` | `{ slug, title, body, meta, updated_at }` (404 if unknown) |

### Admin — `Authorization: Bearer <CMS_ADMIN_TOKEN>`

| Method & path | Returns |
|---|---|
| `GET /api/admin/content` | full list incl. `body` |
| `PUT /api/admin/content/:slug` | upsert `{ title, body, meta? }` → the updated row |
| `DELETE /api/admin/content/:slug` | `{ ok: true }` |

`401` on a bad/missing token; `400` on malformed bodies; `405` on wrong
methods; `503` if the worker has no token configured.

### CORS

`Access-Control-Allow-Origin` is set to the requesting origin if it is in
`ALLOWED_ORIGINS` (comma-separated worker env, defaults to
`papercranewellness.pages.dev` + `www.papercranewellness.com` + localhost
dev ports). Preflight `OPTIONS` is answered with the needed headers.

## Deployment

```bash
npx wrangler deploy            # from this directory
npx wrangler secret put CMS_ADMIN_TOKEN   # first time / rotation
```

### D1 maintenance

```bash
npx wrangler d1 execute papercrane-content --remote --file schema.sql  # idempotent
npx wrangler d1 execute papercrane-content --remote --file seed.sql    # INSERT OR REPLACE
npx wrangler d1 export papercrane-content --remote --output backup.json
```

### Local development

```bash
npx wrangler dev --remote --port 8787   # local worker, production D1
# then point the SPA at it:
VITE_CMS_API=http://localhost:8787 npm run build
```

## Security notes

- The admin token lives in **two** places: the worker secret
  (`CMS_ADMIN_TOKEN`) and the local `.env.cms` (gitignored). They must match.
- Public endpoints expose only published copy — that is the design: the
  "database" is a content store, not a user store.
- Rotation: generate 48 hex chars (`openssl rand -hex 24`), put it on the
  worker, update `.env.cms`, done. Old token stops working immediately.

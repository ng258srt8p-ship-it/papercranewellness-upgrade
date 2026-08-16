# Paper Crane Wellness

Editorial single-page application for Paper Crane Wellness — trauma therapy in
South Carolina with Rebekah P. Tozer, LISW-CP. The site runs
**live SimplePractice widgets**: every booking CTA opens the real OAR modal
in place, and the contact page embeds the real SP contact form widget.

- **Production:** https://papercranewellness.pages.dev
- **Custom domain:** https://www.papercranewellness.com (pending DNS switchover)
- **Deploy guide:** [`DEPLOY.md`](./DEPLOY.md)
- **Legacy static site:** archived in [`legacy/`](./legacy/) (see its README)

## Stack

- **React 19** + **TypeScript** (strict)
- **Vite 7** — dev server, build, preview
- **Tailwind CSS v4** — brand palette (sage `#6B7C54`, navy `#24363A`, mist
  `#F0F4EE`, paper `#FBFAF6`), Inter + Playfair Display
- **Hash router** (custom, `src/lib/router.tsx`) — deep links work from any
  static host with no rewrite rules
- **vite-plugin-singlefile** — the production build is one self-contained
  `dist/index.html` (JS, CSS, and all images inlined as data URIs)
- **Playwright** — E2E QA for the SimplePractice widget modals + a broad
  production QA scanner

## Quickstart

```bash
npm install        # or: npm ci
npm run dev        # local dev server (Vite)
npm run build      # → dist/index.html (single self-contained file)
npm run preview    # serves dist/ locally (port 4173)
npm test           # Playwright suite (auto-starts preview on :4173)
```

## Pages & routing

| Route            | Page                                                        |
| ---------------- | ----------------------------------------------------------- |
| `/`              | Home — hero, approach, specialties, credentials, CTA        |
| `/about`         | About Rebekah Tozer, LISW-CP                                |
| `/specialties`   | Specialty overview                                          |
| `/trauma`        | Trauma, PTSD & EMDR detail (data-driven, `src/data/site.ts`)|
| `/neurodivergent`| Neurodivergent affirming detail                             |
| `/individual`    | Individual therapy for adults detail                        |
| `/faq`           | Frequently asked questions                                  |
| `/contact`       | Contact — SP contact widget + booking card                  |
| anything else    | 404 with booking CTA                                        |

Routes are hash-based (`/#/contact`), so the single-file build can be opened
or served from anywhere without server configuration. Each route sets its own
`<title>` and meta description (`src/App.tsx`).

## SimplePractice integration

- **Scope ID:** `ef573a05-79ef-46ab-9b18-d5c65a183d97`
- **Scope URI:** `papercranewellness`
- **Booking URL:** `https://papercranewellness.clientsecure.me`

### How it works

1. `index.html` contains a hidden `#sp-widget-host` div (outside `#root`) with
   two autobind anchors carrying the exact SP data attributes:
   - `data-spwidget-type="OAR"` — "Request Appointment" (opening/booking modal)
   - `data-spwidget-type="Contact form"` + `data-spwidget-contact` — contact form
   Both carry a real `href` to the booking URL as the no-JS fallback.
2. The official SP script (`widget-cdn.simplepractice.com/assets/integration-1.0.js`,
   loaded with `defer`) runs after parse, in document order, **before** the
   React bundle. It autobinds the anchors present at that moment and registers
   widget instances on `window.SPWidgetInstances`.
3. Every booking CTA is a `WidgetButton` (`src/components/ui.tsx`): an anchor
   with the real booking `href` whose `onClick` calls `preventDefault()` and
   then `openSimplePractice(kind)` (`src/lib/simplepractice.ts`), which waits
   for the instance to register and calls `instance.reveal()` to open the
   native SP modal in place.
4. The visible **Contact** button on `/#/contact` is rendered by React *after*
   the SP script ran, so it is re-bound via `refreshSpAutoBind()` in a
   `useEffect`; its `onClick` falls back to `openSimplePractice("contact")`
   if the instance is missing, and its `href` covers no-JS.

### Fallback chain

`instance.reveal()` → re-run `spWidgetAutoBind()` + click the hidden anchor →
open the booking URL in a new tab (`window.open`). The modal always has a way
to work; worst case the user reaches the booking page directly.

### Why `defer`

The SP script is neither blocking (a CDN outage would freeze first paint) nor
a module (it would run after the React bundle, changing autobind timing).
`defer` guarantees document-order execution before the module bundle without
blocking parse.

### To update scope/app IDs

Search for the scope ID in: `index.html`, `src/lib/simplepractice.ts`,
`src/pages/Contact.tsx` (and `tests/sp-widget.spec.ts`).

## Assets

Real practice photography — `rebekah-headshot.webp`, `rebekah-outdoor.webp`,
`rebekah-tozer.webp`, `office.webp` — plus the crane favicon (all in
`src/assets/images/`) and a 1200×630 `public/og-image.png` for social cards.
All images are inlined into the single-file build; `dist/index.html` is the
entire site (~1 MB, ~590 KB gzipped).

## SEO head

`index.html` carries the canonical URL, Open Graph / Twitter card tags, and
`MedicalOrganization` JSON-LD (the single-file build serves the same document
for every hash route, so these are global; per-route titles and descriptions
are set client-side in `src/App.tsx`).

## QA

### `tests/sp-widget.spec.ts` (Playwright)

Exercises the **live** SP production widget, so a network connection to
`simplepractice.com` is required. **Verified (2026-08-15): 12/12 passed**
against both the local preview and production.

Run against any base URL (config uses `BASE_URL`):

```bash
npm test                                                     # local preview
BASE_URL=https://papercranewellness.pages.dev npm test       # production
```

The suite verifies:

- the hidden widget host exposes both anchors with the exact production
  attributes (scope ID, scope URI, application ID, channel, contact flag,
  hrefs) and stays visually hidden;
- modals open from every CTA — home hero, nav pill, footer, contact page
  Contact button, contact page booking card, mobile drawer — **without**
  navigating away from the site;
- the SP contact button is brand-styled (sage `#6B7C54` background, pill
  radius, `14px 28px` padding, white text);
- closing the modal is clean: the overlay is removed and the body scroll
  state (class, `top`, overflow) is exactly restored;
- the modal can be reopened after closing;
- no console errors or page errors from site code (SP's own console noise is
  filtered);
- mobile viewport `375×812`: drawer CTA opens the modal and close restores
  scroll state.

### `scripts/prod-qa.mjs` (broad production scan)

Sweeps all routes at desktop (1440×900) and mobile (375×812) plus an unknown
route: page errors, site-origin console errors/warnings, horizontal overflow,
webfont loading (Inter + Playfair Display), per-route titles, meta description,
OG tags, JSON-LD, canonical, favicon, image `alt` coverage, broken images,
and unnamed icon controls. Screenshots land in `audit-evidence/prod/`.

```bash
node scripts/prod-qa.mjs                        # scans production
BASE_URL=http://localhost:4173 node scripts/prod-qa.mjs   # local preview
```

**Verified (2026-08-15): 0 errors, 0 gaps** against production. Third-party
console noise from the SP widget (render-mode rehydrate warnings) is reported
informationally and never fails the scan.

### Other scripts

| Script | Purpose |
| ------ | ------- |
| `scripts/visual-checks.mjs` | 42 programmatic visual checks (fonts, palette, images, overflow) |
| `scripts/shots.mjs` | Full-page screenshot capture |
| `scripts/find-clipped-headings.mjs` | clip-reveal descender scanner (all routes × viewports) |
| `scripts/verify-descenders.mjs` / `verify-descenders-ab.mjs` | targeted A/B proof for the descender-clipping fix |
| `scripts/convert-assets.mjs` | regenerate `src/assets/images/` from the arena export |

## Reference

- `PLAN.md` — full plan, phases, decision log, and QA results (local working doc)
- `_reference_arena/` — read-only Design Arena export used to build the design
  (never modify)
- `legacy/` — the previous static site, archived for reference

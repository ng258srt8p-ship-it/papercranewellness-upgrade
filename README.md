# Paper Crane Wellness — Editorial Redesign

Editorial React SPA redesign of the Paper Crane Wellness site, built from the
Design Arena export. It replaces the arena's placeholder assets with the
practice's real photography and replaces the fake inquiry form and plain
booking links with **live SimplePractice widgets**: every booking CTA opens the
real OAR modal in place, and the contact page embeds the real SP contact form
widget.

The repository root contains the untouched static site; `_reference_arena/`
holds the read-only design reference (arena export + source zip). Neither is
modified by this subproject.

## Stack

- **React 19** + **TypeScript** (strict)
- **Vite 7** — dev server, build, preview
- **Tailwind CSS v4** — brand palette (sage `#6B7C54`, navy `#24363A`, mist
  `#F0F4EE`, paper `#FBFAF6`), Inter + Playfair Display
- **Hash router** (custom, `src/lib/router.tsx`) — deep links work from any
  static host with no rewrite rules
- **vite-plugin-singlefile** — the production build is one self-contained
  `dist/index.html` (JS, CSS, and all images inlined as data URIs)
- **Playwright** — E2E QA for the SimplePractice widget modals

## Quickstart

```bash
npm install
npm run dev        # local dev server (Vite)
npm run build      # → dist/index.html (single self-contained file)
npm run preview    # serves dist/ locally
npm test           # Playwright suite (auto-starts preview on port 4173)
```

## Pages & routing

| Route            | Page                                                        |
| ---------------- | ----------------------------------------------------------- |
| `/`              | Home — hero, approach, specialties, credentials, CTA        |
| `/about`         | About Rebekah Tozer, LPC                                     |
| `/specialties`   | Specialty overview                                          |
| `/specialties/:slug` | Specialty detail (data-driven, `src/data/site.ts`)        |
| `/faq`           | Frequently asked questions                                   |
| `/contact`       | Contact — SP contact widget + booking card                   |
| anything else    | 404 with booking CTA                                         |

Routes are hash-based (`/#/contact`), so the single-file build can be opened
or served from anywhere without server configuration.

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
`rebekah-tozer.webp`, `office.webp` — plus the crane favicon. All images are
inlined into the single-file build; `dist/index.html` is the entire site
(~1 MB, ~590 KB gzipped).

## QA

`tests/sp-widget.spec.ts` (config: `playwright.config.ts` — 1 worker,
`webServer` on `:4173`, 20 s expect timeouts) exercises the **live** SP
production widget, so a network connection to `simplepractice.com` is
required. **Verified (2026-08-14): 12/12 tests passed (29.1 s)** against the live SP
production widget, and 42/42 programmatic visual checks passed (fonts, palette,
image loading, overflow, mobile). Full-page screenshots are archived in
`audit-evidence/`.

The suite verifies:

- the hidden widget host exposes both anchors with the exact production
  attributes (scope ID, scope URI, application ID, channel, contact flag,
  hrefs) and stays visually hidden;
- modals open from every CTA — home hero, nav pill, footer, contact page
  Contact button, contact page booking card, mobile drawer — **without**
  navigating away from the site (URL stays on localhost);
- the SP contact button is brand-styled (sage `#6B7C54` background, pill
  radius, `14px 28px` padding, white text);
- closing the modal is clean: the overlay is removed and the body scroll
  state (class, `top`, overflow) is exactly restored;
- the modal can be reopened after closing;
- no console errors or page errors from site code (SP's own console noise is
  filtered);
- mobile viewport `375×812`: drawer CTA opens the modal and close restores
  scroll state.

## Reference

- `PLAN.md` — full plan, phases, decision log, and QA results
- Arena export provenance: `_reference_arena/` (read-only; never modify)

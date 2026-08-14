# Paper Crane Wellness — Editorial Redesign (`redesign/`)

**Status:** ACTIVE (executed under the thread `/goal`)
**Reference design (READ-ONLY):** `../_reference_arena/` — extracted from `editorial-therapy-website-development.zip` (Design Arena export: React 19 + Vite 7 + TS + Tailwind v4, hash router, single-file build via `vite-plugin-singlefile`, editorial design system).
**Current production site:** repo root (13 static HTML pages, Cloudflare Pages). Its `src/js/booking-modal.js` and `plan/contact-*.md` are the source of truth for widget behavior. **Do not modify.**

---

## 1. Objective

Build a **new version in subproject folder `redesign/`**, very much inspired by the arena export — same editorial design system, pages, copy, and motion — but with:

1. **Real assets** replacing arena placeholders (profile photos, office, etc.).
2. **Real SimplePractice widgets working as modals** (Request Appointment + Contact) — the arena export dropped these (it has a fake inquiry form and plain booking links).
3. **Verified**: clean build, all routes render, both modals open/close with correct scroll-lock behavior on desktop + mobile (Playwright + screenshots).

## 2. Key facts (verified)

- **SP widget identifiers (must match exactly, do not alter):**
  - scope-id: `ef573a05-79ef-46ab-9b18-d5c65a183d97`
  - scope-uri: `papercranewellness`
  - application-id: `7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b`
  - booking URL: `https://papercranewellness.clientsecure.me`
- **SP integration script** (`https://widget-cdn.simplepractice.com/assets/integration-1.0.js`): `window.spWidgetAutoBind()` runs once at script load; it binds `onclick` directly to `[data-spwidget-autobind]` anchors **present in the DOM at load time** and registers `window.SPWidgetInstances["<scopeId>-appointment"]` and `["<scopeId>-contact"]`. Modals are full-screen SP overlays with an iframe (`title="Request an Appointment"` / `title="Send message"`); scroll lock = body classes `spwidget--scroll-locked` / `spwidget--no-scroll` + `body.style.top = -scrollY`.
  - **Consequence for the React SPA:** widget anchors must exist *statically* in `index.html` (outside `#root`), loaded before the module bundle; React CTAs then call `reveal()` on the registered instances (proven pattern — same as root `booking-modal.js`).
- **Real assets available** (root `src/assets/images/`): `rebekah-headshot.webp`, `rebekah-tozer.webp`, `rebekah-outdoor.webp`, `Office.png` (1.8 MB — must convert/compress), `logo.webp`, `favicon.png`.
- **Arena image usage:** `img.rebekah` → Home hero (4:5) + About sticky portrait; `img.office` → Home office shot (5:4); `img.portrait` → Home secondary portrait (3:4); `img.room` / `img.paper` → imported but unused (dead).

## 3. Phases

### Phase 1 — Scaffold  [x]
- [x] Create `redesign/`; copy from `_reference_arena/`: `src/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`.
- [x] `redesign/.gitignore` (node_modules, dist, audit-evidence, .DS_Store).
- [x] `cd redesign && npm install`; verify `npm run build` (single-file `dist/index.html`) and `npm run dev` render.
- [x] Baseline git commit.

### Phase 2 — Asset swap  [x]
- [x] Create `redesign/src/assets/images/` and copy real photos from root `src/assets/images/`:
  - `rebekah-headshot.webp` → `images.ts: rebekah` (Home hero + About)
  - `rebekah-outdoor.webp` → `images.ts: portrait` (Home secondary portrait)
  - `rebekah-tozer.webp` (spare)
  - `Office.png` → convert to `office.webp` (width ≤ 1600, quality ≈ 80) → `images.ts: office`
  - `favicon.png` → set in `redesign/index.html`
  - Conversion tool: `sips`/`cwebp` if available, else `npx sharp` one-liner in `redesign/`.
- [x] Update `src/assets/images.ts`; remove unused `room`/`paper` entries and delete arena placeholder jpgs (`rebekah.jpg`, `portrait.jpg`, `office.jpg`, `room.jpg`, `paper.jpg`).
- [x] Acceptance: every `<img>` shows a real photo; alt text still accurate; `dist/index.html` ≤ ~2 MB (single-file build inlines assets).

### Phase 3 — SimplePractice widgets (modals)  [x]
- [x] `redesign/index.html` (static head/body):
  - `<head>`: load SP integration script (classic script, runs before the deferred module bundle) so autobind sees the anchors.
  - `<body>` (outside `#root`): hidden container (`display:none`) containing **both** widget anchors, exactly as provided:
    - OAR: `href=clientsecure.me`, `class="spwidget-button"`, `data-spwidget-scope-id/scope-uri/application-id`, `data-spwidget-type="OAR"`, `data-spwidget-scope-global`, `data-spwidget-autobind` — text "Request Appointment".
    - Contact: same + `data-spwidget-channel="embedded_widget"`, `data-spwidget-type="Contact form"`, `data-spwidget-contact` — text "Contact".
  - Keep real `href` on both = no-JS fallback.
- [x] New `redesign/src/lib/simplepractice.ts`:
  - constants (scopeId, booking URL) + `openSimplePractice(kind: 'appointment' | 'contact')`.
  - poll (≤ 5 s) for `window.SPWidgetInstances[`${scopeId}-${kind}`]` → `reveal()`; fallback 1: click hidden anchor; fallback 2: `window.open(booking URL)`.
  - TS declarations for `window.SPWidgetInstances` / `window.spWidgetAutoBind`.
- [x] Wire CTAs (replace plain `site.booking` links; keep `site.booking` as anchor href):
  - Nav "Free Consult" pill (desktop + mobile drawer button).
  - Home hero CTA, `CTA` component button, all Specialty page CTAs, Footer booking button, Contact `BookingCard` button → appointment modal.
- [x] Contact page: replace the fake `InquiryForm` (which only fakes success) with the SP **Contact form widget** button opening the contact modal; keep email/office/hours info + 988 crisis note.
  - Restyle `.spwidget-button` in `redesign/src/index.css` to match brand: sage `#6B7C54` bg, white text, pill radius, hover `#55643F`, `!important` overrides (pattern documented in `../plan/contact-widget-button-style.md`).

**Phase 3 decisions (implemented):** SP script loaded with `defer` (document-order before the React module bundle; non-blocking). CTAs use a `WidgetButton` component (`src/components/ui.tsx`) — brand-styled anchor with real booking `href` + `onClick` → `openSimplePractice(kind)`; variants match the original `Button` styles. Contact page renders the visible SP contact anchor via a `ContactWidget` component and re-binds in `useEffect` (`refreshSpAutoBind()`) since React renders it after the SP script ran; fallback `onClick` + `href` cover no-bind/no-JS.

### Phase 4 — Modal QA ("modals work as designed")  [x]
- [x] Add Playwright to `redesign/` (devDep `@playwright/test`) + `playwright.config.ts` (webServer `npm run preview -- --port 4173 --strictPort`, 1 worker, 20 s expect timeouts, trace on retry).
- [x] Spec `redesign/tests/sp-widget.spec.ts` (12 tests, verified against built site):
  1. Hidden host: both anchors present with exact production attributes (scope-id/uri/app-id/channel/contact flag/href), host `display:none`.
  2. No console/page errors from site code (SP noise filtered).
  3. Hero CTA opens `.spwidget--overlay` (iframe visible) without navigating (URL stays localhost).
  4. Nav pill + footer CTAs open the modal.
  5. Contact page: visible `spwidget-button` is brand-styled (sage `rgb(107,124,84)`, radius 9999px, padding 14px 28px, white text); Contact button opens the contact modal; BookingCard CTA opens the OAR modal.
  6. Lifecycle: close (backdrop click → Esc fallback) removes the overlay and restores body scroll state exactly (className/top/overflow); reopen works.
  7. Mobile 375×812: hamburger (aria-label "Open menu") → drawer CTA opens modal; close restores scroll state.
- [x] Run desktop + mobile; fix any SP interaction issues; archive evidence to `redesign/audit-evidence/`. Result: 12/12 passed (29.1 s) against the live SP production widget — close via backdrop click works, no z-index issues, scroll state restored exactly.

### Phase 5 — Polish, docs, checkpoints  [x]
- [x] Visual pass (desktop 1440 + mobile 375; 12 full-page screenshots in `audit-evidence/`): fonts (Playfair/Inter), palette (paper/mist/navy/sage), real photos, no horizontal overflow, mobile hamburger. Programmatic checks (`scripts/visual-checks.mjs`): **42/42 passed**. Caveat: no vision-capable model available in this environment (Anthropic 401), so the pixel-level aesthetic pass is left to manual review of the archived screenshots.
- [x] `redesign/README.md`: run/build/deploy instructions, widget integration architecture, asset mapping, QA suite description + how to re-run tests.
- [x] QA results + visual evidence: `audit-evidence/` (12 screenshots), README QA section updated with the verified 12/12 result.
- [x] Keep this PLAN.md checkbox current; git commit per phase.

## 4. Definition of Done

1. `redesign/` builds with zero TS errors; single-file `dist/index.html` ≤ 2 MB.
2. All 8 routes render with **real photos** (headshot hero/About, office, outdoor portrait).
3. "Request Appointment" from any booking CTA opens the **SP OAR modal**; close works; scroll lock/restore clean.
4. Contact page Contact widget opens the **SP contact form modal**; button styled to brand.
5. Playwright spec green on desktop + mobile; screenshots archived in `redesign/audit-evidence/`.
6. Root static site and `_reference_arena/` untouched (`git status` clean outside `redesign/`).
7. README + PLAN checkboxes complete.

## 5. Constraints

- Do NOT modify the root static site (13 HTML pages, `src/js/*`, `tests/*`) or `_reference_arena/` (read-only reference).
- Brand palette and fonts are non-negotiable; keep arena copy/design language.
- SP widget data-attributes exactly as provided (IDs must not change).
- No new frameworks — React 19 / Vite / Tailwind v4 only (+ Playwright for QA).
- Keep `vite-plugin-singlefile` single-file output.
- Work in git checkpoints; log progress briefly in this file.

## 6. Progress log

- 2026-07-19: Plan drafted from reference export + root project research (SP autobind behavior verified against integration-1.0.js source).

- 2026-08-14 — Phase 3 complete: hidden SP host in index.html (defer script), `simplepractice.ts` lib, `WidgetButton` in ui.tsx, all 8 CTAs wired (nav desktop/mobile, home hero, CTA component, footer, contact booking card, 404), contact page now embeds the real SP Contact widget with brand CSS in index.css. `tsc --noEmit` clean; build = single `dist/index.html` ~986 KB.
- 2026-08-14 — Phase 4 setup: `@playwright/test` installed, `playwright.config.ts` + `tests/sp-widget.spec.ts` (12 tests) written and listed cleanly. Suite execution pending browser download.
- 2026-08-14 — Phase 4 verified: `npx playwright test` → **12/12 passed (29.1 s)** against the live SP production widget (OAR + contact modals, all CTAs, desktop + 375×812 mobile, clean close/scroll-restore, no site-code errors). Fixes found during QA: none in site code — two spec corrections (OAR anchor has no `data-spwidget-channel`; console-error collection scoped to site origin because SP preloads a cross-origin Ember iframe).
- 2026-08-14 — Phase 5 complete: visual screenshots archived, 42/42 programmatic brand checks, README + PLAN updated. All phases done; final commit made.

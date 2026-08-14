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

### Phase 1 — Scaffold  [ ]
- [ ] Create `redesign/`; copy from `_reference_arena/`: `src/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`.
- [ ] `redesign/.gitignore` (node_modules, dist, audit-evidence, .DS_Store).
- [ ] `cd redesign && npm install`; verify `npm run build` (single-file `dist/index.html`) and `npm run dev` render.
- [ ] Baseline git commit.

### Phase 2 — Asset swap  [ ]
- [ ] Create `redesign/src/assets/images/` and copy real photos from root `src/assets/images/`:
  - `rebekah-headshot.webp` → `images.ts: rebekah` (Home hero + About)
  - `rebekah-outdoor.webp` → `images.ts: portrait` (Home secondary portrait)
  - `rebekah-tozer.webp` (spare)
  - `Office.png` → convert to `office.webp` (width ≤ 1600, quality ≈ 80) → `images.ts: office`
  - `favicon.png` → set in `redesign/index.html`
  - Conversion tool: `sips`/`cwebp` if available, else `npx sharp` one-liner in `redesign/`.
- [ ] Update `src/assets/images.ts`; remove unused `room`/`paper` entries and delete arena placeholder jpgs (`rebekah.jpg`, `portrait.jpg`, `office.jpg`, `room.jpg`, `paper.jpg`).
- [ ] Acceptance: every `<img>` shows a real photo; alt text still accurate; `dist/index.html` ≤ ~2 MB (single-file build inlines assets).

### Phase 3 — SimplePractice widgets (modals)  [ ]
- [ ] `redesign/index.html` (static head/body):
  - `<head>`: load SP integration script (classic script, runs before the deferred module bundle) so autobind sees the anchors.
  - `<body>` (outside `#root`): hidden container (`display:none`) containing **both** widget anchors, exactly as provided:
    - OAR: `href=clientsecure.me`, `class="spwidget-button"`, `data-spwidget-scope-id/scope-uri/application-id`, `data-spwidget-type="OAR"`, `data-spwidget-scope-global`, `data-spwidget-autobind` — text "Request Appointment".
    - Contact: same + `data-spwidget-channel="embedded_widget"`, `data-spwidget-type="Contact form"`, `data-spwidget-contact` — text "Contact".
  - Keep real `href` on both = no-JS fallback.
- [ ] New `redesign/src/lib/simplepractice.ts`:
  - constants (scopeId, booking URL) + `openSimplePractice(kind: 'appointment' | 'contact')`.
  - poll (≤ 5 s) for `window.SPWidgetInstances[`${scopeId}-${kind}`]` → `reveal()`; fallback 1: click hidden anchor; fallback 2: `window.open(booking URL)`.
  - TS declarations for `window.SPWidgetInstances` / `window.spWidgetAutoBind`.
- [ ] Wire CTAs (replace plain `site.booking` links; keep `site.booking` as anchor href):
  - Nav "Free Consult" pill (desktop + mobile drawer button).
  - Home hero CTA, `CTA` component button, all Specialty page CTAs, Footer booking button, Contact `BookingCard` button → appointment modal.
- [ ] Contact page: replace the fake `InquiryForm` (which only fakes success) with the SP **Contact form widget** button opening the contact modal; keep email/office/hours info + 988 crisis note.
  - Restyle `.spwidget-button` in `redesign/src/index.css` to match brand: sage `#6B7C54` bg, white text, pill radius, hover `#55643F`, `!important` overrides (pattern documented in `../plan/contact-widget-button-style.md`).

### Phase 4 — Modal QA ("modals work as designed")  [ ]
- [ ] Add Playwright to `redesign/` (devDep; browsers already cached from root project) + minimal `playwright.config.ts` (webServer: `npm run preview` or `serve dist`).
- [ ] Spec `redesign/tests/sp-widget.spec.ts`:
  1. Desktop: `/` → click "Request Appointment" → `iframe[title="Request an Appointment"]` visible + body has `spwidget--scroll-locked`; close (Esc/overlay) → class removed, no residual `body.style.top` / scroll offset.
  2. `#/contact` → click "Contact" → `iframe[title="Send message"]` visible; close works.
  3. Mobile viewport (375×812): both modals open + close.
  4. All 8 hash routes (`/`, `/about`, `/specialties`, `/trauma`, `/neurodivergent`, `/individual`, `/faq`, `/contact`) render; `document.title` updates; no page errors.
  5. Hidden anchors carry correct `data-spwidget-*` attributes and real `href` (no-JS fallback).
  6. Real photos load on `/` and `/about` (img src + naturalWidth > 0).
- [ ] Run on desktop + mobile; fix any SP interaction issues found (scroll position, close behavior, z-index vs fixed nav); archive screenshots to `redesign/audit-evidence/`.

### Phase 5 — Polish, docs, checkpoints  [ ]
- [ ] Visual pass vs arena reference (desktop + mobile screenshots): fonts (Playfair/Inter), grain, reveal animations, palette exactly sage `#6B7C54` / navy `#24363A` / mist `#F0F4EE` / paper `#FBFAF6`.
- [ ] `redesign/README.md`: run/build/deploy instructions, widget integration architecture, asset mapping table, QA results + how to re-run tests.
- [ ] Keep this PLAN.md checkbox current; git commit per phase.

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

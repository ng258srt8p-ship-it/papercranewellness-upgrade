# Paper Crane Wellness v2 — UI/UX Fixes Plan

**Date:** 2025-08-07  
**Site:** https://papercrane-wellness-v2.pages.dev  
**Base commit / state:** All 26 production verification tests PASS

---

## Executive Summary

The site is live and functional with all core accessibility fixes from the previous audit cycle already applied (skip-link, print stylesheet, contrast ratios). This plan addresses remaining UI/UX gaps discovered through a deeper structural and visual audit — broken HTML on one page, inconsistent footer navigation across pages, missing CTA banners on several pages, undefined CSS variables in inline styles, deprecated HTML elements, and duplicate meta tags.

---

## Issues by Priority

### 🔴 HIGH — Broken / Functional Issues

#### H1: 404.html Has Malformed HTML Structure
- **Affected:** `404.html` only
- **Issue:** The navbar section has a broken structure — there are two `</header>` closing tags (lines 97 and 112), and a stray CTA button + orphaned `</div></header>` appears after the mobile menu nav closes. This means the second half of the header is not properly nested, which can cause layout/rendering issues in strict browsers.
- **Root cause:** A duplicate/merge artifact from an earlier edit cycle.
- **Fix:** Remove the stray markup between lines 108–112 (`</div></header>` after mobile menu). The correct structure should be: `<nav class="navbar__mobile-menu">...</nav>` followed directly by `</main>`.

---

### 🟠 MEDIUM — Consistency & Completeness Issues

#### M1: Inconsistent Footer Navigation Across Pages
- **Affected:** 6 pages have incomplete footer nav (missing "Links" column items)
- **Issue:** The footer's "Links" column should consistently show 5 items: Home, About, FAQ, Contact, Book Now. Several pages are missing one or more of these links.

| Page | Current Links | Missing |
|------|--------------|---------|
| `index.html` | ✓ All 5 present | — |
| `about.html` | Home, About, FAQ, Contact | **Book Now** |
| `contact.html` | Home, About, FAQ, Contact | **Book Now** |
| `faq.html` | Home, About, FAQ | **Contact**, **Book Now** |
| `404.html` | Home, About, Contact | **FAQ**, **Book Now** |
| All other pages (service + legal) | Home, About, FAQ, Contact | **Book Now** |

- **Fix:** Add the missing `<li><a href="...">...</a></li>` entries to each page's footer nav section. The "Book Now" link should point to `https://papercranewellness.clientsecure.me/request` with `data-booking-modal`.

#### M2: Missing CTA Banner on Several Pages
- **Affected:** 6 pages are missing the CTA banner section entirely
- **Issue:** These pages have no call-to-action at the bottom of their content, creating a dead-end for users who scroll to the end without converting.

| Page | Has CTA? | Notes |
|------|----------|-------|
| `index.html` | ✓ | — |
| `about.html` | ✓ | — |
| `contact.html` | ✗ | Has booking widget but no standalone CTA banner |
| `faq.html` | ✓ | — |
| `individual-therapy-for-adults.html` | ✓ | — |
| `neurodivergent-affirming-therapy.html` | ✓ | — |
| `trauma-ptsd-emdr-and-prolonged-exposure-therapy.html` | ✓ | — |
| `types-of-therapy.html` | ✓ | — |
| `blog/index.html` | ✓ | — |
| `404.html` | ✗ (acceptable) | Error page — no CTA needed |
| `privacy-policy.html` | ✗ | Legal page — consider adding |
| `cookies-policy.html` | ✗ | Legal page — consider adding |
| `acceptable-use-policy.html` | ✗ | Legal page — consider adding |
| `no-surprises-act.html` | ✗ | Legal page — consider adding |

- **Fix:** Add the standard CTA banner section (`<section class="cta-banner">...</section>`) before the footer on pages that are missing it. For legal pages, use a softer variant or skip if they're purely informational. The contact page already has a booking widget but could benefit from an additional CTA banner for users who scroll past it.

#### M3: Missing Scripts on Legal Pages
- **Affected:** `privacy-policy.html`, `cookies-policy.html`, `acceptable-use-policy.html`, `no-surprises-act.html`
- **Issue:** These pages are missing the `booking-modal.js` and `scroll-reveal.js` script includes. While they don't have CTA buttons that need the booking modal, they do use `[data-reveal]` attributes on their content sections for scroll animations. Without `scroll-reveal.js`, these animations won't trigger.
- **Fix:** Add `<script src="src/js/booking-modal.js" defer></script>` and `<script src="src/js/scroll-reveal.js" defer></script>` before the closing `</body>` tag on each of these pages.

---

### 🟡 LOW — Polish & Best Practice Issues

#### L1: Deprecated `<center>` Tag Usage
- **Affected:** `index.html`, `about.html`, `faq.html`, `types-of-therapy.html` (4 pages)
- **Issue:** The Psychology Today seal is wrapped in a deprecated `<center>` HTML element. This is not valid HTML5 and may cause rendering inconsistencies.
- **Fix:** Replace `<center>...</center>` with a CSS-based centering approach using the existing `.footer__trust-badges` container (which already has `justify-content: center`). Simply remove the `<center>` tags — the CSS will handle centering.

#### L2: Duplicate OG Meta Tags
- **Affected:** 7 pages have duplicate Open Graph meta tags
- **Issue:** Several pages define OG tags twice in their `<head>`, creating redundant markup that search engines may interpret as conflicting signals.

| Page | Count | Issue |
|------|-------|-------|
| `index.html` | 11 OG tags | First block (4 tags) is a duplicate of the second block |
| `about.html` | 7 OG tags | Duplicate `og:image`, `og:image:alt`, `og:url` blocks |
| `contact.html` | 7 OG tags | Same duplication pattern |
| `individual-therapy-for-adults.html` | 7 OG tags | Same duplication pattern |
| `neurodivergent-affirming-therapy.html` | 7 OG tags | Same duplication pattern |
| `trauma-ptsd-emdr-and-prolonged-exposure-therapy.html` | 7 OG tags | Same duplication pattern |
| `types-of-therapy.html` | 8 OG tags | Same duplication pattern + extra og:title |

- **Fix:** Consolidate to a single set of OG meta tags per page. The canonical pattern used on most pages is:
  ```html
  <meta property="og:type" content="website" />
  <meta property="og:title" content="[Page Title]" />
  <meta property="og:description" content="[Description]" />
  <meta property="og:url" content="[Canonical URL]" />
  <meta property="og:image" content="https://www.papercranewellness.com/src/assets/images/logo.webp" />
  <meta property="og:image:alt" content="Paper Crane Wellness LLC Logo" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content="Paper Crane Wellness LLC" />
  ```

#### L3: Undefined CSS Variables in Inline Styles
- **Affected:** `faq.html`, `404.html`
- **Issue:** Several inline `<style>` blocks reference CSS custom properties that are not defined in `src/tokens.css`:
  - `--color-text-secondary` (used in faq.html for `.faq-answer`) — should map to `var(--color-text-muted)`
  - `--leading-relaxed` (used in faq.html) — should map to `var(--leading-normal)` or `var(--leading-loose)`
  - `--text-3xl` (used in 404.html for `.error-title`) — not defined; closest is `--text-2xl` at 2rem, or use a custom value

- **Fix:** Replace undefined variables with either:
  - Defined equivalents (`var(--color-text-muted)` instead of `var(--color-text-secondary)`, etc.)
  - Or add the missing tokens to `src/tokens.css` if they're genuinely needed across multiple pages

#### L4: Long Paragraphs on About Page (Readability)
- **Affected:** `about.html` — 2 paragraphs exceed ~500 characters
- **Issue:** 
  - Para 1 (643 chars): "I'm an avid audiobook listener..." — covers education + experience in one block
  - Para 2 (506 chars): "I specialize in working with folks..." — covers specializations + practice focus
- **Fix:** Break the longest paragraph (643 chars) into two shorter paragraphs with a subheading between them. For example:
  ```html
  <p>I'm an avid audiobook listener, Game of Thrones enthusiast, and therapist who has experienced the therapeutic path from both sides of the couch.</p>
  <h4>Education &amp; Experience</h4>
  <p>As a Clinical Social Worker in South Carolina...</p>
  ```

#### L5: Footer Nav Missing "Book Now" on Most Pages
- **Affected:** All pages except `index.html` are missing the "Book Now" link from footer nav
- **Issue:** The index page is the only one with the complete 5-link footer nav. Every other page has only 4 links (Home, About, FAQ, Contact). This creates a conversion dead-end for users who reach any inner page and scroll to the bottom.
- **Fix:** Add `<li><a href="https://papercranewellness.clientsecure.me/request" data-booking-modal>Book Now</a></li>` to every page's footer nav section.

---

## Execution Order

### Phase 1: Critical Fixes (do first)
| # | Issue | Effort | Risk |
|---|-------|--------|------|
| H1 | Fix 404.html broken HTML | 5 min | Low — isolated to one page |

### Phase 2: Consistency Fixes (high impact, low risk)
| # | Issue | Effort | Pages Affected |
|---|-------|--------|----------------|
| M1 + L5 | Standardize footer nav (add missing links) | 30 min | All 12 pages |
| M2 | Add CTA banners to pages missing them | 45 min | 6 pages |
| M3 | Add missing scripts to legal pages | 10 min | 4 pages |

### Phase 3: Polish (nice-to-have)
| # | Issue | Effort | Pages Affected |
|---|-------|--------|----------------|
| L1 | Remove `<center>` tags | 5 min | 4 pages |
| L2 | Deduplicate OG meta tags | 30 min | 7 pages |
| L3 | Fix undefined CSS variables | 15 min | 2 pages |
| L4 | Break up long about.html paragraphs | 10 min | 1 page |

**Total estimated effort:** ~2 hours

---

## Validation Strategy

After each phase, run:
```bash
npx playwright test tests/production-verify.spec.js
```

This will verify all 26 tests still pass (page loads, navbar consistency, no console errors).

Additionally, visually inspect:
1. **404.html** — header renders correctly, no duplicate CTA buttons
2. **Footer nav on every page** — all show Home, About, FAQ, Contact, Book Now
3. **CTA banners** — appear at bottom of content sections on all applicable pages
4. **Scroll animations** — work on legal pages (scroll-reveal.js loaded)
5. **FAQ page** — no CSS variable errors in console
6. **OG tags** — single set per page, verified via browser DevTools

---

## Notes & Decisions Needed

1. **Social media links (`href="#"`)**: These are placeholder links on all 12 pages. The audit flagged this as needing human input (actual social URLs). This is deferred until real URLs are provided. Options while waiting:
   - Remove the entire `footer__social` div from all pages
   - Keep as-is with a TODO comment
   - Comment out the section

2. **Legal page CTA banners**: The 4 legal pages (privacy, cookies, AUP, No Surprises Act) don't have CTA banners. This is arguably appropriate for purely informational/legal content — users reading these pages are typically not in a "book now" mindset. Decision: skip adding CTAs to legal pages unless requested.

3. **Contact page CTA**: The contact page has a SimplePractice widget but no standalone CTA banner. Since the widget may fail to load (there's already a fallback mechanism), adding a CTA banner provides an additional conversion path. Recommended: add it.

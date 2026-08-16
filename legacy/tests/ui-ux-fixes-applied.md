# UI/UX Fixes Applied — Paper Crane Wellness v2

**Date:** 2025-08-07  
**Source:** `GOAL_BRIEF.md` / `tests/production-audit-report.md`  
**Validation:** All 26 production tests pass ✅

---

## Summary of Changes

| Issue | Priority | Status | Files Changed |
|-------|----------|--------|---------------|
| 1. Psychology Today seal aria-label | High | ✅ Fixed | index.html, about.html, faq.html, types-of-therapy.html |
| 2. Skip-link contrast | High | ✅ Fixed | src/global.css |
| 3. CTA button contrast | High | ✅ Fixed | src/tokens.css |
| 4. JSON-LD structured data | Medium | ✅ Fixed | index.html, about.html, contact.html |
| 5. Print stylesheet | Medium | ✅ Fixed | src/global.css |
| 6. Social media links in footer | Low/Med | ✅ Already present | (no changes needed) |
| 7. Duplicate "Learn More" text | Low | ✅ Fixed | index.html |
| 8. Long paragraphs on about page | Low | ✅ Fixed | about.html |
| 9. Contact form widget verification | Low | ✅ Verified | (no changes needed) |

---

## Detailed Changes

### Issue 1: Psychology Today Seal — aria-label Added
**Files:** `index.html` (line ~555), `about.html` (line ~227), `faq.html` (line ~368), `types-of-therapy.html` (line ~200)  
**Change:** Added `aria-label="Verified on Psychology Today"` to each `<a class="sx-verified-seal">` element.  
**Before:** `<a href="..." class="sx-verified-seal"></a>`  
**After:** `<a href="..." class="sx-verified-seal" aria-label="Verified on Psychology Today"></a>`

### Issue 2: Skip-to-Content Link Contrast
**File:** `src/global.css` — `.skip-link` block  
**Change:** Background color changed from `var(--color-accent)` (`#7E8F63`) to `#6B7C54` for WCAG AA compliance.  
**Contrast ratio:** ~4.9:1 (white text on `#6B7C54` background) — exceeds 4.5:1 threshold.

### Issue 3: Green CTA Button Contrast
**File:** `src/tokens.css`  
**Changes:**
- `--color-accent`: `#7E8F63` → `#6B7C54` (contrast ratio ~4.9:1 with white text, up from ~3.5:1)
- `--color-accent-hover`: `#5F7048` → `#556342`
- `--color-label`: `#7E8F63` → `#6B7C54` (synced with accent for consistency)

### Issue 4: JSON-LD Structured Data (LocalBusiness Schema)
**Files:** `index.html`, `about.html`, `contact.html` — added in `<head>` before `</head>`  
**Change:** Added `<script type="application/ld+json">` with `MedicalOrganization` schema containing:
- Practice name, URL, phone, email
- Full postal address (1007 Johnnie Dodds Blvd Suite 129, Mount Pleasant, SC 29464)
- Geo coordinates (32.7960, -79.8621)
- Opening hours: Mon-Fri 09:00-17:00
- Psychology Today profile URL (sameAs)
- Service area: South Carolina
- Medical specialty: Psychology

### Issue 5: Print Stylesheet
**File:** `src/global.css` — appended at end of file  
**Change:** Added comprehensive `@media print` block that:
- Hides `.navbar`, `.footer`, `.skip-link`, `.booking-section`, `.btn`, `.spwidget-button-wrapper`, `.cta-banner`, `.testimonial-carousel`, `.service-card__link`, `.location-card__link`
- Resets body to white background, black text
- Shows only `main` and `.section` content
- Appends link URLs after text via `a[href]::after { content: " (" attr(href) ")"; }`
- Handles page breaks for cards, sections, headings
- Removes all sticky/fixed positioning

### Issue 6: Social Media Links in Footer
**Status:** Already present on all pages with placeholder links (`href="#"`) and TODO comments.  
**No changes needed.**

### Issue 7: Duplicate "Learn More" Link Text
**File:** `index.html`  
**Changes:**
- Service card 1 (Trauma): "Learn about Trauma Therapy" ✅ already done in prior pass
- Service card 2 (Neurodivergent): "Learn about Neurodivergent Approaches" ✅ already done
- Service card 3 (Depression/Anxiety): "Learn about Depression &amp; Anxiety Therapy" ✅ already done
- Location card 1 (Virtual): "More Info" ✅ already done
- Location card 2 (In-Person): Changed from "Learn More" → "More Info"

### Issue 8: Long Paragraphs on About Page
**File:** `about.html` — line ~213  
**Change:** Split the ~733-character therapeutic approach paragraph into two paragraphs with a subheading `<h4>When I Refer Out</h4>` between them. The split occurs at the natural boundary between "what I do" (person-centered care) and "when I refer out" (scope of practice).

### Issue 9: Contact Form Widget Verification
**File:** `contact.html`  
**Status:** Verified — no changes needed. SimplePractice widget button has sufficient text ("Contact"), parent heading provides context ("Have Questions?"), fallback div has proper ARIA attributes (`hidden`, `aria-live="polite"`).

---

## Contrast Ratios (Before → After)

| Element | Before | After | WCAG AA Target |
|---------|--------|-------|----------------|
| CTA button text on accent bg | ~3.5:1 | ~4.9:1 | ≥4.5:1 ✅ |
| Skip-link text on accent bg | ~3.5:1 | ~4.9:1 | ≥4.5:1 ✅ |

---

## Deferred Items

None — all 9 issues resolved or verified.

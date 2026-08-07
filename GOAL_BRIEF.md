**Objective:** Fix all 9 UI/UX and accessibility issues identified in the production audit of papercranewellness-upgrade to achieve WCAG AA compliance, improve SEO with structured data, and polish UX consistency across all pages.

**Read first:** `tests/production-audit-report.md`, `src/tokens.css`, `src/global.css`, `src/components/Footer.css`

**Constraints:**
- Do not change the brand identity — green accent must remain sage-green; only darken enough for contrast (target ≥4.5:1 ratio).
- Do not add new dependencies, frameworks, or external services.
- Preserve all existing navigation structure, booking CTAs, SimplePractice widget on contact.html, and legal page links.
- Do not modify the navbar component or its JavaScript behavior.
- Do not refactor unrelated CSS or HTML. Work only on the files listed below.

**Validate:** `npx playwright test tests/production-verify.spec.js` after each change to ensure no regressions. Also visually verify by opening key pages in a browser (`open index.html`, etc.).

**Document:** Write concise, targeted documentation for all changes — create new `.md` files or update existing docs as needed.

**Checkpoints:** work in checkpoints and log progress briefly

**Stop when:** all 9 issues below are resolved AND production tests pass with zero regressions, OR when a change requires human/product input (e.g., social media account URLs not provided).

---

## Detailed Plan — Execute in Priority Order

### Issue 1 (High): Psychology Today Seal Missing Accessible Label
**Files:** `index.html`, `about.html`, `faq.html`, `types-of-therapy.html`
**Current code pattern:** `<a href="https://www.psychologytoday.com/profile/956010" class="sx-verified-seal"></a>` (empty anchor, no aria-label)
**Fix:** Add `aria-label="Verified on Psychology Today"` to each `<a class="sx-verified-seal">` element. If an `<img>` exists inside the anchor in any file, also add `alt="Psychology Today Verified Provider"`.

### Issue 2 (High): Skip-to-Content Link Contrast
**Files:** `src/global.css`, verify HTML in all pages
**Current state:** The skip-link HTML (`<a class="skip-link" href="#main-content">Skip to main content</a>`) exists on every page. The CSS hides it visually and shows on focus, but the white-on-green text contrast is ~3.50:1 (fails WCAG AA).
**Fix:** In `src/global.css`, change the `.skip-link` color from `#fff` to a lighter shade that achieves ≥4.5:1 against `--color-accent` (#7E8F63), OR darken the accent for this specific element. A good option is using `color: #FFFFFF` with a darker background on focus, or changing text to `#F0F4EE` (the alt bg color) which has higher contrast. Also ensure `.skip-link:focus` maintains the same high-contrast text color. The visual-hidden state (`top: -9999px`) is correct — keep it.

### Issue 3 (High): Green CTA Button Contrast
**Files:** `src/tokens.css`, `src/global.css`
**Current code:** `--color-accent: #7E8F63` with white text (`#ffffff`) on `.btn--primary` = ~3.5:1 ratio, fails WCAG AA (needs ≥4.5:1).
**Fix:** Update `--color-accent` in `src/tokens.css` from `#7E8F63` to a darker green like `#6B7C54` (which gives ~4.9:1 against white) or `#6A7B52`. Also update `--color-accent-hover` accordingly (e.g., from `#5F7048` to `#556342`). Verify that the hover state still has sufficient contrast and doesn't look too dark. If this global change causes visual issues elsewhere, use a component-specific override in `.btn--primary` instead.

### Issue 4 (Medium): JSON-LD Structured Data
**Files:** `index.html`, `about.html`, `contact.html`
**Fix:** Add a `<script type="application/ld+json">` block inside the `<head>` of each page with `LocalBusiness` schema containing:
- name: "Paper Crane Wellness LLC"
- url: "https://papercranewellness.com" (or pages.dev URL)
- telephone: "+1-843-256-2016"
- email: "concierge@papercranewellness.com"
- address: 1007 Johnnie Dodds Blvd Suite 129, Mount Pleasant, SC 29464
- geo with latitude/longitude (use approximate coords for Mt Pleasant, SC: 32.7960, -79.8621)
- openingHours: Mo-Fr 09:00-17:00
- sameAs: [Psychology Today profile URL]
- serviceArea: South Carolina
- medicalSpecialty: "Psychology" or "MentalHealth"

### Issue 5 (Medium): Print Stylesheet
**Files:** `src/global.css`
**Fix:** Add a `@media print` block at the end of `src/global.css` with rules to:
- Hide `.navbar`, `.footer`, `.booking-section`, `.skip-link`, `.spwidget-button-wrapper`, any CTAs/buttons (`.btn`)
- Show only main content (`main`, `.section`)
- Set text color to black, remove backgrounds
- Ensure links show their href in parentheses after the link text: `a[href]::after { content: " (" attr(href) ")"; }`
- Remove shadows and set appropriate page margins

### Issue 6 (Low/Med): Social Media Links in Footer
**Files:** `src/components/Footer.css`, all HTML files with footers
**Fix:** Add a social media links section to the footer. Since no specific social media account URLs were provided by the practice, add placeholder links with a comment noting they should be updated:
```html
<!-- TODO: Replace # with actual social media URLs -->
<div class="footer__social">
  <a href="#" aria-label="Facebook" target="_blank" rel="noopener">Facebook</a>
  <a href="#" aria-label="Instagram" target="_blank" rel="noopener">Instagram</a>
  <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener">LinkedIn</a>
</div>
```
Add corresponding CSS in `Footer.css` for `.footer__social` with horizontal layout and appropriate spacing. If the audit shows no social accounts exist, this can be deferred — add a TODO comment instead.

### Issue 7 (Low): Duplicate "Learn More" Links on Home Page
**Files:** `index.html`
**Current state:** Five `<a>` elements with text "Learn More" all link to `types-of-therapy.html`:
- Line ~284: `.service-card__link` — Individual Therapy for Trauma card
- Line ~297: `.service-card__link` — Neurodivergent Affirming Approaches card
- Line ~310: `.service-card__link` — Therapy for Depression and Anxiety card
- Line ~490: `.location-card__link` — Virtual (Online Throughout South Carolina) card
- Line ~500: `.location-card__link` — In-Person (Mount Pleasant, SC) card

**Fix:** Since no dedicated service pages exist yet, change the link text to be descriptive instead of redirecting URLs. Update each "Learn More" to:
- Card 1: "Learn about Trauma Therapy"
- Card 2: "Learn about Neurodivergent Approaches"
- Card 3: "Learn about Depression & Anxiety Therapy"
- Location cards: Keep as-is or change to "View Details" / "More Info" since they describe locations not services

### Issue 8 (Low): Long Paragraphs on About Page
**Files:** `about.html`
**Current state:** Three paragraphs exceed 500 characters:
- Line 173: ~663 chars — background/education
- Line 174: ~526 chars — specialties focus
- Line 175: ~733 chars — therapeutic approach (longest)

**Fix:** Split line 175 (~733 chars, about therapeutic approach) into two paragraphs with a subheading. The paragraph covers EMDR/PE/ACT/CPT techniques AND referral philosophy — split at the natural boundary between "what I use" and "when I refer out." Add an `<h4>` or `<h3 class="about-sub-heading">` between them like "My Approach & When I Refer Out". Keep lines 173-174 as-is since they're borderline acceptable.

### Issue 9 (Low): Contact Form — Verify Widget Accessibility
**Files:** `contact.html`
**Current state:** A SimplePractice contact form widget is embedded via script (`integration-1.0.js`) with a fallback `<div hidden>` showing mailto/tel links if the widget fails to load. The audit flagged "no form" but this was likely because it looked for standard `<form>` tags.

**Fix:** Verify that:
1. The SimplePractice widget button has an `aria-label` or sufficient text content (it says "Contact" which is adequate)
2. The fallback div (`booking-widget-fallback`) has proper ARIA attributes — it already has `hidden` and `aria-live="polite"` ✓
3. No changes needed unless the widget itself lacks accessibility attributes in its rendered output

If the widget renders without accessible labels, add a visually-hidden heading or aria-describedby to clarify the form purpose. Otherwise, mark this as verified — no code change required.

---

## Do Not
- Delete, skip, weaken, or narrow tests to make the goal pass.
- Refactor unrelated code.
- Add dependencies.
- If social media URLs are needed for Issue 6 and none are provided, pause and ask before proceeding with placeholder links.

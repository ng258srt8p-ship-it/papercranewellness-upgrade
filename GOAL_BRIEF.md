**Objective:** Fix all UI/UX gaps identified in the production audit of papercranewellness-upgrade to achieve consistent navigation, complete CTAs, valid HTML structure, and clean markup across all 12 pages.

**Read first:** `plan/ui-ux-fixes.md`, `src/tokens.css`, `src/global.css`, `tests/production-audit-report.md`

**Constraints:**
- Do not change the brand identity — green accent must remain sage-green (#6B7C54); do not modify tokens.css color values.
- Do not add new dependencies, frameworks, or external services.
- Preserve all existing navigation structure, booking CTAs, SimplePractice widget on contact.html, and legal page links.
- Do not refactor unrelated CSS or HTML. Work only on the files listed below.
- Do not modify the navbar component JavaScript (nav.js) or its behavior.
- Do not change the Psychology Today seal script or badge — only remove the `<center>` wrapper tags.

**Validate:** `npx playwright test tests/production-verify.spec.js` after each phase to ensure zero regressions. Also visually verify by opening key pages in a browser (`open index.html`, etc.).

**Document:** Write concise, targeted documentation for all changes — create new `.md` files or update existing docs as needed.

**Checkpoints:** work in checkpoints and log progress briefly

**Stop when:** all issues below are resolved AND production tests pass with zero regressions, OR when a change requires human/product input (e.g., social media account URLs not provided).

---

## Detailed Plan — Execute in Priority Order

### Phase 1: Critical Fix

#### H1: Fix 404.html Broken HTML Structure
**Files:** `404.html`
**Issue:** Two `</header>` closing tags (lines 97 and 112). A stray CTA button + orphaned `</div></header>` appears after the mobile menu nav closes, breaking header nesting.
**Fix:** Remove lines 108–112 (`</div>\n  </header>`) that appear after `<nav class="navbar__mobile-menu">...</nav>`. The correct structure: mobile menu nav closes → `</main>` opens.

### Phase 2: Consistency Fixes (High Impact)

#### M1 + L5: Standardize Footer Navigation — Add Missing Links
**Files:** All 12 HTML pages (`index.html`, `about.html`, `contact.html`, `faq.html`, `404.html`, `individual-therapy-for-adults.html`, `neurodivergent-affirming-therapy.html`, `trauma-ptsd-emdr-and-prolonged-exposure-therapy.html`, `types-of-therapy.html`, `privacy-policy.html`, `cookies-policy.html`, `acceptable-use-policy.html`, `no-surprises-act.html`)
**Issue:** Footer nav "Links" column is inconsistent. Every page should show 5 items: Home, About, FAQ, Contact, Book Now.

| Page | Missing Links |
|------|---------------|
| `about.html` | Book Now |
| `contact.html` | Book Now |
| `faq.html` | Contact, Book Now |
| `404.html` | FAQ, Book Now |
| All other pages (service + legal) | Book Now |

**Fix:** Add missing `<li><a href="...">...</a></li>` entries to each page's footer nav section. The "Book Now" link: `<li><a href="https://papercranewellness.clientsecure.me/request" data-booking-modal>Book Now</a></li>`.

#### M2: Add CTA Banner to Pages Missing It
**Files:** `contact.html`, `privacy-policy.html`, `cookies-policy.html`, `acceptable-use-policy.html`, `no-surprises-act.html`
**Issue:** These pages have no call-to-action at the bottom of content — dead ends for scrolling users. 404.html intentionally excluded (error page).

**Fix:** Add this CTA banner section before the `<footer>` tag on each listed page:
```html
    <!-- CTA BANNER -->
    <section class="cta-banner" aria-label="Call to action">
      <div class="cta-banner__inner" data-reveal>
        <h2 class="cta-banner__heading">Ready to start your journey?</h2>
        <p class="cta-banner__body">Book a free 15-minute consultation and let's see if we're a good fit.</p>
        <a href="https://papercranewellness.clientsecure.me/request" class="btn btn--secondary" data-booking-modal>Book a Free 15 Minute Consultation</a>
      </div>
    </section>
```

For legal pages, use the same CTA banner — users reading privacy/cookies may be evaluating trust and could convert.

#### M3: Add Missing Scripts to Legal Pages
**Files:** `privacy-policy.html`, `cookies-policy.html`, `acceptable-use-policy.html`, `no-surprises-act.html`
**Issue:** These pages are missing `<script src="src/js/booking-modal.js" defer></script>` and `<script src="src/js/scroll-reveal.js" defer></script>`. Content sections use `[data-reveal]` attributes but animations won't trigger without the JS.

**Fix:** Add both script tags before `</body>` on each page, alongside any existing scripts:
```html
  <script src="src/js/nav.js" defer></script>
  <script src="src/js/scroll-reveal.js" defer></script>
  <script src="src/js/booking-modal.js" defer></script>
```

### Phase 3: Polish (Low Risk)

#### L1: Remove Deprecated `<center>` Tags
**Files:** `index.html`, `about.html`, `faq.html`, `types-of-therapy.html`
**Issue:** Psychology Today seal is wrapped in deprecated `<center>` HTML element.
**Fix:** Simply remove the opening `<center>` and closing `</center>` tags around the seal. The `.footer__trust-badges` CSS already has `justify-content: center` — it will remain centered without the `<center>` tag.

#### L2: Deduplicate OG Meta Tags
**Files:** `index.html`, `about.html`, `contact.html`, `individual-therapy-for-adults.html`, `neurodivergent-affirming-therapy.html`, `trauma-ptsd-emdr-and-prolonged-exposure-therapy.html`, `types-of-therapy.html`
**Issue:** Several pages define OG meta tags twice in `<head>`, creating redundant markup.

**Fix:** Consolidate to a single set of 8 OG meta tags per page, placed after the canonical link and before Google Fonts preconnect:
```html
  <!-- Open Graph -->
  <meta property="og:type"        content="website" />
  <meta property="og:title"       content="[Page Title]" />
  <meta property="og:description" content="[Description]" />
  <meta property="og:url"         content="[Canonical URL]" />
  <meta property="og:image"       content="https://www.papercranewellness.com/src/assets/images/logo.webp" />
  <meta property="og:image:alt"   content="Paper Crane Wellness LLC Logo" />
  <meta property="og:locale"      content="en_US" />
  <meta property="og:site_name"   content="Paper Crane Wellness LLC" />
```

#### L3: Fix Undefined CSS Variables in Inline Styles
**Files:** `faq.html`, `404.html`
**Issue:** Inline `<style>` blocks reference undefined CSS custom properties:
- `--color-text-secondary` → replace with `var(--color-text-muted)` (defined in tokens.css)
- `--leading-relaxed` → replace with `var(--leading-normal)` (defined in tokens.css)
- `--text-3xl` → replace with `2.5rem` or use a custom value since no equivalent exists

**Fix:** In `faq.html`: change `.faq-answer { color: var(--color-text-secondary); line-height: var(--leading-relaxed); }` to use defined variables.
In `404.html`: change `.error-title { font-size: var(--text-3xl); ... }` to `font-size: 2.5rem;`.

#### L4: Break Up Long About Page Paragraphs (Readability)
**Files:** `about.html`
**Issue:** Two paragraphs exceed ~500 characters, hurting scanability:
- Para 1 (643 chars): "I'm an avid audiobook listener..." — covers education + experience
- Para 2 (506 chars): "I specialize in working with folks..." — covers specializations

**Fix:** Break the longest paragraph (643 chars) into two shorter paragraphs with a subheading:
```html
            <p>I'm an avid audiobook listener, Game of Thrones enthusiast, and therapist who has experienced the therapeutic path from both sides of the couch.</p>
            <h4>Education &amp; Experience</h4>
            <p>As a Clinical Social Worker in South Carolina...</p>
```

---

## Notes & Decisions

1. **Social media links (`href="#"`)**: Placeholder links on all 12 pages. Deferred — needs human input for real URLs. Do not modify these.
2. **404.html CTA banner**: Intentionally excluded — error page, no conversion path expected.
3. **Blog page** (`blog/index.html`): Already has complete footer nav and CTA banner. No changes needed.

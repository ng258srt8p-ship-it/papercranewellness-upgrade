# Goal-Loop Plan: Contact Page Booking Modal + Submit Button Styling (Definitive Fix)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.
> **Execution Mode:** Goal-loop — each loop's exit gates MUST pass before proceeding to the next. Save evidence artifacts after each loop. `todo` tool tracks loop progress.

**Goal:** Clicking "Book a Free 15 Minute Consultation" opens a modal embedding the SimplePractice OAR widget (with working autobind + iframe). Clicking "Contact" opens the SimplePractice native contact-form modal. The Contact button matches the Book button style. The contact section has no white container box wrapping the button.

**Architecture:** We restore the *exact* approach that works on production — `booking-modal.js` + `BookingModal.css` + `data-booking-modal=""` attributes on Book buttons — then load `integration-1.0.js` *once* so the Contact button's native autobind works. This is NOT a new design; we are making local match production (`papercrane-wellness-v2.pages.dev`) exactly, which is already tested/working.

**Tech Stack:** Vanilla JS, static HTML, CSS custom properties (`tokens.css`), Playwright E2E tests, Cloudflare Pages deploy.

---

## Assessment Summary: Three Environments Compared

Assessment ran via Playwright against all three environments (`tests/assessment.spec.js`, now deleted). Key findings:

### Issue 1 — Book button modal behavior

| Field | Production (✅ working) | Reference (✅ working) | Local (❌ BROKEN) |
|-------|------------------------|------------------------|-------------------|
| Book button HTML attr | `data-booking-modal=""` (NO spwidget attrs) | `data-booking-modal=""` (NO spwidget attrs) | `data-spwidget-*="OAR"` — no `data-booking-modal` |
| Book button JS loaded | `booking-modal.js` ✅ | `booking-modal.js` ✅ | `modal.js` (NO-OP stub) ❌ |
| `integration-1.0.js` loaded | ✅ (one tag in head) | ✅ (auto-injected) | ❌ (none — tests forbid it) |
| Click result | `.booking-modal` opens, SP iframe renders inside | `.spwidget--overlay` opens, SP iframe renders | **Navigates away** to `https://papercranewellness.clientsecure.me/request/service` |

**Root cause of local breakage:** Commit `bceb787` ("Complete SimplePractice widget integration") deleted the working `booking-modal.js`, deleted `BookingModal.css`, stripped `data-booking-modal` attributes, and replaced them with `data-spwidget-*` attributes — but never loaded `integration-1.0.js` on the page. The SP script was intentionally excluded because tests (`buttons.spec.js` line 256–274) forbid it. Net effect: the Book buttons have data attributes for a script that isn't loaded, and the custom modal was deleted — so nothing handles the click; the browser just navigates away.

### Issue 2 — Contact submit button

| Field | Production | Reference | Local |
|-------|------------|-----------|-------|
| Contact button HTML | `class="spwidget-button spwidget-contact-form"` with all autobind attrs ✅ | `class="spwidget-button btn--primary"` with all autobind attrs ✅ | `class="spwidget-button btn--primary"` with all autobind attrs ✅ |
| `integration-1.0.js` | ✅ loaded → native autobind opens `.spwidget--overlay` | ✅ loaded → native autobind opens overlay | ❌ NOT loaded → clicking does nothing |
| Computed `border-radius` | `0px` (吸引了 deviation from Book) | `4px` ✅ matches Book | `4px` ✅ matches Book |
| Computed `padding` | `12px 32px` (32px vs Book's 24px) | `12px 24px` ✅ matches Book | `12px 24px` ✅ matches Book |
| Parent wrapper `.booking-widget-wrap` | Present — `background: var(--color-bg-primary)` (WHITE BOX) ❌ | Present — WHITE BOX ❌ | NOT present — already removed ✅ |
| `.spwidget-button-wrapper` parent | transparent ✅ | transparent ✅ | transparent ✅ |

**Local state is already correct for Issue 2 styling** — Contact button matches Book button (4px radius, 12px 24px padding, sage bg). The white box `.booking-widget-wrap` was already removed locally. The ONLY thing missing for the Contact button to WORK is loading `integration-1.0.js` — same as Issue 1.

---

## Decision: Two separate mechanisms (both proven on production)

1. **Book buttons** → custom `.booking-modal` overlay (the deleted `booking-modal.js` + `BookingModal.css`). This is how production works. The script intercepts `[data-booking-modal]` clicks, builds a modal with a `#simplepractice-widget-container` DIV carrying SP attributes, and lazily injects `integration-1.0.js` *once* into `<head>`. SP autobind scans the container, creates the `.spwidget--overlay` + iframe inside the modal. No `<style>`/.spwidget-button/.spwidget-button-wrapper snippet is needed — SP autogenerates the widget markup on the container DIV.

2. **Contact button** → native SP autobind, same as production. Requires `integration-1.0.js` loaded *in the page* and `data-spwidget-autobind=""` on the anchor. Since `booking-modal.js` loads the SP script into `<head>` on first Book button click, we also load it once at page load so the Contact button works without a prior Book click.

### Why restore the deleted `booking-modal.js` instead of the user's `<style>`/snippet approach

The user's spec includes the SP `<style>` + `.spwidget-button-wrapper` + anchor + `<script>` snippet. This is the SimplePractice "paste this snippet" pattern for *inline embedded widgets* — it produces a small "Request Appointment" hyperlink that opens SP's own `.spwidget--overlay`. However:

- Matching production's `booking-modal.js` pattern is what's already tested and working in prod.
- The snippet's `<script src="integration-1.0.js">` can't be safely re-injected on every modal open (SP detects double-loading and warns).
- The `booking-modal.js` pattern gives us a styled overlay *we* control (close button, focus trap, mobile bottom-sheet).

We still embed the exact SP widget **attributes** from the user's snippet (scope-id, scope-uri, application-id, type=OAR, scope-global, autobind) — just on a DIV container inside our modal rather than on an `<a>` tag with the `<style>` block. This is functionally equivalent and is what production does.

---

## DoD Gate Table (machine-verifiable — every gate is a Playwright assertion or shell command)

> The Gates are not "nice to have" — Loop N+1 does NOT start until every gate in Loop N exits green. Evidence is the raw Playwright output saved to `.hermes/audit-evidence/`.

| Gate ID | Gate | Verification | Pass Condition |
|---------|------|--------------|----------------|
| **L1.G1** | `booking-modal.js` restored from production (byte-identical to prod) | `curl -s https://papercrane-wellness-v2.pages.dev/src/js/booking-modal.js > /tmp/prod-bm.js && diff src/js/booking-modal.js /tmp/prod-bm.js` | exit 0 (no diff) |
| **L1.G2** | `BookingModal.css` restored from production | `curl -s https://papercrane-wellness-v2.pages.dev/src/components/BookingModal.css > /tmp/prod-bm.css && diff src/components/BookingModal.css /tmp/prod-bm.css` | exit 0 (no diff) |
| **L1.G3** | `modal.js` reverted to content matching production (no-op is fine — it's unused) OR deleted | `test ! -f src/js/modal.js \|\| ! grep -q 'attach\|interceptor\|inject' src/js/modal.js` | exit 0 |
| **L2.G1** | All 13 HTML pages load `booking-modal.js` (defer) | Playwright: for each page, `script[src*="booking-modal"]` count ≥ 1 | all 13 pass |
| **L2.G2** | All Book buttons have `data-booking-modal=""` (not only spwidget attrs) | Playwright: `a:has-text("Book a Free"):not([data-booking-modal])` count == 0 on every page | all pages count 0 |
| **L2.G3** | `BookingModal.css` linked in every page `<head>` | Playwright: `link[href*="BookingModal.css"]` count ≥ 1 on every page | all 13 pass |
| **L2.G4** | `integration-1.0.js` loaded ONCE in page (for Contact native autobind) | Playwright: `script[src*="integration-1.0"]` count == 1 on contact.html | count == 1 |
| **L2.G5** | Contact button retains autobind attrs | Playwright: `a[data-spwidget-type="Contact form"]` has `data-spwidget-autobind` | attr present |
| **L3.G1** | Clicking Book button opens `.booking-modal.is-open` | Playwright: click `.navbar__cta:has-text("Book a Free")` → `.booking-modal.is-open` visible | `isVisible()` true |
| **L3.G2** | Modal contains SP widget container | Playwright: `#simplepractice-widget-container[data-spwidget-type="OAR"]` visible inside `.booking-modal` | count ≥ 1 |
| **L3.G3** | SP iframe renders inside modal (eventually) | Playwright: wait 5s → `.booking-modal iframe` visible, `offsetWidth > 100` | width > 100 |
| **L3.G4** | Esc closes the modal | Playwright: press Escape → `.booking-modal` NOT `.is-open` | not visible |
| **L3.G5** | Backdrop click closes modal | Playwright: click `.booking-modal__backdrop` → NOT `.is-open` | not visible |
| **L3.G6** | Close button closes modal | Playwright: click `.booking-modal__close` → NOT `.is-open` | not visible |
| **L3.G7** | Clicking Contact button opens native SP overlay | Playwright: click `.spwidget-button[data-spwidget-type="Contact form"]` → `.spwidget--overlay` visible within 5s | visible |
| **L3.G8** | No console errors from our scripts (SP's own ember warning is fine) | Playwright: console errors excluding `ember-fastboot` | 0 |
| **L4.G1** | Contact button computed style == Book button style | Playwright: computed `bg`, `color`, `border`, `borderRadius`, `padding` equal between `.booking-section .spwidget-button` and `.navbar__cta.btn--primary` | all 5 match |
| **L4.G2** | No `.booking-widget-wrap` white box around contact button | Playwright: `.booking-section .booking-widget-wrap` count == 0 | count 0 |
| **L4.G3** | Contact button wrapper transparent, no shadow | Playwright: `.booking-section .spwidget-button-wrapper` computed `background-color` in {transparent, rgba(0,0,0,0)} && `box-shadow: none` | both true |
| **L4.G4** | No `.booking-widget-fallback` dead container | Playwright: `.booking-widget-fallback` count == 0 on contact.html | count 0 |
| **L5.G1** | All previously-passing tests still pass (no regression) | `npx playwright test --config playwright.config.js tests/buttons.spec.js` | exit 0 |
| **L5.G2** | New modal tests pass | `npx playwright test --config playwright.config.js tests/contact-page-fixes.spec.js` | exit 0 |
| **L5.G3** | Full local suite green | `npx playwright test --config playwright.config.js` | exit 0 |
| **L6.G1** | Production URL fetches contact page with modal scripts | `curl -s https://papercrane-wellness-v2.pages.dev/contact \| grep -c booking-modal.js` | ≥ 1 |
| **L6.G2** | E2E on production: Book button opens modal | Playwright (live config) on production URL: `.booking-modal.is-open` visible after click | visible |
| **L6.G3** | E2E on production: Contact button opens SP overlay | Playwright (live config) on production URL: `.spwidget--overlay` visible after click | visible |

---

## Loop 1: Restore production-identical booking-modal.js + BookingModal.css

**Objective:** Clone the exact files that work on production into the local repo. Zero deviation — we know these work.

### Task 1.1: Restore `src/js/booking-modal.js` from production

**Action:** `curl -s https://papercrane-wellness-v2.pages.dev/src/js/booking-modal.js > src/js/booking-modal.js`

**Verify (L1.G1):** `diff src/js/booking-modal.js <(curl -s https://papercrane-wellness-v2.pages.dev/src/js/booking-modal.js)` → exit 0.

### Task 1.2: Restore `src/components/BookingModal.css` from production

**Action:** `curl -s https://papercrane-wellness-v2.pages.dev/src/components/BookingModal.css > src/components/BookingModal.css`

**Verify (L1.G2):** `diff src/components/BookingModal.css <(curl -s https://papercrane-wellness-v2.pages.dev/src/components/BookingModal.css)` → exit 0.

### Task 1.3: Silence the no-op `modal.js`

**Action:** Either delete `src/js/modal.js` and remove its `<script>` tags from any HTML page that still references it, OR keep it as a no-op (production never references it). Check `grep -l "modal.js" *.html` — if none, leave the file alone. If any page still has `<script src="src/js/modal.js">`, remove that tag (booking-modal.js supersedes it).

**Verify (L1.G3):** No HTML page loads both `modal.js` AND `booking-modal.js` (avoid double-handling).

### Loop 1 Exit Gate

Run: `diff src/js/booking-modal.js <(curl -s https://papercrane-wellness-v2.pages.dev/src/js/booking-modal.js) && diff src/components/BookingModal.css <(curl -s https://papercrane-wellness-v2.pages.dev/src/components/BookingModal.css) && grep -rL "booking-modal.js" $(ls *.html | head -1) >/dev/null && echo "L1 PASS"`

Save evidence: `git diff --stat src/js/booking-modal.js src/components/BookingModal.css > .hermes/audit-evidence/L1-restore.diff`

---

## Loop 2: Wire booking-modal.js + integration-1.0.js into all HTML pages

**Objective:** Every page with a "Book a Free" button must (a) load `booking-modal.js` + `BookingModal.css`, (b) carry `data-booking-modal=""` on every Book button, (c) load `integration-1.0.js` once in the page (for the Contact button's native autobind).

### Task 2.1: Batch-update all 13 HTML pages

Use `execute_code` with a Python script. For each `*.html`:

1. **In `<head>`**, after the last `<link rel="stylesheet" href="src/components/...">` line, insert `<link rel="stylesheet" href="src/components/BookingModal.css">` (if not already present).
2. **Before `</body>`**, after the last `<script src="src/js/...">` tag, insert `<script src="src/js/booking-modal.js" defer></script>` (if not already present).
3. **Before `</body>`**, insert `<script src="https://widget-cdn.simplepractice.com/assets/integration-1.0.js"></script>` (if not already present) — exactly ONE instance.
4. **For every `<a>` whose text matches `Book a Free 15 Minute Consultation`**: set/add `data-booking-modal=""` attribute (preserve the existing `href` and classes). Remove any `data-spwidget-*` attributes on these Book buttons ONLY (the Contact button keeps its `data-spwidget-*`).

**Pseudocode (Python):**
```python
import re, pathlib
for p in pathlib.Path('.').glob('*.html'):
    html = p.read_text()
    # 1. BookingModal.css link
    if 'BookingModal.css' not in html:
        html = re.sub(r'(<link rel="stylesheet" href="src/components/[^"]*">\s*(?=\n))',
                      r'\1<link rel="stylesheet" href="src/components/BookingModal.css">\n',
                      html, count=1)
    # 2. booking-modal.js script before </body>
    if 'booking-modal.js' not in html:
        html = html.replace('</body>',
          '<script src="src/js/booking-modal.js" defer></script>\n  </body>', 1)
    # 3. integration-1.0.js once
    if 'integration-1.0.js' not in html:
        html = html.replace('</body>',
          '<script src="https://widget-cdn.simplepractice.com/assets/integration-1.0.js"></script>\n  </body>', 1)
    # 4. Book button attrs
    def fix_book_btn(m):
        tag = m.group(0)
        if 'Book a Free 15 Minute Consultation' not in tag: return tag
        tag = re.sub(r'\s*data-spwidget-[a-z-]+(?:="[^"]*")?', '', tag)  # strip SP attrs from Book buttons
        if 'data-booking-modal' not in tag:
            # add right before the '>' (or before the closing '>' of opening tag)
            tag = re.sub(r'>\s*Book a Free', 'data-booking-modal="">Book a Free', tag)
        return tag
    html = re.sub(r'<a[^>]*>Book a Free 15 Minute Consultation</a>', fix_book_btn, html)
    p.write_text(html)
```

**Verify (L2.G1, G2, G3, G4, G5):** Playwright assertions on every page.

### Loop 2 Exit Gate

Run a Playwright spec that, for each of the 13 pages, counts `script[src*="booking-modal"]`, `link[href*="BookingModal"]`, `script[src*="integration-1.0"]`, `a:has-text("Book a Free"):not([data-booking-modal])` (must be 0), and on contact.html verifies the Contact `data-spwidget-autobind` attr. All must pass.

Save evidence: `npx playwright test --config playwright.config.js --reporter=list > .hermes/audit-evidence/L2-wiring.txt 2>&1`

---

## Loop 3: Verify modal opens on Book click + Contact opens native SP overlay

**Objective:** Prove the click→modal flow works in a real browser.

### Task 3.1: Start local server

`python3 -m http.server 9092 &` (or pick a free port). Health-check with `curl`.

### Task 3.2: Write/extend the `contact-page-fixes.spec.js` test file with modal interaction tests

Append to `tests/contact-page-fixes.spec.js`:

```javascript
test.describe('Booking modal integration (restored from production)', () => {
  test('clicking Book button opens booking modal with SP widget container', async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/contact.html');
    await page.locator('.navbar__cta:has-text("Book a Free")').first().click();
    await expect(page.locator('.booking-modal.is-open')).toBeVisible();
    await expect(page.locator('#simplepractice-widget-container[data-spwidget-type="OAR"]')).toHaveCount(1);
    // SP iframe eventually renders inside the modal
    const iframe = page.locator('.booking-modal iframe');
    await expect(iframe).toBeVisible({ timeout: 10000 });
    // Ignore SP's own ember-fastboot warning
    const realErrors = errors.filter(e => !e.includes('ember-fastboot'));
    expect(realErrors).toEqual([]);
  });

  test('Esc closes booking modal', async ({ page }) => {
    await page.goto('/contact.html');
    await page.locator('.navbar__cta:has-text("Book a Free")').first().click();
    await expect(page.locator('.booking-modal.is-open')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.booking-modal.is-open')).toHaveCount(0);
  });

  test('backdrop click closes booking modal', async ({ page }) => {
    await page.goto('/contact.html');
    await page.locator('.navbar__cta:has-text("Book a Free")').first().click();
    await page.locator('.booking-modal__backdrop').click();
    await expect(page.locator('.booking-modal.is-open')).toHaveCount(0);
  });

  test('close button closes booking modal', async ({ page }) => {
    await page.goto('/contact.html');
    await page.locator('.navbar__cta:has-text("Book a Free")').first().click();
    await page.locator('.booking-modal__close').click();
    await expect(page.locator('.booking-modal.is-open')).toHaveCount(0);
  });

  test('Contact button opens native SP overlay', async ({ page }) => {
    await page.goto('/contact.html');
    await page.locator('a[data-spwidget-type="Contact form"]').first().click();
    await expect(page.locator('.spwidget--overlay')).toBeVisible({ timeout: 10000 });
  });

  test('index.html hero Book button opens modal', async ({ page }) => {
    await page.goto('/');
    // Hero CTA is the first .btn--primary inside <main>
    const hero = page.locator('main a:has-text("Book a Free 15 Minute Consultation")').first();
    await hero.click();
    await expect(page.locator('.booking-modal.is-open')).toBeVisible();
  });
});
```

**Verify (L3.G1–G8):** Run this spec — all tests must pass.

### Loop 3 Exit Gate

`npx playwright test --config playwright.config.js tests/contact-page-fixes.spec.js -g "Booking modal integration" --reporter=list` → all green.

Save evidence: copy the `--reporter=list` output to `.hermes/audit-evidence/L3-modal.txt`.

---

## Loop 4: Contact button styling match + wrapper cleanup

**Objective:** Confirm Issue 2 — Contact button matches Book button style and no white box.

### Task 4.1: Remove `.booking-widget-fallback` from contact.html

Verify it's still present; if so `patch` it out. If already removed (local repo already removed it), skip.

**Verify (L4.G4):** `grep -c booking-widget-fallback contact.html` → 0.

### Task 4.2: Confirm Contact button already matches Book button (local already does)

Per assessment, local Contact button is `bg rgb(126,143,99)`, `border 0px`, `radius 4px`, `padding 12px 24px` — same as Book. **No CSS change needed unless a regression is detected.** If the styling drifts during Loop 2 wiring, patch `src/global.css` `.spwidget-button` to force:
```css
.spwidget-button { border-radius: var(--radius-button); }  /* = 4px */
```

**Verify (L4.G1):** Playwright style-comparison test asserting equal computed `background-color`, `color`, `border-width`, `border-radius`, `padding` between `.booking-section .spwidget-button` and `.navbar__cta.btn--primary`.

### Task 4.3: Confirm no `.booking-widget-wrap` white container

Local already removed it. Verify absence.

**Verify (L4.G2, G3):** Playwright count 0 on `.booking-widget-wrap`, and transparent wrapper assertion.

### Loop 4 Exit Gate

Append to `tests/contact-page-fixes.spec.js`:
```javascript
test.describe('Contact button styling + clean wrapper', () => {
  test('Contact button matches Book button style', async ({ page }) => {
    await page.goto('/contact.html');
    const c = page.locator('.booking-section .spwidget-button').first();
    const b = page.locator('.navbar__cta.btn--primary').first();
    const [cs, bs] = await Promise.all([
      c.evaluate(el => { const s=getComputedStyle(el); return [s.backgroundColor,s.color,s.borderRadius,s.padding].join('|'); }),
      b.evaluate(el => { const s=getComputedStyle(el); return [s.backgroundColor,s.color,s.borderRadius,s.padding].join('|'); }),
    ]);
    expect(cs).toBe(bs);
  });
  test('no white container wraps Contact button', async ({ page }) => {
    await page.goto('/contact.html');
    expect(await page.locator('.booking-section .booking-widget-wrap').count()).toBe(0);
    expect(await page.locator('.booking-widget-fallback').count()).toBe(0);
    const wrap = page.locator('.booking-section .spwidget-button-wrapper').first();
    const styles = await wrap.evaluate(el => {
      const s=getComputedStyle(el); return [s.backgroundColor, s.boxShadow].join('|');
    });
    expect(styles).toMatch(/transparent|rgba\(0,\s*0,\s*0,\s*0\)/);
    expect(styles).toContain('none'); // boxShadow none
  });
});
```

Run it — all green.

Save evidence: `.hermes/audit-evidence/L4-styling.txt`

---

## Loop 5: Full local test suite (no regressions)

**Objective:** Nothing else broke.

### Task 5.1: Update `tests/buttons.spec.js` — remove the obsolete "no integration-1.0.js script" assertions

The `SimplePractice integration script cleanup` describe block (lines 256–274, `pagesWithoutScript` array) forbids the script on 9 pages. This is now wrong — we intentionally load `integration-1.0.js` on every page. **Remove** the entire describe block.

**Verify:** `grep -c "integration-1.0" tests/buttons.spec.js` → 0.

### Task 5.2: Run the full suite

`npx playwright test --config playwright.config.js --reporter=list`

**L5.G1, G2, G3:** exit 0.

Save evidence: `.hermes/audit-evidence/L5-full-suite.txt`

### Loop 5 Exit Gate

All three test files (`buttons.spec.js`, `contact-page-fixes.spec.js`, plus existing `redesign-audit.spec.js`/`content-audit.spec.js` if listed in the main config) pass locally.

---

## Loop 6: Production verification (Cloudflare Pages)

**Objective:** Verify the deployed site (post-`git push`) actually works end-to-end. This is the PROVENANCE gate — local pass is not enough; the live site must demonstrate the behavior.

### Task 6.1: Deploy to Cloudflare Pages

`git add -A && git commit -m "fix: restore booking-modal.js + integration-1.0.js for working consultation modals" && git push`

Cloudflare Pages auto-deploys from `main`. Wait for the build to complete (poll until `curl -s https://papercrane-wellness-v2.pages.dev/src/js/booking-modal.js | head -1` returns the file).

### Task 6.2: Run live E2E

Use `playwright.live.config.js` (set `PLAYWRIGHT_BASE_URL=https://papercrane-wellness-v2.pages.dev`):
```bash
PLAYWRIGHT_BASE_URL=https://papercrane-wellness-v2.pages.dev \
  npx playwright test --config playwright.live.config.js tests/contact-page-fixes.spec.js -g "Booking modal integration" --reporter=list
```

**L6.G1, G2, G3:** exit 0, tests pass.

Save evidence: `.hermes/audit-evidence/L6-production.txt`

### Task 6.3: Manual browser confirmation

Navigate browser to `https://papercrane-wellness-v2.pages.dev/contact`. Click "Book a Free 15 Minute Consultation" — modal opens, SP iframe loads appointment form. Click "Contact" — SP overlay opens contact form. Take screenshots as final proof.

Save evidence: screenshots to `.hermes/audit-evidence/L6-screenshots/`

### Loop 6 Exit Gate

All three production gates pass. The fix is CONFIRMED WORKING on production.

---

## Rollback (if any loop fails irrecoverably)

```bash
# Revert to pre-plan state (the snapshot from session start)
git checkout -- .
git clean -fd  # remove any untracked files created during this plan
# Restore the assessment snapshot files we deleted (if needed)
```

If Loop 1 (restore) somehow fails because production itself is broken: stop, report, and ask the user — the production source itself would be suspect.

---

## Pitfalls (from prior broken attempts — these are WHAT BROKE before)

1. **DO NOT strip `data-spwidget-*` attributes from the Contact button.** The prior fix (`bceb787`) added `data-booking-modal` everywhere — but the Contact button relies on `data-spwidget-autobind` for native SP behavior. Only Book buttons get `data-booking-modal=""`; the Contact button keeps `data-spwidget-type="Contact form"`, `data-spwidget-autobind=""`, etc.

2. **DO load `integration-1.0.js` exactly ONCE per page.** The reference site loads it *twice* (once sync, once async by SP's own loader) — that's OK because SP's loader dedupes. But our scripts must not manually re-inject it. The prior tests forbidding the script were the root cause — removing them is required, not optional.

3. **DO NOT re-inject `integration-1.0.js` on every modal open.** The old `booking-modal.js` uses `loadSimplePracticeWidget()` which checks `getElementById('simplepractice-widget-script')` and only injects on first call — this is correct. Keep the guard.

4. **DO NOT alter `booking-modal.js` or `BookingModal.css` from the production source.** Any deviation risks reintroducing the breakage. If a tweak is needed, do it in a *separate* follow-up loop after Loop 6 confirms parity.

5. **Esc key priority:** The SP native overlay (`.spwidget--overlay`, z-index 999999998/999999999) sits ABOVE our `.booking-modal` (z-index 900). If a user has both open, Esc must close SP's overlay first, then our modal. Our `onKeyDown` checks `if (!modal \|\| modal.hidden) return;` — so it won't close our modal while SP's overlay is showing (SP handles its own Esc). This is already correct in the production `booking-modal.js`.

6. **Focus trap:** `booking-modal.js` implements a Tab focus trap inside the modal — do NOT remove. The prior no-op `modal.js` had none.

7. **CDN caching:** After `git push`, Cloudflare Pages may take ~30–60s to deploy. Do not declare Loop 6 green until `curl https://papercrane-wellness-v2.pages.dev/src/js/booking-modal.js | sha256sum` matches `sha256sum src/js/booking-modal.js` locally — proving the new file is live.

8. **The SimplePractice "ember-fastboot" console error is harmless** — it comes from SP's own widget iframe and appears on production too. Our test asserts only non-ember errors.

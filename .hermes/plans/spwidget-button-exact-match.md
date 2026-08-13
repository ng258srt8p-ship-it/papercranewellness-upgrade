# Fix spwidget-button to Exactly Match papercanewellness.atwebpages.com

## Goal Loop Objective
Make every `.spwidget-button` across all 13 HTML pages look and feel **identical** to the buttons on `http://papercanewellness.atwebpages.com/contact/index.html`.

## Definition of Done (DoD)
Every `.spwidget-button` element must render with these EXACT properties:
- `display: inline-block`
- `padding: 12px 24px`
- `color: #ffffff`
- `background-color: #7E8F63`
- `border: none` (no border at all)
- `border-radius: 4px`
- `font-size: 14px`
- `font-weight: 600`
- `text-decoration: none`
- `transition: background-color 0.2s ease, transform 0.1s ease`
- Hover state: `background-color: #6B7A54`, color stays white
- Active state: `transform: scale(0.98)`

**Verification:** Open each HTML file in browser and visually confirm the button matches the target site exactly. No inline style blocks should remain — all styles centralized in global.css.

## Root Cause Analysis

### Target site (papercanewellness.atwebpages.com/contact/index.html)
The contact page has ONE inline `<style>` block for spwidget buttons:
```css
.spwidget-button-wrapper { text-align: center }
.spwidget-button { display:inline-block; padding:12px 24px; color:#fff; background-color:#7E8F63; border:none; border-radius:4px; font-size:14px; font-weight:600; text-decoration:none; transition:background-color .2s ease, transform .1s ease }
.spwidget-button:hover { background-color:#6B7A54; color:#fff }
.spwidget-button:active { transform:scale(0.98) }
```

### Current broken state across 13 files
Three categories of problems exist:

**Category A — Inline style overrides (WRONG):** `contact.html` has inline CSS with wrong padding (`6px 12px`), no transitions, and a box-shadow on active state. This OVERRIDES global.css.

**Category B — Conflicting class combo:** Files like `about.html`, `index.html`, `no-surprises-act.html`, `privacy-policy.html` use `class="spwidget-button btn--primary"`. The global `.btn` base adds `border: 2px solid transparent` which conflicts with the target's `border: none`.

**Category C — No styling at all:** Files like `404.html`, `acceptable-use-policy.html`, `cookies-policy.html`, `faq.html`, `individual-therapy-for-adults.html`, `neurodivergent-affirming-therapy.html`, `trauma-ptsd-emdr-and-prolonged-exposure-therapy.html`, `types-of-therapy.html` use only `class="spwidget-button"` with no inline style and no `btn--primary`. They fall back to browser defaults or the global `.btn` class if inherited.

## Implementation Plan (3 phases)

### Phase 1: Centralize styles in global.css
**File:** `src/global.css` — add after line 201 (after `.btn--primary:active`)

```css
/* -------------------------------------------------------------------
   SimplePractice Widget Button — matches papercanewellness.atwebpages.com/contact
------------------------------------------------------------------- */

.spwidget-button {
  display: inline-block;
  padding: 12px 24px;
  color: #ffffff;
  background-color: var(--color-accent);
  border: none !important;
  border-radius: var(--radius-button);
  font-size: 0.875rem;    /* 14px */
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.spwidget-button:hover {
  background-color: var(--color-accent-hover);
  color: #ffffff;
}

.spwidget-button:active {
  transform: scale(0.98);
}
```

Key decisions:
- Use `!important` on `border: none` to override the `.btn` base class's `border: 2px solid transparent`
- Use design tokens (`var(--color-accent)`, `var(--radius-button)`) for maintainability — these resolve to exactly `#7E8F63` and `4px` respectively, matching the target

### Phase 2: Remove all inline style blocks from HTML files
Remove inline `<style>` blocks that contain `.spwidget-button` rules. These are in:

**contact.html (line ~157):** Remove this entire inline style block:
```html
<style>.spwidget-button-wrapper{text-align: center}.spwidget-button{display: inline-block;padding: 6px 12px;color: #7E8F63;background: #fff;border: 1px solid #7E8F63;border-radius: 4px;font-size: 14px;font-weight: 600;text-decoration: none}.spwidget-button:hover{background: #7E8F63;color: #ffffff}.spwidget-button:active{color: rgba(255, 255, 255, .75) !important;box-shadow: 0 1px 3px rgba(0, 0, 0, .15) inset}</style>
```

**404.html (line ~19):** Remove the entire `<style>...</style>` block that contains spwidget-related rules.

**faq.html (line ~19):** Remove the entire `<style>...</style>` block that contains spwidget-related rules.

### Phase 3: Clean up conflicting class combos
In files where `class="spwidget-button btn--primary"` appears, remove `btn--primary` since `.spwidget-button` now has all the correct styles and `!important` on border will override any conflict from `.btn`.

Files needing this fix (both classes present):
- `about.html` — 3 occurrences (lines ~135, 155, 195)
- `index.html` — 6 occurrences (lines ~86, 115, 134, 471, 529)
- `no-surprises-act.html` — 2 occurrences (lines ~38, 58)
- `privacy-policy.html` — 2 occurrences (lines ~38, 58)

Files that are already correct (only `.spwidget-button`, no inline style):
- `404.html` — after Phase 2 cleanup
- `acceptable-use-policy.html` — after Phase 2 cleanup
- `cookies-policy.html` — after Phase 2 cleanup
- `faq.html` — after Phase 2 cleanup
- `individual-therapy-for-adults.html` — already correct class
- `neurodivergent-affirming-therapy.html` — already correct class
- `trauma-ptsd-emdr-and-prolonged-exposure-therapy.html` — already correct class
- `types-of-therapy.html` — already correct class

## Subagent Assignments

### Subagent 1: CSS Centralization (global.css)
**Task:** Add the `.spwidget-button` rule block to `src/global.css` after line 201. Use design tokens for colors and radius. Include `!important` on border:none to override .btn base class conflict.

### Subagent 2: Inline Style Removal (3 files)
**Task:** Remove inline `<style>` blocks containing `.spwidget-button` rules from `404.html`, `contact.html`, and `faq.html`. Preserve all other content in those files. For contact.html, remove only the second inline style block (line ~157).

### Subagent 3: Class Cleanup (4 files)
**Task:** Remove `btn--primary` from `class="spwidget-button btn--primary"` across all occurrences in `about.html`, `index.html`, `no-surprises-act.html`, and `privacy-policy.html`. Leave the `spwidget-button` class intact.

## Verification Steps (after all phases)
1. Open each of 13 HTML files in browser
2. Visually confirm every `.spwidget-button` matches target: sage green fill, white text, no border, proper padding, hover darkens, active scales
3. Confirm no inline `<style>` blocks remain that override spwidget styles
4. Run `npm run build` to verify no errors

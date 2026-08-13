# Fix spwidget-button to Match papercanewellness.atwebpages.com

## Problem
The SimplePractice widget buttons (`.spwidget-button`) across all 13 HTML pages have an inconsistent, outdated style:
- White background with sage green text and a 1px border
- Small padding (`6px 12px`)
- No hover/active transitions

The target site at `papercanewellness.atwebpages.com/contact/index.html` uses the correct style:
- **Sage green fill** (`#7E8F63`) with white text
- **Padding:** `12px 24px`
- **No border** (`border: none`)
- **Border radius:** `4px`
- **Font size:** `14px`, weight `600`
- **Hover:** darker sage (`#6B7A54`), white text
- **Active:** `scale(0.98)` transform
- **Transition:** background-color 0.2s ease, transform 0.1s ease

## Root Cause
Each HTML file has its own inline `<style>` block with the old `.spwidget-button` CSS. Some files also add `btn--primary` class which conflicts (the global `.btn--primary` already matches the target style).

## Solution — Two Steps

### Step 1: Add centralized `.spwidget-button` rule to `src/global.css`
Add after the `.btn--primary:active` block (~line 201):

```css
/* -------------------------------------------------------------------
   SimplePractice Widget Button — matches papercanewellness.atwebpages.com
------------------------------------------------------------------- */

.spwidget-button {
  display: inline-block;
  padding: 12px 24px;
  color: #ffffff;
  background-color: var(--color-accent);
  border: none;
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

### Step 2: Remove all inline `.spwidget-button` style blocks from HTML files
Remove the entire `<style>...</style>` block containing `.spwidget-button` rules from these 13 files:

| File | What to remove |
|------|----------------|
| `404.html` | Inline style with `.spwidget-button-wrapper`, `[data-spwidget-scope-id] ~ div`, etc. (~lines 91-125) |
| `about.html` | No inline style — just uses `btn--primary` class (already correct) |
| `acceptable-use-policy.html` | No inline style — just uses `btn--primary` class (already correct) |
| `contact.html` | Inline style with `.spwidget-button-wrapper`, `[data-spwidget-scope-id] ~ div`, etc. (~lines 91-125) |
| `cookies-policy.html` | No inline style — just uses `btn--primary` class (already correct) |
| `faq.html` | Inline style with `.spwidget-button-wrapper`, `[data-spwidget-scope-id] ~ div`, etc. (~lines 140-175) |
| `index.html` | No inline style — just uses `btn--primary` class (already correct) |
| `individual-therapy-for-adults.html` | No inline style — just uses `btn--primary` class (already correct) |
| `neurodivergent-affirming-therapy.html` | No inline style — just uses `btn--primary` class (already correct) |
| `no-surprises-act.html` | No inline style — just uses `btn--primary` class (already correct) |
| `privacy-policy.html` | No inline style — just uses `btn--primary` class (already correct) |
| `trauma-ptsd-emdr-and-prolonged-exposure-therapy.html` | No inline style — just uses `btn--primary` class (already correct) |
| `types-of-therapy.html` | No inline style — just uses `btn--primary` class (already correct) |

**Key insight:** Only 3 files have problematic inline styles: `404.html`, `contact.html`, and `faq.html`. The other 10 files already use the `btn--primary` class which matches the target style.

### Step 3: Clean up remaining inline `.spwidget-button-wrapper` styles
The wrapper styles in `404.html`, `contact.html`, and `faq.html` are fine to keep (they center the button). But remove any `.spwidget-button` rules from those blocks.

## Verification
- Open each HTML file in browser — all "Book a Free 15 Minute Consultation" buttons should match the target site's sage green fill with white text, proper padding, and hover/active states.
- Run `npm run build` to confirm no errors.

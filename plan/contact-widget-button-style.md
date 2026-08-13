# Goal: Style Contact Form Widget Button to Match Primary Button

## Problem Statement

The embedded SimplePractice Contact Form Widget on `contact.html` currently displays with its default blue styling (blue text, transparent background, underlined). The client wants it to match the site's primary button style (`btn btn--primary`) — sage green (#6B7C54) background with white text.

## Root Cause Analysis

### Current Styling (contact.html inline styles):
```css
.spwidget-button {
  color: #1371C8;              /* SimplePractice blue */
  background: transparent !important;
  border: none;
  text-decoration: underline;   /* Looks like a link */
}
```

### Desired Styling (matching `.btn--primary`):
- Background: sage green (#6B7C54 via `var(--color-accent)`)
- Text color: white (#ffffff)
- Padding: 12px 24px
- Border radius: var(--radius-button)
- Hover: darker sage green (var(--color-accent-hover))

### Why Inline Styles?
The SimplePractice widget renders its button inside a `.spwidget-button` element that's created by their JavaScript. We can't add CSS classes to it, so we must override via inline `<style>` block or global CSS with `!important`.

## Solution Plan

### Phase 1: Update Inline Styles in contact.html

**File:** `contact.html`

Replace the current inline style block for `.spwidget-button`:

```html
<style>
  .spwidget-button-wrapper { text-align: center; }
  .spwidget-button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: var(--spacing-1) !important;
    font-family: var(--font-primary) !important;
    font-size: 0.9375rem !important;
    font-weight: var(--weight-medium) !important;
    text-decoration: none !important;
    border: 2px solid transparent !important;
    border-radius: var(--radius-button) !important;
    cursor: pointer !important;
    transition: background-color 0.2s ease, color 0.2s ease !important;
    white-space: nowrap !important;

    /* Primary button colors */
    background-color: #6B7C54 !important;
    color: #ffffff !important;
    padding: 12px 24px !important;
  }
  .spwidget-button:hover {
    background-color: #5a6b48 !important; /* var(--color-accent-hover) approx */
    color: #ffffff !important;
  }
  .spwidget-button:active {
    transform: scale(0.98);
  }
</style>
```

### Phase 2: Remove Conflicting Container Styles

**File:** `contact.html`

The `.booking-widget-wrap.contact-form-widget` container currently has transparent background and no padding. Since the button now looks like a proper button, we can simplify or remove these overrides to let the default `.booking-section` styling apply cleanly.

### Phase 3: Verify Consistency

- [ ] Contact form widget button matches `.btn--primary` visually
- [ ] Hover state works (darker sage green)
- [ ] Button is centered in its container
- [ ] No blue SimplePractice colors showing through
- [ ] Text reads "Contact" (not "Request Appointment")
- [ ] Works on mobile (responsive sizing)

## Files Modified

1. **`contact.html`** — Update inline `<style>` block for `.spwidget-button` to match primary button styling

## Notes & Decisions

1. **Why not use `btn btn--primary` class?** The SimplePractice widget creates its own DOM elements with fixed class names (`.spwidget-button`). We can't add our classes to it, so we must override via CSS selectors with `!important`.

2. **Hardcoded colors vs CSS variables:** Since the inline style block can't access CSS custom properties reliably across all browsers for dynamically injected content, we use hardcoded values that match the tokens:
   - `#6B7C54` = `var(--color-accent)` (sage green)
   - `#5a6b48` ≈ `var(--color-accent-hover)` (darker sage)

3. **The widget text "Contact"** — This is set in the HTML anchor text: `<a ...>Contact</a>`. SimplePractice may override this with its own label, but we've set it as a fallback.

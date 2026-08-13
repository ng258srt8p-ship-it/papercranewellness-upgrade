# Plan: Contact Page — Booking Modal Integration & Submit Button Styling

## Overview

Two issues on the contact page (and related layout/components):

1. **Booking button → modal with SimplePractice widget** — All "Book a Free 15 Minute Consultation" buttons already have `data-booking-modal` attributes and are wired up to `booking-modal.js`. The modal infrastructure exists but needs to ensure the SimplePractice OAR widget snippet renders correctly inside it on open.

2. **Contact form submit button styling** — The "Contact Us" button (which opens a contact-form variant of the modal) sits inside `.booking-widget-wrap` which has a white background container. Need to match its visual style to the booking buttons and remove any unwanted wrapper box.

---

## Issue 1: Booking Button Modal Integration with SimplePractice Widget

### Current State
- All "Book a Free 15 Minute Consultation" links/buttons across all pages already have `data-booking-modal` attributes.
- `src/js/booking-modal.js` handles modal open/close, focus trapping, ESC key, and backdrop click.
- The modal builds a container with `data-spwidget-*` attributes for the SimplePractice widget to autobind into.
- The SimplePractice integration script (`integration-1.0.js`) is loaded eagerly on init.

### What Needs to Change

**A. Embed the exact SimplePractice widget snippet in the modal body.**

The current modal builds a container div with data attributes, but the user wants the **exact HTML snippet** embedded:

```html
<style>
  .spwidget-button-wrapper{text-align: center}
  .spwidget-button{display: inline-block;padding: 6px 12px;color: #1371C8;background: #fff;border: 1px solid #1371C8;border-radius: 4px;font-size: 14px;font-weight: 600;text-decoration: none}
  .spwidget-button:hover{background: #fff;color: #0F5AA0}
  .spwidget-button:active{color: rgba(255, 255, 255, .75) !important;box-shadow: 0 1px 3px rgba(0, 0, 0, .15) inset}
</style>
<div class="spwidget-button-wrapper">
  <a href="https://papercranewellness.clientsecure.me"
     class="spwidget-button"
     data-spwidget-scope-id="ef573a05-79ef-46ab-9b18-d5c65a183d97"
     data-spwidget-scope-uri="papercranewellness"
     data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b"
     data-spwidget-type="OAR"
     data-spwidget-scope-global
     data-spwidget-autobind>Request Appointment</a>
</div>
<script src="https://widget-cdn.simplepractice.com/assets/integration-1.0.js"></script>
```

**Implementation approach:** Modify `booking-modal.js` to inject this exact snippet (minus the `<script>` tag since it's already loaded eagerly) into the modal body when building the OAR widget container. The script tag should only be injected if not already present on the page.

**B. Ensure proper script execution.**

The existing code loads `integration-1.0.js` once via `loadSimplePracticeWidget()`. This is correct — we just need to make sure:
- The script runs after the widget container DOM elements are in place (it does, since it's loaded before any user interaction).
- The SimplePractice autobind mechanism finds and binds to all containers with `data-spwidget-autobind` attributes.

**C. Close behavior already implemented.**

The modal already has:
- ✅ Click outside (backdrop) → closes
- ✅ Esc key → closes  
- ✅ Close button (X) → closes
- ✅ Focus trapping on Tab
- ✅ Restores focus to trigger element on close

No changes needed for close behavior.

### Files to Modify
| File | Change |
|------|--------|
| `src/js/booking-modal.js` | Update `buildModal()` to inject the exact SimplePractice widget HTML (style + div with anchor) into the modal body instead of just a bare container div. Keep script loading as-is. |

---

## Issue 2: Contact Form Submit Button Styling & Wrapper Removal

### Current State
- The "Contact Us" button is inside `<div class="booking-widget-wrap">` which has `background: var(--color-bg-primary)` (white) and `padding: var(--spacing-6) 0`.
- The button uses `.btn.btn--primary` which gives it a sage green background (`#6B7C54`) with white text.
- The user wants the submit button to match "Book a Free 15 Minute Consultation" buttons visually.

### What Needs to Change

**A. Match submit button styling.**

The `.btn--primary` class already matches the booking buttons (same sage green bg, white text, same border-radius). However, if there's a separate contact form with its own submit button that needs matching, we need to:

1. Ensure any `<button type="submit">` inside the SimplePractice widget or embedded form uses the same styling as `.btn--primary`.
2. If the contact modal has an internal form (not using SimplePractice), style its submit button to match:
   - `background-color: #6B7C54` (--color-accent)
   - `color: #ffffff`
   - `border: 2px solid transparent`
   - `border-radius: 4px` (--radius-button)
   - `padding: 12px 24px`
   - Hover: `background-color: #556342` (--color-accent-hover)

**B. Remove unwanted white background container.**

The `.booking-widget-wrap` div has a white background that creates an unwanted box around the "Contact Us" button. Options:

1. **Remove the wrapper entirely** — Replace `<div class="booking-widget-wrap">...</div>` with just the button, or
2. **Make the wrapper transparent** — Set `background: transparent` and remove padding on `.booking-widget-wrap`, or
3. **Add a page-specific override** — Add inline CSS for this section to make the wrapper invisible.

**Recommended approach:** Remove the `<div class="booking-widget-wrap">` wrapper entirely since it's only serving as a container for one button that opens a modal. The fallback div can be placed directly after.

### Files to Modify
| File | Change |
|------|--------|
| `contact.html` | Remove `.booking-widget-wrap` `<div>` wrapper around the "Contact Us" button; place button and fallback directly in the section inner. Add inline CSS if needed for submit button styling on any embedded form. |

---

## Implementation Order

1. **Modify `src/js/booking-modal.js`** — Inject exact SimplePractice widget HTML into modal body
2. **Modify `contact.html`** — Remove `.booking-widget-wrap` wrapper; ensure "Contact Us" button and fallback sit cleanly
3. **Verify all pages** — Confirm all `[data-booking-modal]` buttons across the site still work correctly with the updated modal

## Testing Checklist

- [ ] Click any "Book a Free 15 Minute Consultation" button → modal opens with SimplePractice widget rendered
- [ ] Modal closes via: backdrop click, Esc key, X button
- [ ] Focus trapping works inside modal (Tab cycles through focusable elements)
- [ ] Focus returns to trigger element on close
- [ ] "Contact Us" button sits cleanly without white box wrapper
- [ ] Contact form submit button (if any) matches booking button styling
- [ ] SimplePractice widget loads and functions correctly within the modal
- [ ] No regressions on other pages with `[data-booking-modal]` buttons

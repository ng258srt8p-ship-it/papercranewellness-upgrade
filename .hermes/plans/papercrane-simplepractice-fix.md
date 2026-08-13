# Paper Crane Wellness — SimplePractice Widget Integration Fix

## Problem
Our custom `booking-modal.js` creates a wrapper modal around SimplePractice widgets, which breaks the native SimplePractice flow. On the reference site (`papercanewellness.atwebpages.com`), SimplePractice's `integration-1.0.js` script binds directly to `<a>` elements with `data-spwidget-*` attributes and handles opening the modal natively. We need to replicate this exact behavior.

## Goal
After implementation:
1. Clicking **"Book a Free 15 Minute Consultation"** (navbar + hero CTA on index.html) opens SimplePractice's appointment request widget modal directly — no intermediate iframe or custom modal wrapper.
2. Clicking **"Contact"** on contact.html opens SimplePractice's contact form widget modal directly — styled identically to the navbar CTA button (sage green `btn--primary`).
3. Both modals match the reference site behavior exactly.

## Widget Configuration (from reference site)
```
WIDGET_SCOPE_ID: ef573a05-79ef-46ab-9b18-d5c65a183d97
WIDGET_SCOPE_URI: papercranewellness
WIDGET_APPLICATION_ID: 7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b
```

### Appointment Request (OAR) widget attributes:
```html
<a href="@url:`https://papercranewellness.clientsecure.me/request`"
   data-spwidget-scope-id="ef573a05-79ef-46ab-9b18-d5c65a183d97"
   data-spwidget-scope-uri="papercranewellness"
   data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b"
   data-spwidget-type="OAR">
```

### Contact Form widget attributes:
```html
<a href="#"
   class="spwidget-button spwidget-contact-form btn--primary"
   data-spwidget-scope-id="ef573a05-79ef-46ab-9b18-d5c65a183d97"
   data-spwidget-scope-uri="papercranewellness"
   data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b"
   data-spwidget-channel="embedded_widget"
   data-spwidget-type="Contact form"
   data-spwidget-contact=""
   data-spwidget-scope-global=""
   data-spwidget-autobind="">
```

## Implementation Plan

### Phase 1: Remove custom booking modal wrapper
- [ ] Delete `src/js/booking-modal.js` — it creates a conflicting custom modal that breaks SimplePractice's native widget binding.
- [ ] Remove `<script src="src/js/booking-modal.js">` from index.html (and any other pages).
- [ ] Remove `data-booking-modal` attribute from navbar CTA and hero CTA buttons on index.html — it's no longer needed since SimplePractice handles the modal natively.

### Phase 2: Add native SimplePractice widget attributes to booking buttons
- [ ] On **index.html**, update all "Book a Free 15 Minute Consultation" anchor elements (navbar + hero + CTA banner) to include:
  - `data-spwidget-scope-id="ef573a05-79ef-46ab-9b18-d5c65a183d97"`
  - `data-spwidget-scope-uri="papercranewellness"`
  - `data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b"`
  - `data-spwidget-type="OAR"`
- [ ] On **about.html**, update the CTA button similarly if it has a booking link.

### Phase 3: Load SimplePractice integration script on all pages with widgets
- [ ] Add `<script src="@url:`https://widget-cdn.simplepractice.com/assets/integration-1.0.js`"></script>` before `</body>` on index.html, about.html, and contact.html (any page that has widget buttons).
- [ ] Include the SimplePractice widget CSS in a `<style>` block or inline:
  ```css
  .spwidget-button-wrapper { text-align: center; }
  .spwidget-button { display: inline-block; padding: 6px 12px; color: #1371C8; background: #fff; border: 1px solid #1371C8; border-radius: 4px; font-size: 14px; font-weight: 600; text-decoration: none; }
  .spwidget-button:hover { background: #fff; color: #0F5AA0; }
  ```

### Phase 4: Fix Contact button on contact.html
- [ ] Update the "Contact" anchor element to use native SimplePractice widget attributes (see Contact Form widget attributes above).
- [ ] Add `btn--primary` class so it matches the sage green styling of the header CTA button.
- [ ] Ensure `data-spwidget-channel="embedded_widget"`, `data-spwidget-type="Contact form"`, `data-spwidget-contact=""`, `data-spwidget-scope-global=""`, `data-spwidget-autobind=""` are all present.
- [ ] Remove any custom JavaScript handling for the contact button — SimplePractice handles it natively now.

### Phase 5: Clean up BookingModal.css (optional)
- [ ] If `src/components/BookingModal.css` is no longer needed (since we removed booking-modal.js), remove it and its stylesheet import from index.html.

## Verification
1. Open `@url:`https://papercrane-wellness-v2.pages.dev/index.html`` — click "Book a Free 15 Minute Consultation" → SimplePractice appointment request modal opens directly.
2. Open `@url:`https://papercrane-wellness-v2.pages.dev/contact.html`` — click "Contact" → SimplePractice contact form modal opens directly. Button styled sage green matching header CTA.
3. Compare behavior/visuals against reference site: `@url:`http://papercanewellness.atwebpages.com``.

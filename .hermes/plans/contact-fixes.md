# Contact Page Fix Plan

## 1. Booking Button Modal Integration
- Find all links/buttons with text "Book a Free 15 Minute Consultation" in contact.html.
- Replace href links with JS-triggered modal opens (prevent default, open modal).
- Create modal (hidden by default) containing exact widget snippet from user.
- Add close behavior (click outside, Esc, close button) and script execution on open.

## 2. Contact Form Submit Button Styling
- Inspect `.spwidget-button` in booking section; match its colors/borders/hover/radius.
- Find parent wrapper (likely `.spwidget-button-wrapper`) of contact submit; remove white bg / container box if present.
- Apply clean styling to sit on page background.

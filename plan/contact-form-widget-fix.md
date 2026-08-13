# Goal: Fix Contact Form Widget on contact.html

## Problem Statement

The "Contact Us" button (`data-widget-type="contact"`) currently does nothing because `booking-modal.js` only handles OAR (Online Appointment Request) widgets — it creates a hidden `.spwidget-button` with `data-spwidget-type="OAR"` and never processes the contact form widget type. The client wants:

1. **The SimplePractice Contact Form Widget embedded directly on the page** (not triggered by a button click / not in a modal overlay)
2. **No white box around it** — clean, seamless integration with the page design

## Root Cause Analysis

### Current `booking-modal.js` behavior:
- Creates a hidden `.spwidget-button` element with `data-spwidget-type="OAR"` only
- Listens for clicks on `[data-booking-modal]` elements
- When clicked, triggers the hidden button's click event (which opens SimplePractice's OAR modal)
- **Never handles `data-widget-type="contact"`** — this attribute is ignored

### Current contact.html structure:
```html
<div class="booking-widget-wrap">
  <button type="button" class="btn btn--primary" data-booking-modal data-widget-type="contact">Contact Us</button>
</div>
```

The button has `data-widget-type="contact"` but booking-modal.js doesn't read this attribute. The widget never renders.

## Solution Plan

### Phase 1: Embed Contact Form Widget Directly on contact.html

Replace the "Contact Us" button with SimplePractice's embedded Contact Form Widget code, placed directly in the page HTML (no modal, no button click needed).

**File:** `contact.html`

**Change:** Replace this block:
```html
<div class="booking-widget-wrap">
  <!-- Contact form opens in a modal overlay -->
  <button type="button" class="btn btn--primary" data-booking-modal data-widget-type="contact">Contact Us</button>
</div>
```

With this (using client's provided embed code):
```html
<div class="booking-widget-wrap contact-form-widget">
  <!-- Start SimplePractice Contact Form Widget Embed Code -->
  <style>
    .spwidget-button-wrapper { text-align: center; }
    .spwidget-button {
      display: inline-block;
      padding: 6px 12px;
      color: #1371C8;
      background: transparent !important;
      border: none;
      border-radius: 0;
      font-size: 14px;
      font-weight: 600;
      text-decoration: underline;
    }
    .spwidget-button:hover { color: #0F5AA0; background: transparent !important; }
    .spwidget-button:active { box-shadow: none !important; }
  </style>
  <div class="spwidget-button-wrapper">
    <a href="https://papercranewellness.clientsecure.me" 
       class="spwidget-button" 
       data-spwidget-scope-id="ef573a05-79ef-46ab-9b18-d5c65a183d97" 
       data-spwidget-scope-uri="papercranewellness" 
       data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b" 
       data-spwidget-channel="embedded_widget" 
       data-spwidget-type="Contact form" 
       data-spwidget-contact 
       data-spwidget-scope-global 
       data-spwidget-autobind>Contact</a>
  </div>
  <script src="https://widget-cdn.simplepractice.com/assets/integration-1.0.js"></script>
  <!-- End SimplePractice Contact Form Widget Embed Code -->
</div>
```

**Key styling changes to remove white box:**
- `background: transparent !important` — removes the white background
- `border: none` — removes the blue border
- `text-decoration: underline` — makes it look like a link instead of a button
- `box-shadow: none !important` — removes any shadow

### Phase 2: Update CSS for Clean Integration

**File:** `contact.html` (inline `<style>` block) or create/update `src/components/Contact.css`

Add styles to ensure the widget blends seamlessly:
```css
/* Contact form widget - no white box, clean integration */
.booking-widget-wrap.contact-form-widget {
  background: transparent !important;
  border: none !important;
  padding: var(--spacing-4) 0 !important;
  border-radius: 0 !important;
}

.booking-widget-wrap.contact-form-widget .spwidget-button-wrapper {
  margin-top: var(--spacing-3);
}
```

### Phase 3: Update booking-modal.js to Handle Contact Widget Type (Optional, for other pages)

If the contact form widget is needed on other pages in the future, update `booking-modal.js` to handle both OAR and Contact types. However, since we're embedding directly on contact.html, this may not be necessary unless other pages need it.

**File:** `src/js/booking-modal.js`

Update `createWidgetButton()` to support both widget types:
```javascript
function createWidgetButton(widgetType) {
  if (document.querySelector('.spwidget-button')) return;

  var type = widgetType || 'OAR'; // Default to OAR for booking buttons

  var widgetContainer = document.createElement('div');
  widgetContainer.style.display = 'none';
  widgetContainer.innerHTML =
    '<div class="spwidget-button-wrapper">' +
    '<a href="https://papercranewellness.clientsecure.me" class="spwidget-button" ' +
    'data-spwidget-scope-id="ef573a05-79ef-46ab-9b18-d5c65a183d97" ' +
    'data-spwidget-scope-uri="papercranewellness" ' +
    'data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b" ' +
    'data-spwidget-type="' + type + '" data-spwidget-scope-global ' +
    'data-spwidget-autobind>' + (type === 'Contact form' ? 'Contact' : 'Request Appointment') + '</a>' +
    '</div>';

  document.body.appendChild(widgetContainer);
}

// In init(), read the widget type from triggers:
function init() {
  var triggers = document.querySelectorAll('[data-booking-modal]');
  if (!triggers.length) return;

  // Determine widget type from first trigger (default OAR)
  var widgetType = 'OAR';
  for (var i = 0; i < triggers.length; i++) {
    var type = triggers[i].getAttribute('data-widget-type');
    if (type === 'contact') {
      widgetType = 'Contact form';
      break;
    }
  }

  createWidgetButton(widgetType);
  injectIntegrationScript();
  document.addEventListener('click', onDocumentClick);
}
```

### Phase 4: Verify Fallback Still Works

The fallback mechanism (`booking-widget-fallback` div with `hidden` attribute) should remain in place. If the SimplePractice script fails to load, JavaScript should show the fallback and hide the widget container.

**File:** `contact.html` or a new inline script

Add a simple check:
```javascript
(function() {
  var widgetWrap = document.querySelector('.booking-widget-wrap');
  var fallback = document.querySelector('.booking-widget-fallback');

  // If SimplePractice integration script fails, show fallback
  setTimeout(function() {
    if (!document.querySelector('.spwidget-button') && !document.querySelector('[data-spwidget-type="Contact form"]')) {
      if (widgetWrap) widgetWrap.style.display = 'none';
      if (fallback) fallback.removeAttribute('hidden');
    }
  }, 3000); // Wait 3 seconds for script to load
})();
```

## Files Modified

1. **`contact.html`** — Replace button with embedded Contact Form Widget, update CSS styling
2. **`src/js/booking-modal.js`** (optional) — Update to handle `data-widget-type="contact"` for future use on other pages

## Validation Checklist

- [ ] Contact form widget renders directly on contact.html (no modal overlay)
- [ ] No white box around the widget (transparent background, no border)
- [ ] Widget looks like a clean link/button that matches site design
- [ ] Fallback message appears if SimplePractice script fails to load
- [ ] Other booking buttons (navbar "Book Now", CTA banners) still work correctly with OAR widget
- [ ] No JavaScript errors in console
- [ ] Page loads without the SimplePractice script (fallback visible)

## Notes & Decisions

1. **Why embed directly instead of using a modal?** The client explicitly requested no white box and direct embedding. The Contact Form Widget from SimplePractice is designed for inline/embedded use, not modals.

2. **Why keep booking-modal.js as-is for OAR buttons?** The navbar "Book Now" buttons and CTA banners should continue to open the OAR (appointment request) modal. Only the contact form on this page needs direct embedding.

3. **The `data-widget-type="contact"` attribute** — This was likely intended to signal a different widget type, but booking-modal.js never implemented support for it. The fix is to embed directly rather than trying to make the button trigger a modal.

/**
 * booking-modal.js
 *
 * Opens a SimplePractice widget (OAR or Contact form) in a modal overlay when any
 * [data-booking-modal] link/button is clicked. Uses the new SimplePractice
 * widget system with data-spwidget-* attributes and integration script.
 *
 * Usage: add data-booking-modal to any <a> or <button> that should open the modal.
 *        Add data-widget-type="contact" for a contact form instead of booking.
 */

(function () {
  'use strict';

  // SimplePractice widget configuration - using new widget system
  var WIDGET_SCOPE_ID = 'ef573a05-79ef-46ab-9b18-d5c65a183d97';
  var WIDGET_SCOPE_URI = 'papercranewellness';
  var WIDGET_APPLICATION_ID = '7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b';
  var WIDGET_TYPE_OAR = 'OAR'; // Online Appointment Request
  var WIDGET_TYPE_CONTACT = 'Contact form';

  var modal, panel, closeBtn, backdrop;
  var lastFocus = null;
  var created   = false;

  // ── Load SimplePractice integration script ────────────────────────────

  function loadSimplePracticeWidget() {
    if (document.getElementById('simplepractice-widget-script')) return;
    
    var script = document.createElement('script');
    script.id = 'simplepractice-widget-script';
    script.src = 'https://widget-cdn.simplepractice.com/assets/integration-1.0.js';
    script.async = true;
    document.head.appendChild(script);
  }

  // ── Build modal DOM (once, on first open) ────────────────────────────

  function buildModal(widgetType, titleText, ariaLabel) {
    modal = document.createElement('div');
    modal.id        = 'booking-modal';
    modal.className = 'booking-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', ariaLabel || 'Book a free 15 minute consultation');
    modal.hidden = true;

    // Backdrop — clicking it closes the modal
    backdrop = document.createElement('div');
    backdrop.className = 'booking-modal__backdrop';
    backdrop.addEventListener('click', closeModal);

    // Panel
    panel = document.createElement('div');
    panel.className = 'booking-modal__panel';

    // Header row
    var header = document.createElement('div');
    header.className = 'booking-modal__header';

    var title = document.createElement('p');
    title.className   = 'booking-modal__title';
    title.textContent = titleText || 'Book a Free 15 Minute Consultation';

    closeBtn = document.createElement('button');
    closeBtn.type      = 'button';
    closeBtn.className = 'booking-modal__close';
    closeBtn.setAttribute('aria-label', 'Close booking form');
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' +
      '<line x1="18" y1="6"  x2="6"  y2="18"/>' +
      '<line x1="6"  y1="6"  x2="18" y2="18"/>' +
      '</svg>';
    closeBtn.addEventListener('click', closeModal);

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body — SimplePractice widget renders here directly
    var body = document.createElement('div');
    body.className = 'booking-modal__body';

    // Create a container for the SimplePractice widget to render into
    var spWidgetContainer = document.createElement('div');
    spWidgetContainer.id = 'simplepractice-widget-container';
    spWidgetContainer.setAttribute('data-spwidget-scope-id', WIDGET_SCOPE_ID);
    spWidgetContainer.setAttribute('data-spwidget-scope-uri', WIDGET_SCOPE_URI);
    spWidgetContainer.setAttribute('data-spwidget-application-id', WIDGET_APPLICATION_ID);
    spWidgetContainer.setAttribute('data-spwidget-type', widgetType || WIDGET_TYPE_OAR);
    spWidgetContainer.setAttribute('data-spwidget-channel', 'embedded_widget');
    spWidgetContainer.setAttribute('data-spwidget-scope-global', '');
    spWidgetContainer.setAttribute('data-spwidget-autobind', '');

    body.appendChild(spWidgetContainer);

    panel.appendChild(header);
    panel.appendChild(body);

    modal.appendChild(backdrop);
    modal.appendChild(panel);

    document.body.appendChild(modal);
    created = true;
  }

  // ── Open ─────────────────────────────────────────────────────────────

  function openModal(triggerEl, widgetType, titleText, ariaLabel) {
    lastFocus = triggerEl || document.activeElement;

    if (!created) buildModal(widgetType, titleText, ariaLabel);

    modal.hidden = false;
    document.body.classList.add('booking-modal-open');

    // Animate in on next frame
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
    });

    // Move focus into modal
    setTimeout(function () { closeBtn.focus(); }, 60);
  }

  // ── Close ─────────────────────────────────────────────────────────────

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('booking-modal-open');

    // Wait for CSS transition then hide (keeps it out of tab order)
    var TRANSITION_MS = 260;
    setTimeout(function () {
      if (!modal.classList.contains('is-open')) {
        modal.hidden = true;
      }
    }, TRANSITION_MS);

    if (lastFocus) lastFocus.focus();
  }

  // ── Keyboard trap & ESC ───────────────────────────────────────────────

  function onKeyDown(e) {
    if (!modal || modal.hidden) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      var focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // ── Event delegation — intercept all booking triggers ─────────────────

  function onDocumentClick(e) {
    var trigger = e.target.closest('[data-booking-modal]');
    if (!trigger) return;
    e.stopPropagation();
    e.preventDefault();

    // Determine widget type from data attribute (default: OAR booking)
    var widgetType = trigger.getAttribute('data-widget-type') || '';
    var titleText, ariaLabel;
    if (widgetType === 'contact') {
      widgetType = WIDGET_TYPE_CONTACT;
      titleText = 'Contact Paper Crane Wellness';
      ariaLabel = 'Contact form';
    } else {
      widgetType = WIDGET_TYPE_OAR;
      titleText = 'Book a Free 15 Minute Consultation';
      ariaLabel = 'Book a free 15 minute consultation';
    }

    openModal(trigger, widgetType, titleText, ariaLabel);
  }

  // ── Init ──────────────────────────────────────────────────────────────

  function init() {
    if (!document.querySelector('[data-booking-modal]')) return;
    // Non-passive listener so e.preventDefault() / e.stopPropagation() are guaranteed to work,
    // even when other scripts (e.g. SimplePractice) attach handlers earlier in the capture phase.
    document.addEventListener('click', onDocumentClick, { passive: false });
    document.addEventListener('keydown', onKeyDown);

    // Load SimplePractice integration script eagerly so it is ready before any clicks happen.
    loadSimplePracticeWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());

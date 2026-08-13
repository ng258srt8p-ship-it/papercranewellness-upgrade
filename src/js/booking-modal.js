/**
 * booking-modal.js
 *
 * Loads SimplePractice booking widget (v2.1 - scroll fix deployed) and handles fallback when any
 * [data-booking-modal] link is clicked. SimplePractice handles its own modal.
 * Keeps a plain href on the anchor as a no-JS / no-script fallback.
 *
 * Usage: add data-booking-modal to any <a> or <button> that should open the modal.
 *        Add data-widget-type="contact" for a contact form instead of booking.
 */

(function () {
  'use strict';

  var integrationScriptLoaded = false;
  var INTEGRATION_SCRIPT_SRC = 'https://widget-cdn.simplepractice.com/assets/integration-1.0.js';

  // Create and inject the hidden SimplePractice OAR widget button (for booking)
  function createWidgetButton() {
    // Check if an OAR widget button already exists (don't conflict with Contact form button)
    if (document.querySelector('.spwidget-button[data-spwidget-type="OAR"]')) return;

    var widgetContainer = document.createElement('div');
    widgetContainer.style.display = 'none'; // Hide the button
    widgetContainer.innerHTML =
      '<div class="spwidget-button-wrapper">' +
      '<a href="https://papercranewellness.clientsecure.me" class="spwidget-button" ' +
      'data-spwidget-scope-id="ef573a05-79ef-46ab-9b18-d5c65a183d97" ' +
      'data-spwidget-scope-uri="papercranewellness" ' +
      'data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b" ' +
      'data-spwidget-type="OAR" data-spwidget-scope-global ' +
      'data-spwidget-autobind>Request Appointment</a>' +
      '</div>';

    document.body.appendChild(widgetContainer);
  }

  // Load the SimplePractice integration script
  function injectIntegrationScript() {
    if (integrationScriptLoaded) return;

    var script = document.createElement('script');
    script.src = INTEGRATION_SCRIPT_SRC;
    script.async = true;
    script.onload = function () {
      integrationScriptLoaded = true;
    };
    script.onerror = function () {
      integrationScriptLoaded = false;
      console.warn('SimplePractice widget failed to load');
    };
    document.body.appendChild(script);
  }

  // Handle booking trigger clicks
  function onDocumentClick(e) {
    var trigger = e.target.closest('[data-booking-modal]');
    if (!trigger) return;

    e.preventDefault();

    // Save scroll position before modal opens
    var savedScrollY = window.scrollY || window.pageYOffset;

    // If SimplePractice script is loaded, trigger the OAR widget
    if (integrationScriptLoaded) {
      var widgetButton = document.querySelector('.spwidget-button[data-spwidget-type="OAR"]');
      if (widgetButton) {
        widgetButton.click();

        // Disable smooth scrolling while modal is open to prevent
        // animated scroll artifacts during open/close transition
        document.documentElement.style.setProperty('scroll-behavior', 'auto');

        // Restore scroll position when modal closes.
        // SimplePractice uses CSS classes (spwidget--scroll-locked, spwidget--no-scroll)
        // and body.style.top = -scrollY to lock the viewport — NOT inline overflow.
        // We use a MutationObserver to detect when the modal's classes are removed.
        var spWidgetObserver = new MutationObserver(function(mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (m.attributeName === 'class') {
              var hasWidgetClasses = document.body.classList.contains('spwidget--scroll-locked')
                || document.body.classList.contains('spwidget--no-scroll');
              if (!hasWidgetClasses && observerInitialized) {
                // Modal closed — restore scroll position
                observerActive = false;
                spWidgetObserver.disconnect();
                // Small delay to ensure the overlay has been removed from the DOM
                setTimeout(function() {
                  window.scrollTo(0, savedScrollY);
                  // Re-enable smooth scrolling after modal interaction
                  document.documentElement.style.setProperty('scroll-behavior', '');
                }, 100);
                return;
              }
            }
          }
        });
        var observerInitialized = false;
        // Verify the widget classes exist before observing (guard against false triggers)
        var initialHasWidgetClasses = document.body.classList.contains('spwidget--scroll-locked')
          || document.body.classList.contains('spwidget--no-scroll');
        if (initialHasWidgetClasses) {
          observerInitialized = true;
          spWidgetObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
          // Fallback: restore scroll after 5 seconds in case the modal never closes
          var observerActive = true;
          setTimeout(function() {
            if (observerActive) {
              observerActive = false;
              spWidgetObserver.disconnect();
              window.scrollTo(0, savedScrollY);
            }
          }, 5000);
        } else {
          // Widget classes not detected — SimplePractice may not have rendered the modal.
          // The scroll is handled by SimplePractice's own _close() method.
        }
      } else {
        // Fallback: open the direct booking page
        window.open(trigger.href, '_blank');
      }
    } else {
      // Script not loaded yet, open direct booking page
      window.open(trigger.href, '_blank');
    }
  }

  // Initialize the widget system
  function init() {
    if (!document.querySelector('[data-booking-modal]')) return;

    createWidgetButton();
    injectIntegrationScript();
    document.addEventListener('click', onDocumentClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());

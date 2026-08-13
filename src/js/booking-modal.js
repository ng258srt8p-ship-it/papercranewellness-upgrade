/**
 * booking-modal.js
 *
 * Loads SimplePractice booking widget and handles fallback when any
 * [data-booking-modal] link is clicked. SimplePractice handles its own modal.
 * Keeps a plain href on the anchor as a no-JS / no-script fallback.
 *
 * Usage: add data-booking-modal to any <a> that should open the modal.
 */

(function () {
  'use strict';

  var integrationScriptLoaded = false;
  var INTEGRATION_SCRIPT_SRC = 'https://widget-cdn.simplepractice.com/assets/integration-1.0.js';

  // Create and inject the SimplePractice widget button (hidden)
  function createWidgetButton() {
    // Determine widget type from triggers on page (default OAR for booking buttons)
    var widgetType = 'OAR';
    var triggers = document.querySelectorAll('[data-booking-modal]');
    for (var i = 0; i < triggers.length; i++) {
      var type = triggers[i].getAttribute('data-widget-type');
      if (type === 'contact') {
        widgetType = 'Contact form';
        break;
      }
    }

    var widgetContainer = document.createElement('div');
    widgetContainer.style.display = 'none'; // Hide the button
    widgetContainer.innerHTML =
      '<div class="spwidget-button-wrapper">' +
      '<a href="https://papercranewellness.clientsecure.me" class="spwidget-button spwidget-button--' + widgetType.toLowerCase().replace(' ', '-') + '" ' +
      'data-spwidget-scope-id="ef573a05-79ef-46ab-9b18-d5c65a183d97" ' +
      'data-spwidget-scope-uri="papercranewellness" ' +
      'data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b" ' +
      'data-spwidget-type="' + widgetType + '" data-spwidget-scope-global ' +
      'data-spwidget-autobind>' + (widgetType === 'Contact form' ? 'Contact' : 'Request Appointment') + '</a>' +
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

    // If SimplePractice script is loaded, trigger the widget
    if (integrationScriptLoaded) {
      var widgetButton = document.querySelector('.spwidget-button--oar');
      if (widgetButton) {
        widgetButton.click();

        // Restore scroll position when modal closes
        // SimplePractice adds/removes overflow:hidden on body
        function waitForModalClose() {
          var bodyOverflow = document.body.style.overflow;
          // If overflow is restored (modal closed), restore scroll position
          if (bodyOverflow === '' || bodyOverflow === 'auto' || bodyOverflow === 'scroll') {
            // Small delay to ensure modal is fully closed
            setTimeout(function() {
              window.scrollTo(0, savedScrollY);
            }, 100);
            return;
          }
          // Check again in 50ms
          setTimeout(waitForModalClose, 50);
        }
        waitForModalClose();
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

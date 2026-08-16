/**
 * widget-fallback.js
 *
 * Watches the SimplePractice booking iframe for load failure.
 * If the iframe fails to load (e.g. network error, content blocked),
 * shows a fallback contact section pointing to phone + email.
 *
 * Usage: include this script on any page containing a
 *        .booking-widget-wrap element with an <iframe> inside.
 */

(function () {
  'use strict';

  function init() {
    const wrap    = document.querySelector('.booking-widget-wrap');
    const iframe  = wrap && wrap.querySelector('iframe');
    const fallback = document.querySelector('.booking-widget-fallback');

    if (!iframe || !fallback) return;

    // Timeout fallback — if iframe content hasn't signalled ready in 8 s
    const timeout = setTimeout(() => showFallback(), 8000);

    iframe.addEventListener('load', () => {
      // If iframe lands on a blank/error page, its body will be empty
      try {
        const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!innerDoc || !innerDoc.body || innerDoc.body.innerHTML.trim() === '') {
          showFallback();
        } else {
          clearTimeout(timeout);
        }
      } catch {
        // Cross-origin — iframe loaded but we can't inspect it (this is OK)
        clearTimeout(timeout);
      }
    });

    iframe.addEventListener('error', () => {
      clearTimeout(timeout);
      showFallback();
    });

    function showFallback() {
      if (wrap) wrap.style.display = 'none';
      if (fallback) fallback.hidden = false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

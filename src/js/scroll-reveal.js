/**
 * scroll-reveal.js — Intersection Observer powered scroll animations
 *
 * Elements with [data-reveal]: fade + slide in when they enter viewport.
 * Elements with [data-reveal-stagger]: all children stagger in together.
 *
 * Respects prefers-reduced-motion (CSS handles the no-op — this script
 * still adds .is-visible so layout is correct).
 */

(function () {
  'use strict';

  const THRESHOLD = 0.15;  // 15% visible before triggering

  function initReveal() {
    const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: THRESHOLD }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();

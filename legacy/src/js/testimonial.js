/**
 * testimonial.js — Carousel for the TestimonialCarousel component
 *
 * Features:
 *  - Previous / Next arrow navigation
 *  - Dot indicator navigation
 *  - Keyboard: ArrowLeft / ArrowRight inside carousel
 *  - ARIA: aria-live region, aria-label on arrows
 *  - Auto-play (pauses on hover / focus per prefers-reduced-motion)
 */

(function () {
  'use strict';

  const AUTOPLAY_INTERVAL = 6000; // ms

  function initCarousel(carousel) {
    const track    = carousel.querySelector('.testimonial-carousel__track');
    const slides   = carousel.querySelectorAll('.testimonial-slide');
    const prevBtn  = carousel.querySelector('.testimonial-carousel__arrow--prev');
    const nextBtn  = carousel.querySelector('.testimonial-carousel__arrow--next');
    const dotsList = carousel.querySelector('.testimonial-carousel__dots');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let autoplayTimer = null;

    // Build dots
    const dots = [];
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.classList.add('testimonial-carousel__dot');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsList && dotsList.appendChild(dot);
      dots.push(dot);
    });

    // ARIA live region
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.classList.add('visually-hidden');
    carousel.appendChild(liveRegion);

    function goTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update dots
      dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIndex));

      // Update arrows
      if (prevBtn) prevBtn.disabled = slides.length <= 1;
      if (nextBtn) nextBtn.disabled = slides.length <= 1;

      // Announce to screen readers
      liveRegion.textContent = `Slide ${currentIndex + 1} of ${slides.length}`;
    }

    function next() { goTo(currentIndex + 1); }
    function prev() { goTo(currentIndex - 1); }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    });

    // Auto-play
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced && slides.length > 1) {
      function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(next, AUTOPLAY_INTERVAL);
      }

      function stopAutoplay() {
        if (autoplayTimer) {
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      }

      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);
      carousel.addEventListener('focusin',   stopAutoplay);
      carousel.addEventListener('focusout',  startAutoplay);

      startAutoplay();
    }

    // Init first slide
    goTo(0);
  }

  function init() {
    document.querySelectorAll('.testimonial-carousel').forEach(initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

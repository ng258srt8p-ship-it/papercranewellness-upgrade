/**
 * nav.js — NavBar interactivity
 *
 * Responsibilities:
 *  1. Sticky scrolled shadow
 *  2. Hamburger open/close with aria-expanded
 *  3. Focus trap inside mobile menu when open
 *  4. Escape key closes menu
 *  5. Announce active page via aria-current
 */

(function () {
  'use strict';

  const navbar       = document.querySelector('.navbar');
  const hamburger    = document.querySelector('.navbar__hamburger');
  const mobileMenu   = document.querySelector('.navbar__mobile-menu');
  const mobileLinks  = mobileMenu ? mobileMenu.querySelectorAll('a, button') : [];

  if (!navbar) return;

  // -------------------------------------------------------------------
  // 1. Scrolled shadow
  // -------------------------------------------------------------------
  const SCROLL_THRESHOLD = 8;

  function handleScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // set initial state

  // -------------------------------------------------------------------
  // 2. Hamburger toggle
  // -------------------------------------------------------------------
  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    // Move focus to first link in menu
    if (mobileLinks.length) mobileLinks[0].focus();
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  function isMenuOpen() {
    return hamburger.getAttribute('aria-expanded') === 'true';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (isMenuOpen()) closeMenu();
      else openMenu();
    });
  }

  // -------------------------------------------------------------------
  // 3. Focus trap inside mobile menu
  // -------------------------------------------------------------------
  if (mobileMenu) {
    mobileMenu.addEventListener('keydown', (e) => {
      if (!isMenuOpen()) return;

      const focusable = Array.from(
        mobileMenu.querySelectorAll('a, button, [tabindex="0"]')
      ).filter(el => !el.disabled);

      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------
  // 4. Escape key
  // -------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen()) closeMenu();
  });

  // -------------------------------------------------------------------
  // 5. Close on outside click
  // -------------------------------------------------------------------
  document.addEventListener('click', (e) => {
    if (
      isMenuOpen() &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // -------------------------------------------------------------------
  // 6. Set aria-current="page" on matching nav links
  // -------------------------------------------------------------------
  const currentPath = window.location.pathname;

  document.querySelectorAll('.navbar__links a, .navbar__mobile-links a').forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    // Normalize trailing slashes & index.html
    const normalize = (p) => p.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
    if (normalize(linkPath) === normalize(currentPath)) {
      link.setAttribute('aria-current', 'page');
    }
  });

})();

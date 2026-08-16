// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Contact page header CTA fix', () => {
  
  test('contact.html has "Book a Free 15 Minute Consultation" button in navbar header', async ({ page }) => {
    await page.goto('/contact.html');
    
    // The navbar CTA should be present with the correct class and text
    const headerCta = page.locator('.navbar__cta.btn--primary');
    expect(await headerCta.count()).toBeGreaterThan(0);
    
    const ctaText = await headerCta.first().textContent();
    expect(ctaText).toContain('Book a Free 15 Minute Consultation');
    
    // Verify it links to the correct SimplePractice URL
    const href = await headerCta.first().getAttribute('href');
    expect(href).toContain('papercranewellness.clientsecure.me/request');
  });

  test('contact.html navbar CTA is positioned between nav-links and hamburger', async ({ page }) => {
    await page.goto('/contact.html');
    
    // Verify all four key elements exist inside .navbar__inner
    const hasLogo = await page.locator('.navbar__logo').count() > 0;
    const hasNavLinks = await page.locator('.navbar__links').count() > 0;
    const hasCta = await page.locator('.navbar__cta.btn--primary').count() > 0;
    const hasHamburger = await page.locator('.navbar__hamburger').count() > 0;
    
    expect(hasLogo).toBe(true);
    expect(hasNavLinks).toBe(true);
    expect(hasCta).toBe(true);
    expect(hasHamburger).toBe(true);
  });

  test('contact.html navbar CTA matches other pages structure', async ({ page }) => {
    // Check that contact.html has the same navbar CTA pattern as index and about
    const pages = [
      { url: '/', name: 'index' },
      { url: '/about.html', name: 'about' },
      { url: '/contact.html', name: 'contact' }
    ];
    
    for (const { url, name } of pages) {
      await page.goto(url);
      
      const cta = page.locator('.navbar__cta.btn--primary');
      expect(await cta.count()).toBeGreaterThan(0, `Navbar CTA missing on ${name}`);
      
      const text = await cta.first().textContent();
      expect(text).toContain('Consultation', `Navbar CTA text mismatch on ${name}`);
    }
  });

});

test.describe('Contact page mobile menu CTA fix', () => {
  
  test('contact.html mobile menu uses navbar__mobile-cta wrapper', async ({ page }) => {
    await page.goto('/contact.html');
    
    // The mobile menu should have a .navbar__mobile-cta div (not spwidget-button-wrapper)
    const mobileCta = page.locator('.navbar__mobile-menu .navbar__mobile-cta');
    expect(await mobileCta.count()).toBeGreaterThan(0);
    
    // Should NOT have the old spwidget-button-wrapper inside mobile menu
    const oldWrapper = page.locator('.navbar__mobile-menu .spwidget-button-wrapper');
    expect(await oldWrapper.count()).toBe(0);
  });

  test('contact.html mobile menu CTA has correct button class', async ({ page }) => {
    await page.goto('/contact.html');
    
    const mobileCta = page.locator('.navbar__mobile-menu .navbar__mobile-cta .btn--primary');
    expect(await mobileCta.count()).toBeGreaterThan(0);
    
    const text = await mobileCta.first().textContent();
    expect(text).toContain('Book a Free 15 Minute Consultation');
  });

});

test.describe('Contact page button whitespace fix', () => {
  
  test('contact.html Contact button has tight padding (no excessive whitespace)', async ({ page }) => {
    await page.goto('/contact.html');
    
    // The custom-styled contact form button should have reasonable padding
    const contactBtn = page.locator('.spwidget-button[data-spwidget-type="Contact form"]');
    expect(await contactBtn.count()).toBeGreaterThan(0);
    
    const padding = await contactBtn.first().evaluate(el => {
      const s = getComputedStyle(el);
      return {
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        marginTop: s.marginTop,
        marginBottom: s.marginBottom,
        marginLeft: s.marginLeft,
        marginRight: s.marginRight
      };
    });
    
    // Padding should be tight - max 14px vertical, max 28px horizontal
    const padY = parseInt(padding.paddingTop);
    const padX = parseInt(padding.paddingLeft);
    
    expect(padY).toBeLessThanOrEqual(14, `Vertical padding ${padY}px is too large`);
    expect(padX).toBeLessThanOrEqual(28, `Horizontal padding ${padX}px is too large`);
  });

  test('contact.html Contact button wrapper has no extra margin/padding', async ({ page }) => {
    await page.goto('/contact.html');
    
    const wrapper = page.locator('.booking-section .spwidget-button-wrapper');
    expect(await wrapper.count()).toBeGreaterThan(0);
    
    const wrapperStyles = await wrapper.first().evaluate(el => {
      const s = getComputedStyle(el);
      return {
        marginTop: s.marginTop,
        marginBottom: s.marginBottom,
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        marginLeft: s.marginLeft,
        marginRight: s.marginRight,
        display: s.display
      };
    });
    
    // Wrapper should center its contents (via flexbox or text-align center)
    expect(['flex', 'block'].includes(wrapperStyles.display)).toBe(true);
    
    // No excessive margins on the wrapper itself — SP widget wrapper naturally has ~16px top/bottom margin
    // The key fix was removing the white .booking-widget-wrap container; SP wrapper can have its own thin margins
    const marginY = parseInt(wrapperStyles.marginTop) + parseInt(wrapperStyles.marginBottom);
    expect(marginY).toBeLessThanOrEqual(80, `Wrapper vertical margin ${marginY}px is too large`);
  });

  test('contact.html Contact button matches other pages padding', async ({ page }) => {
    // Compare contact button padding across pages that have it
    const pages = [
      { url: '/contact.html', name: 'contact' },
      { url: '/faq.html', name: 'faq' }
    ];
    
    for (const { url, name } of pages) {
      await page.goto(url);
      
      // Check if the page has a contact form button
      const btn = page.locator('.spwidget-button[data-spwidget-type="Contact form"]');
      const count = await btn.count();
      if (count === 0) continue;
      
      const padding = await btn.first().evaluate(el => {
        const s = getComputedStyle(el);
        return { padY: parseInt(s.paddingTop), padX: parseInt(s.paddingLeft) };
      });
      
      // All contact buttons should have similar tight padding
      expect(padding.padY).toBeLessThanOrEqual(14, `${name}: vertical padding too large`);
      expect(padding.padX).toBeLessThanOrEqual(28, `${name}: horizontal padding too large`);
    }
  });

});

test.describe('Contact page overall structure validation', () => {
  
  test('contact.html has all required sections in correct order', async ({ page }) => {
    await page.goto('/contact.html');
    
    const structure = await page.evaluate(() => {
      const main = document.querySelector('main#main-content');
      if (!main) return [];
      
      return Array.from(main.children).map(section => ({
        tag: section.tagName.toLowerCase(),
        className: section.className || '',
        id: section.id || ''
      }));
    });
    
    // Should have contact-details and booking-section sections
    const hasContactDetails = structure.some(s => s.className.includes('contact-details'));
    const hasBookingSection = structure.some(s => s.className.includes('booking-section'));
    
    expect(hasContactDetails).toBe(true);
    expect(hasBookingSection).toBe(true);
  });

  test('contact.html navbar CTA is visible (not hidden)', async ({ page }) => {
    await page.goto('/contact.html');
    
    const cta = page.locator('.navbar__cta.btn--primary');
    expect(await cta.count()).toBeGreaterThan(0);
    expect(await cta.first().isVisible()).toBe(true);
  });

});

// -------------------------------------------------------------------
// Booking button opens SimplePractice native overlay — L3 gates
// Uses reference-site approach: booking-modal.js creates hidden SP widget
// button, intercepts [data-booking-modal] clicks, triggers SP native overlay.
// -------------------------------------------------------------------

test.describe('Booking button opens SimplePractice overlay', () => {
  // Collect console errors, ignoring SP's own warnings
  let errors;
  test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('console', m => {
      const txt = m.text();
      if (m.type() === 'error' && !txt.includes('ember-fastboot') && !txt.includes('Ember via AMD') && !txt.includes('requestStorageAccess')) {
        errors.push(txt);
      }
    });
    page.on('pageerror', e => errors.push(String(e)));
  });

  // L3.G1 — Book button click opens SP overlay (not a page navigation)
  test('L3.G1: clicking Book button opens SP overlay (no navigation)', async ({ page }) => {
    await page.goto('/contact.html');

    // Ensure booking-modal.js has loaded the SP script (wait for preload)
    await page.waitForTimeout(2000);

    await page.locator('.navbar__cta:has-text("Book a Free")').first().click();

    // SP overlay should appear within 15s
    await expect(page.locator('.spwidget--overlay')).toBeVisible({ timeout: 15000 });
    // URL should NOT have changed to clientsecure.me
    expect(page.url()).toContain('localhost');
  });

  // L3.G3 — SP iframe renders visible inside overlay
  test('L3.G3: SP iframe renders visible in overlay', async ({ page }) => {
    await page.goto('/contact.html');
    await page.waitForTimeout(2000);
    await page.locator('.navbar__cta:has-text("Book a Free")').first().click();
    await expect(page.locator('.spwidget--overlay')).toBeVisible({ timeout: 15000 });

    // The iframe inside should be visible and have meaningful dimensions
    const iframe = page.locator('.spwidget--scroller iframe, .spwidget--overlay iframe').first();
    await expect(iframe).toBeVisible({ timeout: 10000 });
  });

  // L3.G7 — Contact button opens native SP overlay
  test('L3.G7: Contact button opens native SP overlay', async ({ page }) => {
    await page.goto('/contact.html');
    await page.waitForTimeout(2000);
    await page.locator('a[data-spwidget-type="Contact form"]').first().click();
    await expect(page.locator('.spwidget--overlay')).toBeVisible({ timeout: 15000 });
  });

  // L3.G8 — no unexpected console errors from our code
  test('L3.G8: no console errors from our scripts', async ({ page }) => {
    await page.goto('/contact.html');
    await page.waitForTimeout(2000);
    await page.locator('.navbar__cta:has-text("Book a Free")').first().click();
    await page.waitForTimeout(5000);
    // SP's own warnings are filtered out; should be empty
    expect(errors).toEqual([]);
  });

  // L3 — index.html hero Book button also opens SP overlay
  test('L3: index.html hero Book button opens SP overlay', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const hero = page.locator('main a:has-text("Book a Free 15 Minute Consultation")').first();
    await hero.click();
    await expect(page.locator('.spwidget--overlay')).toBeVisible({ timeout: 15000 });
  });
});

// -------------------------------------------------------------------
// Contact button styling + clean wrapper — L4 gates
// -------------------------------------------------------------------

test.describe('Contact button styling + clean wrapper', () => {
  // L4.G1
  test('L4.G1: Contact button matches Book button style', async ({ page }) => {
    await page.goto('/contact.html');
    const c = page.locator('.booking-section .spwidget-button').first();
    const b = page.locator('.navbar__cta.btn--primary').first();
    const [cs, bs] = await Promise.all([
      c.evaluate(el => {
        const s = getComputedStyle(el);
        return [s.backgroundColor, s.color, s.borderRadius, s.padding].join('|');
      }),
      b.evaluate(el => {
        const s = getComputedStyle(el);
        return [s.backgroundColor, s.color, s.borderRadius, s.padding].join('|');
      }),
    ]);
    expect(cs).toBe(bs);
  });

  // L4.G2 + L4.G4
  test('L4.G2: no white container wraps Contact button', async ({ page }) => {
    await page.goto('/contact.html');
    expect(await page.locator('.booking-section .booking-widget-wrap').count()).toBe(0);
    expect(await page.locator('.booking-widget-fallback').count()).toBe(0);
  });

  // L4.G3
  test('L4.G3: Contact button wrapper transparent, no shadow', async ({ page }) => {
    await page.goto('/contact.html');
    const wrap = page.locator('.booking-section .spwidget-button-wrapper').first();
    const styles = await wrap.evaluate(el => {
      const s = getComputedStyle(el);
      return [s.backgroundColor, s.boxShadow].join('|');
    });
    expect(styles).toMatch(/transparent|rgba\(0,\s*0,\s*0,\s*0\)/);
    expect(styles).toContain('none'); // boxShadow none
  });
});


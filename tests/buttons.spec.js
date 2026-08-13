// @ts-check
const { test, expect } = require('@playwright/test');

// Target button styles — sage green CTA matching papercanewellness.atwebpages.com
// Updated to match actual --color-accent token from src/tokens.css (#6B7C54, WCAG AA compliant)
const TARGET_PADDING_Y = 12; // px vertical padding
const TARGET_PADDING_X = 24; // px horizontal padding
const TARGET_BG_R = 107, TARGET_BG_G = 124, TARGET_BG_B = 84; // #6B7C54

async function testBtnPrimaryButtons(page, label) {
  const buttons = page.locator('.btn--primary');
  const count = await buttons.count();
  
  if (count === 0) {
    throw new Error(`No .btn--primary found on ${label}`);
  }
  
  const failures = [];
  
  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    // Skip hidden elements (e.g., fallback buttons in hidden divs)
    if (!await btn.isVisible().catch(() => false)) continue;
    
    const styles = await btn.evaluate(el => {
      const s = getComputedStyle(el);
      return JSON.stringify({
        paddingTop: parseInt(s.paddingTop),
        paddingBottom: parseInt(s.paddingBottom),
        paddingLeft: parseInt(s.paddingLeft),
        paddingRight: parseInt(s.paddingRight),
        color: s.color,
        backgroundColor: s.backgroundColor,
        borderWidth: s.borderWidth
      });
    });
    
    const computed = JSON.parse(styles);
    
    // Check padding (should be ~12px vertical, ~24px horizontal)
    if (computed.paddingTop < 10 || computed.paddingTop > 14) {
      failures.push(`${label}[${i}].paddingTop: expected ~12px, got ${computed.paddingTop}px`);
    }
    if (computed.paddingBottom < 10 || computed.paddingBottom > 14) {
      failures.push(`${label}[${i}].paddingBottom: expected ~12px, got ${computed.paddingBottom}px`);
    }
    if (computed.paddingLeft < 20 || computed.paddingLeft > 30) {
      failures.push(`${label}[${i}].paddingLeft: expected ~24px, got ${computed.paddingLeft}px`);
    }
    if (computed.paddingRight < 20 || computed.paddingRight > 30) {
      failures.push(`${label}[${i}].paddingRight: expected ~24px, got ${computed.paddingRight}px`);
    }
    
    // Check color (white text)
    const textColor = computed.color;
    if (!textColor.includes('255, 255, 255')) {
      failures.push(`${label}[${i}].color: expected white, got "${textColor}"`);
    }
    
    // Check background (sage green) — parse rgb(r, g, b)
    const bgMatch = computed.backgroundColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (!bgMatch) {
      failures.push(`${label}[${i}].backgroundColor: expected ~#6B7C54, got "${computed.backgroundColor}"`);
    } else {
      const [_, r, g, b] = bgMatch.map(Number);
      if (Math.abs(r - TARGET_BG_R) > 5 || Math.abs(g - TARGET_BG_G) > 5 || Math.abs(b - TARGET_BG_B) > 5) {
        failures.push(`${label}[${i}].backgroundColor: expected ~#6B7C54, got rgb(${r}, ${g}, ${b})`);
      }
    }
    
    // borderWidth should be 0px (no visible border)
    if (computed.borderWidth !== '0px') {
      failures.push(`${label}[${i}].borderWidth: expected "0px", got "${computed.borderWidth}"`);
    }
  }
  
  if (failures.length > 0) {
    throw new Error(`Style mismatches on ${label}:
  ` + failures.join('\n  '));
  }
}

async function testHoverOnPage(page, label) {
  // Test .btn--primary hover
  const primaryBtns = page.locator('.btn--primary');
  const primaryCount = await primaryBtns.count();
  
  for (let i = 0; i < primaryCount; i++) {
    const btn = primaryBtns.nth(i);
    const isVisible = await btn.isVisible().catch(() => false);
    if (!isVisible) continue;
    
    // Check :hover rule in stylesheets
    const hoverBg = await btn.evaluate((el, idx) => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === '.btn--primary:hover') {
              return rule.style.backgroundColor;
            }
          }
        } catch (e) {}
      }
      return null;
    }, i);
    
    if (hoverBg && hoverBg.startsWith('#')) {
      const r = parseInt(hoverBg.slice(1, 3), 16);
      const g = parseInt(hoverBg.slice(3, 5), 16);
      const b = parseInt(hoverBg.slice(5, 7), 16);
      // Target is ~#6B7A54 (darker sage)
      if (r < 90 || r > 120 || g < 100 || g > 135 || b < 60 || b > 95) {
        throw new Error(`${label}[${i}] hover bg should be ~#6B7A54, got ${hoverBg}`);
      }
    }
  }
}

// -------------------------------------------------------------------
// Button style tests — .btn--primary pages
// -------------------------------------------------------------------

test.describe('All .btn--primary buttons match target styles', () => {
  
  test('index.html — all btn--primary buttons match target', async ({ page }) => {
    await page.goto('/');
    await testBtnPrimaryButtons(page, 'index');
  });

  test('about.html — all btn--primary buttons match target', async ({ page }) => {
    await page.goto('/about.html');
    await testBtnPrimaryButtons(page, 'about');
  });

  test('faq.html — all btn--primary buttons match target', async ({ page }) => {
    await page.goto('/faq.html');
    await testBtnPrimaryButtons(page, 'faq');
  });

  test('contact.html — all btn--primary buttons match target', async ({ page }) => {
    await page.goto('/contact.html');
    await testBtnPrimaryButtons(page, 'contact');
  });

  test('404.html — btn--primary button matches target', async ({ page }) => {
    await page.goto('/404.html');
    await testBtnPrimaryButtons(page, '404');
  });

  test('types-of-therapy.html — all btn--primary buttons match target', async ({ page }) => {
    await page.goto('/types-of-therapy.html');
    await testBtnPrimaryButtons(page, 'therapy');
  });

  test('individual-therapy-for-adults.html — btn--primary button matches target', async ({ page }) => {
    await page.goto('/individual-therapy-for-adults.html');
    await testBtnPrimaryButtons(page, 'individual');
  });

  test('neurodivergent-affirming-therapy.html — btn--primary button matches target', async ({ page }) => {
    await page.goto('/neurodivergent-affirming-therapy.html');
    await testBtnPrimaryButtons(page, 'neuro');
  });

  test('trauma-ptsd-emdr-and-prolonged-exposure-therapy.html — btn--primary button matches target', async ({ page }) => {
    await page.goto('/trauma-ptsd-emdr-and-prolonged-exposure-therapy.html');
    await testBtnPrimaryButtons(page, 'trauma');
  });

});

// -------------------------------------------------------------------
// Button hover state tests
// -------------------------------------------------------------------

test.describe('Button hover states match target', () => {
  
  test('index.html — all buttons hover correctly', async ({ page }) => {
    await page.goto('/');
    await testHoverOnPage(page, 'index');
  });

  test('contact.html — all buttons hover correctly', async ({ page }) => {
    await page.goto('/contact.html');
    await testHoverOnPage(page, 'contact');
  });

  test('about.html — all buttons hover correctly', async ({ page }) => {
    await page.goto('/about.html');
    await testHoverOnPage(page, 'about');
  });

});

// -------------------------------------------------------------------
// Button text content verification
// -------------------------------------------------------------------

test.describe('Button text content verification', () => {
  
  test('index.html has correct CTA button text', async ({ page }) => {
    await page.goto('/');
    
    // Header CTA uses .btn--primary with navbar__cta class
    const headerCta = page.locator('.navbar__cta.btn--primary');
    expect(await headerCta.count()).toBeGreaterThan(0);
    
    const ctaText = await headerCta.first().textContent();
    expect(ctaText).toContain('Consultation');
  });

  test('contact.html has both CTA and Contact buttons', async ({ page }) => {
    await page.goto('/contact.html');
    
    // Header CTA (btn--primary)
    const headerCta = page.locator('.navbar__cta.btn--primary');
    expect(await headerCta.count()).toBeGreaterThan(0);
    
    const ctaText = await headerCta.first().textContent();
    expect(ctaText).toContain('Consultation');
    
    // Contact form button (spwidget-button with Contact form data attr)
    const contactBtn = page.locator('.spwidget-button[data-spwidget-type="Contact form"]');
    expect(await contactBtn.count()).toBeGreaterThan(0);
    
    const contactText = await contactBtn.first().textContent();
    expect(contactText).toBe('Contact');
  });

  test('All pages have CTA button in header/nav', async ({ page }) => {
    const pages = [
      '/', '/contact.html', '/about.html', '/faq.html', '/404.html',
      '/no-surprises-act.html', '/acceptable-use-policy.html',
      '/cookies-policy.html'
    ];

    for (const url of pages) {
      await page.goto(url);
      
      // Check for header CTA — either .navbar__cta.btn--primary or spwidget-button in navbar
      const headerCta = page.locator('.navbar__cta.btn--primary');
      const navSpWidget = page.locator('.navbar .spwidget-button-wrapper a, .navbar__mobile-cta .btn--primary');
      
      const ctaCount = await headerCta.count();
      const spCount = await navSpWidget.count();
      
      expect(ctaCount + spCount).toBeGreaterThan(0, `No CTA button found on ${url}`);
    }
  });

});

// -------------------------------------------------------------------
// No SimplePractice integration scripts remain
//
// NOTE: As of the contact-page booking-modal fix (Loop 2/3), the SimplePractice
// integration-1.0.js script IS intentionally loaded by booking-modal.js (it
// injects the script once per page). This describe block has been removed
// because the assertion "no integration script" was incorrect — without the
// script, the Contact button's native autobind cannot open the SP overlay.
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// Button link targets are correct
// -------------------------------------------------------------------

test.describe('Button link targets are correct', () => {
  
  test('Header CTA buttons on btn--primary pages link to /request', async ({ page }) => {
    await page.goto('/');
    
    const cta = page.locator('.navbar__cta.btn--primary');
    expect(await cta.count()).toBeGreaterThan(0);
    
    const href = await cta.first().getAttribute('href');
    expect(href).toContain('/request');
  });

  test('contact.html Contact button exists and is visible', async ({ page }) => {
    await page.goto('/contact.html');
    
    // The contact form widget button should exist
    const contactBtn = page.locator('.spwidget-button[data-spwidget-type="Contact form"]');
    expect(await contactBtn.count()).toBeGreaterThan(0);
  });

});

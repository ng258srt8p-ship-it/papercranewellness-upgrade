// Full redesign audit: open every page as file://, verify contract, log console errors
const { test, expect } = require('@playwright/test');
const path = require('path');

const PC = path.resolve(__dirname, '..');

const PAGES = [
 { file: 'index.html', current: 'Home' },
 { file: 'about.html', current: 'About' },
 { file: 'contact.html', current: 'Contact' },
 { file: 'faq.html', current: 'FAQ' },
 { file: 'individual-therapy-for-adults.html', current: null },
 { file: 'neurodivergent-affirming-therapy.html', current: null },
 { file: 'trauma-ptsd-emdr-and-prolonged-exposure-therapy.html', current: null },
 { file: '404.html', current: null },
];

const CANON = [
 { href: 'index.html',  text: 'Home'   },
 { href: 'about.html',  text: 'About'  },
 { href: 'faq.html',     text: 'FAQ'    },
 { href: 'contact.html', text: 'Contact' },
];

// All pages and nav links are at repo root — no ../ prefix needed.
// FAQ is at repo root (faq.html), same as the other pages.
const expectedHref = (i, page) => CANON[i].href;

for (const p of PAGES) {
  test.describe(`Redesign audit: ${p.file} (current=${p.current})`, () => {

    test(`1. primary nav has exactly 4 canonical links in order`, async ({ page }) => {
      const url = 'file://' + path.join(PC, p.file);
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const links = page.locator('.navbar__links a');
      await expect(links).toHaveCount(4);

      for (let i = 0; i < CANON.length; i++) {
        const link = links.nth(i);
        const href = (await link.getAttribute('href')) || '';
        const text = ((await link.textContent()) || '').trim();
        expect(href, `link ${i} href`).toBe(expectedHref(i, p));
        expect(text, `link ${i} text`).toBe(CANON[i].text);
      }
    });

    test(`2. aria-current="page" placement`, async ({ page }) => {
      const url = 'file://' + path.join(PC, p.file);
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const currentEls = await page.$$eval(
        '.navbar__links a[aria-current="page"]',
        nodes => nodes.map(n => (n.textContent || '').trim())
      );

      if (p.current) {
        expect(currentEls.length, 'exactly one aria-current on current pages').toBe(1);
        expect(currentEls[0], 'aria-current on the right link').toBe(p.current);
      } else {
        expect(currentEls.length, 'zero aria-current on neutral pages').toBe(0);
      }
    });

    test(`3. mobile menu mirrors primary nav`, async ({ page }) => {
      const url = 'file://' + path.join(PC, p.file);
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const links = page.locator('.navbar__mobile-links a');
      await expect(links).toHaveCount(4);

      for (let i = 0; i < CANON.length; i++) {
        const link = links.nth(i);
        const href = (await link.getAttribute('href')) || '';
        const text = ((await link.textContent()) || '').trim();
        expect(href, `mobile link ${i} href`).toBe(expectedHref(i, p));
        expect(text, `mobile link ${i} text`).toBe(CANON[i].text);
      }

      // Verify mobile CTA
      const cta = page.locator('.navbar__mobile-cta a[data-booking-modal]');
      await expect(cta).toHaveCount(1);
      await expect(cta).toHaveAttribute('href', 'https://papercranewellness.clientsecure.me/request');
    });

    test(`4. skip-link and hamburger button present`, async ({ page }) => {
      const url = 'file://' + path.join(PC, p.file);
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('.skip-link')).toHaveCount(1);
      await expect(page.locator('.navbar__hamburger')).toHaveCount(1);
    });

    test(`5. no console errors`, async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      const url = 'file://' + path.join(PC, p.file);
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      expect(errors.length, `console errors: ${errors.join('; ')}`).toBe(0);
    });

    test(`6. favicon link present`, async ({ page }) => {
      const url = 'file://' + path.join(PC, p.file);
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const link = page.locator('link[rel="icon"]');
      await expect(link).toHaveCount(1);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    });
  });
}
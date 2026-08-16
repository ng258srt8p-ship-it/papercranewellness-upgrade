// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Loop 6 — Production verification against papercrane-wellness-v2.pages.dev
 * Confirms the booking modal fix works on the live deployed site.
 */

test.describe('Production: booking modal + contact button', () => {
  test('L6.G1: Book button opens SP overlay on production', async ({ page }) => {
    await page.goto('https://papercrane-wellness-v2.pages.dev/contact', {
      waitUntil: 'domcontentloaded', timeout: 20000,
    });
    await page.waitForTimeout(3000);

    await page.locator('.navbar__cta:has-text("Book a Free")').first().click();

    // SP overlay should appear within 15s
    await expect(page.locator('.spwidget--overlay')).toBeVisible({ timeout: 15000 });
    // URL should NOT have changed to clientsecure.me
    expect(page.url()).toContain('papercrane-wellness-v2.pages.dev');
  });

  test('L6.G2: Contact button opens SP overlay on production', async ({ page }) => {
    await page.goto('https://papercrane-wellness-v2.pages.dev/contact', {
      waitUntil: 'domcontentloaded', timeout: 20000,
    });
    await page.waitForTimeout(3000);

    await page.locator('.spwidget-button[data-spwidget-type="Contact form"]').first().click();
    await expect(page.locator('.spwidget--overlay')).toBeVisible({ timeout: 15000 });
  });

  test('L6.G3: index.html Book button opens SP overlay on production', async ({ page }) => {
    await page.goto('https://papercrane-wellness-v2.pages.dev/', {
      waitUntil: 'domcontentloaded', timeout: 20000,
    });
    await page.waitForTimeout(3000);

    const hero = page.locator('main a:has-text("Book a Free 15 Minute Consultation")').first();
    await hero.click();
    await expect(page.locator('.spwidget--overlay')).toBeVisible({ timeout: 15000 });
  });
});

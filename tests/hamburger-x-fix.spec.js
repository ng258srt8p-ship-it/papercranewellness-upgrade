const { test, expect } = require('@playwright/test');

test.describe('Hamburger X icon fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('hamburger shows lines by default', async ({ page }) => {
    const lines = page.locator('.hamburger-icon--lines');
    const x = page.locator('.hamburger-icon--x');
    await expect(lines).toBeVisible();
    await expect(x).not.toBeVisible();
  });

  test('clicking hamburger shows X and opens menu', async ({ page }) => {
    const hamburger = page.locator('.navbar__hamburger');
    const lines = page.locator('.hamburger-icon--lines');
    const x = page.locator('.hamburger-icon--x');
    const mobileMenu = page.locator('.navbar__mobile-menu');

    await hamburger.click();
    
    await expect(x).toBeVisible();
    await expect(lines).not.toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(mobileMenu).toHaveClass(/is-open/);
  });

  test('clicking X closes menu and shows lines', async ({ page }) => {
    const hamburger = page.locator('.navbar__hamburger');
    const lines = page.locator('.hamburger-icon--lines');
    const x = page.locator('.hamburger-icon--x');
    const mobileMenu = page.locator('.navbar__mobile-menu');

    await hamburger.click();
    await expect(x).toBeVisible();
    
    await hamburger.click();
    await expect(lines).toBeVisible();
    await expect(x).not.toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(mobileMenu).not.toHaveClass(/is-open/);
  });

  test('X icon has correct SVG structure (2 diagonal lines)', async ({ page }) => {
    const hamburger = page.locator('.navbar__hamburger');
    
    await hamburger.click();
    
    const xSvg = page.locator('.hamburger-icon--x');
    await expect(xSvg).toBeVisible();
    
    const xLines = await xSvg.locator('line').count();
    expect(xLines).toBe(2);
  });

  test('works across all pages', async ({ page }) => {
    const pages = [
      '/about.html', '/faq.html', '/contact.html', 
      '/types-of-therapy.html', '/404.html'
    ];
    
    for (const p of pages) {
      await page.goto(p, { waitUntil: 'domcontentloaded' });
      
      const hamburger = page.locator('.navbar__hamburger');
      const lines = page.locator('.hamburger-icon--lines');
      const x = page.locator('.hamburger-icon--x');
      
      // Default state
      await expect(lines).toBeVisible({ timeout: 5000 });
      await expect(x).not.toBeVisible();
      
      // Click to open
      await hamburger.click();
      await expect(x).toBeVisible();
      await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
      
      // Click to close
      await hamburger.click();
      await expect(lines).toBeVisible();
      await expect(x).not.toBeVisible();
    }
  });
});

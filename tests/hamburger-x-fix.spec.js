const { test, expect } = require('@playwright/test');

test.describe('Hamburger X icon animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('hamburger button visible with 3 lines by default', async ({ page }) => {
    const hamburger = page.locator('.navbar__hamburger');
    const bars = page.locator('.hamburger-bar');
    await expect(hamburger).toBeVisible();
    await expect(bars).toHaveCount(3);
  });

  test('clicking hamburger animates to X and opens menu', async ({ page }) => {
    const hamburger = page.locator('.navbar__hamburger');
    const bars = page.locator('.hamburger-bar');
    const mobileMenu = page.locator('.navbar__mobile-menu');

    await hamburger.click();
    
    // aria-expanded should be true
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    // Menu should be open
    await expect(mobileMenu).toHaveClass(/is-open/);
    // Bars should still exist in DOM (middle one fades via opacity)
    await expect(bars).toHaveCount(3);
  });

  test('clicking X closes menu and reverts to lines', async ({ page }) => {
    const hamburger = page.locator('.navbar__hamburger');
    const bars = page.locator('.hamburger-bar');
    const mobileMenu = page.locator('.navbar__mobile-menu');

    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    
    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(mobileMenu).not.toHaveClass(/is-open/);
    await expect(bars).toHaveCount(3);
  });

  test('X animation applies transforms to bars', async ({ page }) => {
    const hamburger = page.locator('.navbar__hamburger');
    const topBar = page.locator('.hamburger-bar').first();
    const midBar = page.locator('.hamburger-bar').nth(1);
    
    await hamburger.click();
    
    // Wait for CSS transition to complete
    await page.waitForTimeout(300);
    
    // Top bar should have a transform applied (not identity matrix)
    const topTransform = await topBar.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    expect(topTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
    
    // Middle bar should be faded (opacity 0)
    const midOpacity = await midBar.evaluate(el => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(midOpacity)).toBeLessThan(0.1);
  });

  test('works across all pages', async ({ page }) => {
    const pages = [
      '/about.html', '/faq.html', '/contact.html', 
      '/types-of-therapy.html', '/404.html'
    ];
    
    for (const p of pages) {
      await page.goto(p, { waitUntil: 'domcontentloaded' });
      
      const hamburger = page.locator('.navbar__hamburger');
      const bars = page.locator('.hamburger-bar');
      
      // Default: hamburger visible with 3 bars
      await expect(hamburger).toBeVisible();
      await expect(bars).toHaveCount(3);
      
      // Click to open
      await hamburger.click();
      await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
      
      // Click to close
      await hamburger.click();
      await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    }
  });
});

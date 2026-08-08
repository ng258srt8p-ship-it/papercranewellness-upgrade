// Production verification: check all pages are live on the deployed site
const { test, expect } = require('@playwright/test');

const BASE = 'https://papercrane-wellness-v2.pages.dev';

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about.html', name: 'About' },
  { path: '/contact.html', name: 'Contact' },
  { path: '/faq.html', name: 'FAQ' },
  { path: '/individual-therapy-for-adults.html', name: 'Individual Therapy' },
  { path: '/neurodivergent-affirming-therapy.html', name: 'Neurodivergent Therapy' },
  { path: '/trauma-ptsd-emdr-and-prolonged-exposure-therapy.html', name: 'Trauma/PTSD Therapy' },
  { path: '/types-of-therapy.html', name: 'Types of Therapy' },
];

for (const p of PAGES) {
  test(`${p.name}: ${p.path} loads successfully`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const status = page.url();
    expect(status).toContain('papercrane-wellness-v2.pages.dev');
    
    // Should not be a 404
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('Page Not Found');
  });

  test(`${p.name}: has valid navbar with 4 links`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const navLinks = page.locator('.navbar__links a');
    await expect(navLinks).toHaveCount(4);
  });

  test(`${p.name}: no console errors`, async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);
    expect(errors.length).toBe(0);
  });
}

// Test the 404 page specifically
test('404 page returns proper error', async ({ page }) => {
  await page.goto(BASE + '/this-page-does-not-exist-xyz.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toContain('404');
});

// Test booking modal trigger exists on home
test('Home has booking CTA', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  // Verify at least one booking CTA exists on the home page
  const bookingBtns = page.locator('[data-booking-modal]').first();
  await expect(bookingBtns).toBeVisible();
});

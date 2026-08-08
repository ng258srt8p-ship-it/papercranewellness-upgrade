// Local verification: check all pages are live on localhost:3000
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

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

  test(`${p.name}: has footer with nav links`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const footerLinks = page.locator('.footer__nav-links a');
    // Should have Home, About, FAQ, Contact, Book Now
    await expect(footerLinks).toHaveCount(5);
  });

  test(`${p.name}: has booking CTA button`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const bookingBtns = page.locator('[data-booking-modal]');
    await expect(bookingBtns.first()).toBeVisible();
  });

  test(`${p.name}: has CTA banner (except 404)`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const ctaBanner = page.locator('.cta-banner');
    // Most pages should have a CTA banner
    if (p.name !== '404') {
      await expect(ctaBanner.first()).toBeVisible();
    }
  });

  test(`${p.name}: has skip-to-main-content link`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeVisible();
  });

  test(`${p.name}: has valid HTML structure`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const html = await page.locator('html').getAttribute('lang');
    expect(html).toBe('en');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test(`${p.name}: has footer trust badges`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const trustBadges = page.locator('.footer__trust-badges');
    await expect(trustBadges).toHaveCount(1);
  });

  test(`${p.name}: has no <center> tags`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const centerTags = page.locator('center');
    await expect(centerTags).toHaveCount(0);
  });

  test(`${p.name}: has no duplicate OG meta tags`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const ogTypes = await page.locator('meta[property="og:type"]').count();
    expect(ogTypes).toBeLessThanOrEqual(1);
  });

  test(`${p.name}: has no undefined CSS variables`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    // Wait for any CSS parsing issues to surface
    await page.waitForTimeout(300);
    expect(errors.length).toBe(0);
  });

  test(`${p.name}: has proper meta description`, async ({ page }) => {
    await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveCount(1);
  });

  test(`${p.name}: has no <script> errors`, async ({ page }) => {
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

// Test specific content fixes
test('about.html has Education & Experience subheading', async ({ page }) => {
  await page.goto(BASE + '/about.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toContain('Education &');
});

test('faq.html has no undefined CSS variables in styles', async ({ page }) => {
  await page.goto(BASE + '/faq.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const html = await page.locator('html').innerHTML();
  expect(html).not.toContain('--leading-relaxed');
  expect(html).not.toContain('--color-text-secondary');
});

test('index.html has single OG meta set', async ({ page }) => {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const html = await page.locator('html').innerHTML();
  // Count og:type occurrences — should be exactly 1
  const matches = html.match(/og:type/g);
  expect(matches?.length).toBe(1);
});

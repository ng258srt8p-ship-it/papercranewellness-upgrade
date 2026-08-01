// Content/SEO audit: image alt coverage, contact info, links sanity
const { test, expect } = require('@playwright/test');
const path = require('path');

const PC = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'about.html', 'contact.html', 'faq.html',
               'individual-therapy-for-adults.html',
               'neurodivergent-affirming-therapy.html',
               'trauma-ptsd-emdr-and-prolonged-exposure-therapy.html',
               'blog/index.html', '404.html'];

for (const f of PAGES) {
  test(`content audit: ${f}`, async ({ page }) => {
    const url = 'file://' + path.join(PC, f);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // 1. All <img> have non-empty alt
    const imgs = page.locator('img');
    const count = await imgs.count();
    for (let i = 0; i < count; i++) {
      const alt = await imgs.nth(i).getAttribute('alt');
      expect(alt, `${f} img #${i} alt`).not.toBeNull();
      expect(alt?.trim().length ?? 0, `${f} img #${i} alt non-empty`).toBeGreaterThan(0);
    }

    // 2. Page has <main id="main-content">
    await expect(page.locator('main#main-content')).toHaveCount(1);

    // 3. Skip link works
    const skip = page.locator('.skip-link');
    await expect(skip).toHaveCount(1);
    await expect(skip).toHaveAttribute('href', '#main-content');

    // 4. Title present
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toMatch(/Paper Crane Wellness/);

    // 5. Contact info present (email + phone)
    const email = page.locator('a[href^="mailto:concierge@papercranewellness.com"]');
    if (f === '404.html' || f === 'faq.html') {
      // 404 has contact in footer; faq has it too
      await expect(email.first()).toHaveCount(1);
    } else {
      await expect(email.first()).toHaveCount(1);
    }

    // 6. Address is #106 (correct)
    const html = await page.content();
    expect(html.includes('#106')).toBe(true);
    expect(html.includes('#129')).toBe(false);
  });
}

test('sitemap.xml exists', async () => {
  const fs = require('fs');
  expect(fs.existsSync(path.join(PC, 'sitemap.xml'))).toBe(true);
});

test('robots.txt exists', async () => {
  const fs = require('fs');
  expect(fs.existsSync(path.join(PC, 'robots.txt'))).toBe(true);
});

test('favicon.png exists', async () => {
  const fs = require('fs');
  expect(fs.existsSync(path.join(PC, 'favicon.png'))).toBe(true);
});
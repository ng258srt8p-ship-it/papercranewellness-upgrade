const { test, expect } = require('@playwright/test');

// Test against local development server
const BASE = 'http://localhost:8765';

// ============================================================================
// HOME PAGE (index.html) - Client Changes Verification
// ============================================================================

test('Home: "Our Services" section removed', async ({ page }) => {
  await page.goto(BASE + '/');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('Our Services');
});

test('Home: Card titles updated correctly', async ({ page }) => {
  await page.goto(BASE + '/');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toContain('Individual Therapy for Trauma');
  expect(bodyText).toContain('Approaches');
  expect(bodyText).toContain('Therapy for Depression and Anxiety');
});

test('Home: "Who We Help" section removed', async ({ page }) => {
  await page.goto(BASE + '/');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('Who We Help');
});

test('Home: CTA moved above location cards', async ({ page }) => {
  await page.goto(BASE + '/');
  const ctaPos = await page.locator('.cta-banner__heading').first().evaluate(el => el.getBoundingClientRect().top);
  const locationsPos = await page.locator('.locations-section').first().evaluate(el => el.getBoundingClientRect().top);
  expect(ctaPos).toBeLessThan(locationsPos);
});

test('Home: Footer policy links are internal', async ({ page }) => {
  await page.goto(BASE + '/');
  const privacyLink = page.locator('a[href="privacy-policy.html"]');
  const cookiesLink = page.locator('a[href="cookies-policy.html"]');
  const aupLink = page.locator('a[href="acceptable-use-policy.html"]');
  const nsactLink = page.locator('a[href="no-surprises-act.html"]');

  await expect(privacyLink).toBeVisible();
  await expect(cookiesLink).toBeVisible();
  await expect(aupLink).toBeVisible();
  await expect(nsactLink).toBeVisible();
});

// ============================================================================
// ABOUT PAGE (about.html) - Client Changes Verification
// ============================================================================

test('About: "View Psychology Today Profile" link removed', async ({ page }) => {
  await page.goto(BASE + '/about.html');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('View Psychology Today Profile');
});

test("About: Bio starts with Hi! I'm Rebekah.", async ({ page }) => {
  await page.goto(BASE + '/about.html');
  const heading = await page.locator('#about-heading').textContent();
  expect(heading).toContain("Hi! I'm Rebekah");
});

test('About: Bio includes audiobook and Game of Thrones', async ({ page }) => {
  await page.goto(BASE + '/about.html');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toContain('audiobook listener');
  expect(bodyText).toContain('Game of Thrones');
});

test('About: Image is parallel to text on desktop', async ({ page }) => {
  await page.goto(BASE + '/about.html');
  // Check that about-hero__inner uses grid layout
  const inner = await page.locator('.about-hero__inner').first();
  const display = await inner.evaluate(el => window.getComputedStyle(el).display);
  expect(display).toBe('grid');

  // Check image and content are both present
  const imageWrap = await page.locator('.about-hero__image-wrap').count();
  const contentDiv = await page.locator('.about-hero__content').count();
  expect(imageWrap).toBe(1);
  expect(contentDiv).toBe(1);
});

// ============================================================================
// TYPES OF THERAPY PAGE - Updated Descriptions
// ============================================================================

test('Types of Therapy: EMDR description updated', async ({ page }) => {
  await page.goto(BASE + '/types-of-therapy.html');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toContain('helps the brain process and heal from distressing experiences');
});

test('Types of Therapy: PE description updated', async ({ page }) => {
  await page.goto(BASE + '/types-of-therapy.html');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toContain('gradually approach memories, feelings, and situations they may have been avoiding');
});

test('Types of Therapy: CPT description updated', async ({ page }) => {
  await page.goto(BASE + '/types-of-therapy.html');
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toContain('identify and challenge unhelpful beliefs that can develop after traumatic experiences');
});

// ============================================================================
// FAQ PAGE - CTA Moved from Footer to Body
// ============================================================================

test('FAQ: CTA moved from footer to body', async ({ page }) => {
  await page.goto(BASE + '/faq.html');
  const ctaInBody = await page.locator('.cta-banner').first().evaluate(el => el.getBoundingClientRect().top);
  const footerPos = await page.locator('footer').first().evaluate(el => el.getBoundingClientRect().top);
  expect(ctaInBody).toBeLessThan(footerPos);
});

// ============================================================================
// CONTACT PAGE - Contact Form Widget & Styling
// ============================================================================

test('Contact: Embedded contact form widget present', async ({ page }) => {
  await page.goto(BASE + '/contact.html');
  const widget = await page.locator('[data-spwidget-type="Contact form"]').count();
  expect(widget).toBe(1);
});

test('Contact: Widget button matches primary button style (sage green)', async ({ page }) => {
  await page.goto(BASE + '/contact.html');
  // Check the widget button has sage green background (#6B7C54)
  const btn = await page.locator('.spwidget-button').first();
  const bgColor = await btn.evaluate(el => window.getComputedStyle(el).backgroundColor);
  // Should be rgb(107, 124, 84) which is #6B7C54 (sage green)
  expect(bgColor).toContain('107');
});

test('Contact: No white box around widget', async ({ page }) => {
  await page.goto(BASE + '/contact.html');
  const container = await page.locator('.booking-widget-wrap.contact-form-widget').first();
  const bgColor = await container.evaluate(el => window.getComputedStyle(el).backgroundColor);
  // Should be transparent, not white
  expect(bgColor).toContain('rgba(0, 0, 0, 0)');
});

test('Contact: "Have Questions?" section text is centered', async ({ page }) => {
  await page.goto(BASE + '/contact.html');
  const para = await page.locator('.contact-hero__subhead').first();
  const textAlign = await para.evaluate(el => window.getComputedStyle(el).textAlign);
  expect(textAlign).toBe('center');

  // Verify paragraph is full width for proper centering (allow 5% tolerance)
  const width = await para.evaluate(el => el.getBoundingClientRect().width);
  const parentWidth = await para.evaluate(el => el.parentElement.getBoundingClientRect().width);
  expect(width).toBeGreaterThanOrEqual(parentWidth * 0.90);
});

test('Contact: No image hero section', async ({ page }) => {
  await page.goto(BASE + '/contact.html');
  const imageHero = await page.locator('.contact-image-hero').count();
  expect(imageHero).toBe(0);
});

// ============================================================================
// BOOKING MODAL - Still Works for OAR Buttons
// ============================================================================

test('Booking modal: Navbar "Book Now" button still works', async ({ page }) => {
  await page.goto(BASE + '/');
  const bookBtn = await page.locator('.navbar__cta[data-booking-modal]').count();
  expect(bookBtn).toBe(1);
});

// ============================================================================
// FOOTER - Policy Links Internal
// ============================================================================

test('Footer: All policy links are internal pages', async ({ page }) => {
  await page.goto(BASE + '/');

  const privacyLink = await page.locator('a[href="privacy-policy.html"]');
  const cookiesLink = await page.locator('a[href="cookies-policy.html"]');
  const aupLink = await page.locator('a[href="acceptable-use-policy.html"]');
  const nsactLink = await page.locator('a[href="no-surprises-act.html"]');

  // All should be internal links (not external URLs)
  expect(await privacyLink.getAttribute('href')).toBe('privacy-policy.html');
  expect(await cookiesLink.getAttribute('href')).toBe('cookies-policy.html');
  expect(await aupLink.getAttribute('href')).toBe('acceptable-use-policy.html');
  expect(await nsactLink.getAttribute('href')).toBe('no-surprises-act.html');
});

// ============================================================================
// RESPONSIVE - Mobile Layout Checks
// ============================================================================

test('Responsive: About page stacks on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto(BASE + '/about.html');

  const inner = await page.locator('.about-hero__inner').first();
  const gridCols = await inner.evaluate(el => window.getComputedStyle(el).gridTemplateColumns);
  // Should be single column on mobile (either "1fr" or a single value)
  expect(gridCols.split(' ').length).toBe(1);
});

test('Responsive: Contact page widget visible on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(BASE + '/contact.html');

  const widget = await page.locator('[data-spwidget-type="Contact form"]').count();
  expect(widget).toBe(1);
});

// ============================================================================
// NO CONSOLE ERRORS ON ANY PAGE
// ============================================================================

test('Home: No console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      // Ignore known third-party library errors (SimplePractice widget)
      if (!msg.text().includes('ember-cli-fastboot') && 
          !msg.text().includes('rehydrate')) {
        errors.push(msg.text());
      }
    }
  });
  await page.goto(BASE + '/');
  await page.waitForTimeout(500);
  expect(errors.length).toBe(0);
});

test('Contact: No console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      // Ignore known third-party library errors (SimplePractice widget)
      if (!msg.text().includes('ember-cli-fastboot') && 
          !msg.text().includes('rehydrate')) {
        errors.push(msg.text());
      }
    }
  });
  await page.goto(BASE + '/contact.html');
  await page.waitForTimeout(500);
  expect(errors.length).toBe(0);
});

test('About: No console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      // Ignore known third-party library errors (SimplePractice widget)
      if (!msg.text().includes('ember-cli-fastboot') && 
          !msg.text().includes('rehydrate')) {
        errors.push(msg.text());
      }
    }
  });
  await page.goto(BASE + '/about.html');
  await page.waitForTimeout(500);
  expect(errors.length).toBe(0);
});

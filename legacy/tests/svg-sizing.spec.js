const { test, expect } = require('@playwright/test');

// Helper: check that an SVG has explicit width/height attributes or is styled to a reasonable size
async function verifySvgSizing(page, selector, maxExpectedWidth = 200) {
  const svg = page.locator(selector).first();
  
  // Check the SVG exists
  await expect(svg).toBeVisible();
  
  // Get computed style dimensions
  const width = await svg.evaluate(el => window.getComputedStyle(el).width);
  const height = await svg.evaluate(el => window.getComputedStyle(el).height);
  
  console.log(`SVG ${selector}: rendered ${width} x ${height}`);
  
  // SVG should not be full-width (more than maxExpectedWidth)
  const widthNum = parseInt(width, 10);
  expect(widthNum).toBeLessThanOrEqual(maxExpectedWidth);
  
  // SVG should have a reasonable height too
  const heightNum = parseInt(height, 10);
  expect(heightNum).toBeGreaterThan(0);
}

test.describe('SVG Icon Sizing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('location card icons should have explicit dimensions and not be full-width', async ({ page }) => {
    // Check both location card SVGs
    const locationIcons = page.locator('.location-card__icon');
    const count = await locationIcons.count();
    expect(count).toBe(2);
    
    for (let i = 0; i < count; i++) {
      const icon = locationIcons.nth(i);
      
      // Check explicit width/height attributes exist
      const hasWidthAttr = await icon.getAttribute('width');
      const hasHeightAttr = await icon.getAttribute('height');
      expect(hasWidthAttr).not.toBeNull();
      expect(hasHeightAttr).not.toBeNull();
      
      // Verify rendered size is reasonable (should be ~32px based on our fix)
      const width = await icon.evaluate(el => window.getComputedStyle(el).width);
      const widthNum = parseInt(width, 10);
      console.log(`Location card icon ${i + 1}: ${width}`);
      
      // Should be small (around 32px), not full-width
      expect(widthNum).toBeGreaterThan(0);
      expect(widthNum).toBeLessThanOrEqual(100); // generous upper bound
    }
  });

  test('hamburger menu SVG should have explicit dimensions', async ({ page }) => {
    const hamburgerSvg = page.locator('.navbar__hamburger svg');
    
    // Hamburger may be hidden on desktop (display:none), but it must exist in DOM with correct CSS sizing
    await expect(hamburgerSvg).toHaveCount(1);
    
    // Check it has CSS styling for size (from NavBar.css)
    const width = await hamburgerSvg.evaluate(el => window.getComputedStyle(el).width);
    console.log(`Hamburger SVG: ${width}`);
    
    // Should be 24px as defined in NavBar.css
    expect(width).toBe('24px');
  });

  test('testimonial carousel arrows should have explicit dimensions', async ({ page }) => {
    const prevArrow = page.locator('.testimonial-carousel__arrow--prev svg');
    const nextArrow = page.locator('.testimonial-carousel__arrow--next svg');
    
    // Arrows might not be visible if there are no testimonials, but they should exist in DOM
    const prevWidth = await prevArrow.evaluate(el => window.getComputedStyle(el).width);
    const nextWidth = await nextArrow.evaluate(el => window.getComputedStyle(el).width);
    
    console.log(`Testimonial arrows: ${prevWidth}, ${nextWidth}`);
    
    // Should be 18px as defined in TestimonialCarousel.css
    expect(prevWidth).toBe('18px');
    expect(nextWidth).toBe('18px');
  });

  test('all inline SVGs on homepage should not exceed reasonable width', async ({ page }) => {
    const svgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('svg')).map(svg => ({
        class: svg.className.baseVal || '',
        width: window.getComputedStyle(svg).width,
        height: window.getComputedStyle(svg).height,
        hasWidthAttr: svg.hasAttribute('width'),
        hasHeightAttr: svg.hasAttribute('height'),
      }));
    });
    
    console.log(`Found ${svgs.length} SVGs on homepage`);
    
    for (const svg of svgs) {
      const widthNum = parseInt(svg.width, 10);
      
      // Skip logo SVG if it's an img element
      if (svg.class.includes('navbar__logo')) continue;
      
      console.log(`  ${svg.class || 'unnamed'}: ${svg.width} x ${svg.height}, attrs: w=${svg.hasWidthAttr}, h=${svg.hasHeightAttr}`);
      
      // All SVGs should have reasonable width (not full page width)
      expect(widthNum).toBeLessThanOrEqual(200);
    }
  });
});

test.describe('SVG Icon Sizing - Other Pages', () => {
  test('hamburger SVG on about page should be properly sized', async ({ page }) => {
    await page.goto('/about.html');
    
    const hamburgerSvg = page.locator('.navbar__hamburger svg');
    // Hamburger may be hidden on desktop, but must exist in DOM with correct sizing
    await expect(hamburgerSvg).toHaveCount(1);
    
    const width = await hamburgerSvg.evaluate(el => window.getComputedStyle(el).width);
    expect(width).toBe('24px');
  });

  test('hamburger SVG on contact page should be properly sized', async ({ page }) => {
    await page.goto('/contact.html');
    
    const hamburgerSvg = page.locator('.navbar__hamburger svg');
    // Hamburger may be hidden on desktop, but must exist in DOM with correct sizing
    await expect(hamburgerSvg).toHaveCount(1);
    
    const width = await hamburgerSvg.evaluate(el => window.getComputedStyle(el).width);
    expect(width).toBe('24px');
  });

  test('hamburger SVG on FAQ page should be properly sized', async ({ page }) => {
    await page.goto('/faq.html');
    
    const hamburgerSvg = page.locator('.navbar__hamburger svg');
    // Hamburger may be hidden on desktop, but must exist in DOM with correct sizing
    await expect(hamburgerSvg).toHaveCount(1);
    
    const width = await hamburgerSvg.evaluate(el => window.getComputedStyle(el).width);
    expect(width).toBe('24px');
  });
});

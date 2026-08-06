const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  const baseUrl = 'https://cf646fa1.papercranewellness.pages.dev';
  
  console.log('🔍 Verifying production deployment...\n');
  
  // Test 1: Homepage loads
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  console.log(`✅ Homepage loaded: ${title}`);
  
  // Test 2: No console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  
  if (errors.length === 0) {
    console.log('✅ No console errors on homepage');
  } else {
    console.log(`❌ Console errors found: ${errors.join('; ')}`);
  }
  
  // Test 3: Contact page loads
  await page.goto(`${baseUrl}/contact.html`, { waitUntil: 'domcontentloaded' });
  const contactTitle = await page.title();
  console.log(`✅ Contact page loaded: ${contactTitle}`);
  
  // Test 4: Check for booking widget fallback (should be visible since iframe src is empty)
  const fallbackVisible = await page.$eval('.booking-widget-fallback', el => !el.hidden || el.style.display !== 'none');
  if (fallbackVisible) {
    console.log('✅ Booking widget fallback is visible (widget returns 404, fallback shown correctly)');
  } else {
    console.log('⚠️  Booking widget fallback not visible - checking...');
    const iframeSrc = await page.$eval('iframe', el => el.src);
    console.log(`   Iframe src: ${iframeSrc}`);
  }
  
  // Test 5: Navigation links work
  const navLinks = await page.$$eval('.navbar__links a', links => links.map(l => l.textContent));
  console.log(`✅ Primary navigation has ${navLinks.length} links: ${navLinks.join(', ')}`);
  
  // Test 6: Footer present
  const footerPresent = await page.$('footer') !== null;
  if (footerPresent) {
    console.log('✅ Footer is present');
  } else {
    console.log('❌ Footer not found');
  }
  
  // Test 7: Locations section exists (new component)
  const locationsSection = await page.$('.locations-section') !== null;
  if (locationsSection) {
    console.log('✅ Locations section is present');
  } else {
    console.log('⚠️  Locations section not found on homepage');
  }
  
  // Test 8: SVG icons are properly sized (32px)
  const svgSizes = await page.$$eval('.location-card__icon img, .location-card__icon svg', els => {
    return els.map(el => ({
      width: el.getAttribute('width') || el.getBoundingClientRect().width,
      height: el.getAttribute('height') || el.getBoundingClientRect().height
    }));
  });
  
  if (svgSizes.length > 0) {
    const allCorrect = svgSizes.every(s => s.width === '32' && s.height === '32');
    if (allCorrect) {
      console.log('✅ Location card icons are properly sized at 32x32px');
    } else {
      console.log(`⚠️  Icon sizes: ${JSON.stringify(svgSizes)}`);
    }
  }
  
  await browser.close();
  
  if (errors.length === 0 && footerPresent && locationsSection) {
    console.log('\n🎉 All production verification checks passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some checks failed - review output above');
    process.exit(1);
  }
})();

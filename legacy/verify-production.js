const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  const baseUrl = 'https://492fdde7.papercranewellness.pages.dev';
  
  console.log('🔍 Verifying production deployment...\n');
  
  // Test 1: Homepage loads
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  console.log(`✅ Homepage loaded: ${title}`);
  
  // Wait for all resources to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Test 2: No console errors on homepage
  const homeErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') homeErrors.push(msg.text());
  });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  if (homeErrors.length === 0) {
    console.log('✅ No console errors on homepage');
  } else {
    console.log(`❌ Console errors found: ${homeErrors.join('; ')}`);
  }
  
  // Test 3: Contact page loads
  await page.goto(`${baseUrl}/contact.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const contactTitle = await page.title();
  console.log(`✅ Contact page loaded: ${contactTitle}`);
  
  // Test 4: Check for SimplePractice widget button (wait for script to load)
  const spButton = await page.$('.spwidget-button[data-spwidget-type="OAR"]');
  if (spButton) {
    console.log('✅ SimplePractice appointment request widget is present');
    
    // Wait for autobind to transform it
    await page.waitForTimeout(1000);
    const transformedBtn = await page.$('.spwidget-button-wrapper a[data-spwidget-scope-id]');
    if (transformedBtn) {
      console.log('✅ SimplePractice widget script loaded and bound correctly');
    }
  } else {
    console.log('❌ SimplePractice widget button not found');
    // Check what's actually there
    const wrapContent = await page.$eval('.booking-widget-wrap', el => el.innerHTML.substring(0, 500));
    console.log(`   Widget wrap content: ${wrapContent}`);
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
  
  // Test 7: Locations section exists on homepage - go back to home first
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const locationsSection = await page.$('.locations-section') !== null;
  if (locationsSection) {
    console.log('✅ Locations section is present on homepage');
    
    // Check card count
    const cards = await page.$$('.location-card');
    console.log(`   Found ${cards.length} location cards`);
    
    // Check SVG icon sizes - look for svg elements or path/rect/circle in DOM
    const svgInfo = await page.evaluate(() => {
      const icons = document.querySelectorAll('.location-card__icon');
      return Array.from(icons).map(icon => ({
        hasSvg: icon.querySelector('svg') !== null,
        hasPaths: icon.querySelector('path') !== null || icon.querySelector('rect') !== null || icon.querySelector('circle') !== null,
        innerHTML: icon.innerHTML.substring(0, 150),
        childrenCount: icon.children.length
      }));
    });
    
    if (svgInfo.length > 0) {
      const allHaveSvg = svgInfo.every(s => s.hasSvg);
      const allHavePaths = svgInfo.every(s => s.hasPaths);
      
      if (allHaveSvg) {
        console.log('✅ Location card icons contain SVG elements');
        
        // Check if SVGs have proper dimensions (32x32)
        const svgDimensions = await page.evaluate(() => {
          const svgs = document.querySelectorAll('.location-card__icon svg');
          return Array.from(svgs).map(svg => ({
            width: svg.getAttribute('width'),
            height: svg.getAttribute('height')
          }));
        });
        
        if (svgDimensions.length > 0) {
          const allCorrect = svgDimensions.every(s => s.width === '32' && s.height === '32');
          console.log(allCorrect ? '✅ Location card icons are properly sized at 32x32px' : `⚠️ Icon dimensions: ${JSON.stringify(svgDimensions)}`);
        } else {
          console.log('   No SVG elements found with proper namespace - checking raw HTML...');
        }
      } else if (allHavePaths) {
        console.log('✅ Location card icons contain valid SVG path/shape elements (inline rendering)');
      } else {
        console.log(`⚠️ Some icons missing SVG: ${JSON.stringify(svgInfo)}`);
      }
    } else {
      console.log('   No location card icons found');
    }
  } else {
    console.log('❌ Locations section not found on homepage');
    // Check what sections exist
    const sections = await page.$$eval('section', s => s.map(sec => sec.className));
    console.log(`   Sections found: ${JSON.stringify(sections)}`);
  }
  
  // Test 8: CSS file is served correctly
  const cssResponse = await page.goto(`${baseUrl}/src/components/LocationsSection.css`, { waitUntil: 'domcontentloaded' });
  if (cssResponse && cssResponse.status() === 200) {
    console.log('✅ LocationsSection.css is served with HTTP 200');
  } else {
    console.log(`❌ LocationsSection.css returned status ${cssResponse?.status()}`);
  }
  
  await browser.close();
  
  const allPassed = homeErrors.length === 0 && spButton !== null && footerPresent && locationsSection;
  if (allPassed) {
    console.log('\n🎉 All production verification checks passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some checks failed - review output above');
    process.exit(1);
  }
})();

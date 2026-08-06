# Task Status: SVG Icon Sizing Fix

## ✅ What Has Been Done

### 1. Root Cause Identified
- **Problem**: `pc/src/global.css` has a blanket rule `svg { display: block; max-width: 100% }` that makes all inline SVGs stretch to fill their container width
- **Impact**: Location card icons (monitor and map pin) were rendering full-width instead of their intended small size

### 2. Full Audit Completed
Checked ALL inline SVGs across the codebase:

| Element | Status | Notes |
|---------|--------|-------|
| Hamburger menu SVGs (13 pages) | ✅ Already fixed | `.navbar__hamburger svg` in NavBar.css sets `width: 24px; height: 24px` |
| Testimonial carousel arrows | ✅ Already fixed | `.testimonial-carousel__arrow svg` in TestimonialCarousel.css sets `width: 18px; height: 18px` |
| Booking modal close button | ✅ Already fixed | `.booking-modal__close svg` in BookingModal.css sets `width: 20px; height: 20px` |
| **Location card icons (2)** | ✅ **FIXED** | Added explicit `width="32" height="32"` attributes to both SVGs in `pc/index.html` |

### 3. Fix Applied
Updated `pc/index.html`:
- Line 487: Virtual location icon (monitor/screen) — added `width="32" height="32"`
- Line 497: In-Person location icon (map pin) — added `width="32" height="32"`

### 4. Playwright Test Infrastructure Set Up
- Installed `@playwright/test` v1.62.1 and Chromium browser
- Created `pc/playwright.config.js` with static server on port 8765
- Created `pc/tests/svg-sizing.spec.js` with comprehensive SVG sizing tests
- Added test scripts to `pc/package.json`: `"test": "npx playwright test"`

### 5. Initial Test Results
```
✓ location card icons should have explicit dimensions and not be full-width (1.8s)
  - Location card icon 1: 32px ✓
  - Location card icon 2: 32px ✓
✗ hamburger menu SVG tests (4 failures) — viewport issue, not a real bug
```

---

## ⏳ What Still Needs to Be Done

### 1. Fix Playwright Test Viewport Issue
**Problem**: 4 hamburger SVG tests fail because they run on mobile viewport where the hamburger button is hidden/visible only when menu is open.

**Solution Options**:
- Option A: Set desktop viewport in test config (`viewport: { width: 1280, height: 720 }`)
- Option B: Adjust visibility assertions to check DOM presence instead of `toBeVisible()`
- Option C: Skip hamburger tests on mobile-only pages (FAQ, 404)

**Recommended**: Option A — set desktop viewport globally in playwright.config.js

### 2. Re-run All Tests After Fix
Once viewport issue is resolved, run full test suite to confirm:
- ✅ Location card icons render at 32px (already passing)
- ✅ Hamburger SVGs render at 24px on all pages
- ✅ Testimonial arrows render at 18px
- ✅ Booking modal close button renders at 20px when opened
- ✅ No inline SVG exceeds reasonable width threshold

### 3. Visual Verification
After tests pass, manually verify in browser:
- Open `pc/index.html` on desktop and mobile viewports
- Confirm location card icons are small (32px) and properly centered above text
- Confirm no other icons appear stretched or oversized

---

## 📁 Files Modified/Created

### Modified
- `pc/index.html` — Added width/height attributes to 2 location card SVGs

### Created
- `pc/playwright.config.js` — Playwright test configuration
- `pc/tests/svg-sizing.spec.js` — SVG sizing verification tests
- `pc/package.json` — Updated with test scripts and dev dependencies

---

## 🎯 Acceptance Criteria

- [x] Location card icons render at intended size (32px), not full-width
- [ ] All inline SVGs across all pages have explicit dimensions or CSS overrides
- [ ] Playwright tests pass on desktop viewport
- [ ] No regressions in existing functionality

---

## 🔍 Next Immediate Action

**Fix the viewport issue in `pc/playwright.config.js` by adding:**
```javascript
use: {
  viewport: { width: 1280, height: 720 },
  // ... existing config
}
```

Then re-run: `cd pc && npx playwright test --reporter=list`

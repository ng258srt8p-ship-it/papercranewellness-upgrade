# Fix Broken Consultation Booking Button - Goal Loop Plan

## Problem
Clicking "Book a Free 15 Minute Consultation" opens the booking modal, but the iframe displays:
```
This page seems to be missing
We can't find the page you're looking for.
Error code: 404
```

**Root Cause:** The SimplePractice widget URL returns HTTP 404:
- `https://widget.clientsecure.me/widget/v2/booking?practiceId=945851` → **HTTP 404**
- Practice ID `945851` is invalid or widget not enabled in SimplePractice

## Goal Loop Phases

### Phase 1: Investigate Correct Widget URL (30 min)
**Objective:** Find the working SimplePractice booking widget URL for this practice.

**Steps:**
1. Check if different practice ID format works (e.g., `945851` vs other variations)
2. Test alternative URL patterns:
   - `https://widget.clientsecure.me/widget/v2/booking?practiceId=945851`
   - `https://www.simplepractice.com/practice/945851/book`
   - `https://clientsecure.me/practice/945851`
3. Check if practice has a custom domain (e.g., `papercranewellness.simplepractice.com`)
4. Verify SimplePractice account settings if accessible

**Verification:** HTTP 200 response from curl, no 404 error page content

### Phase 2: Update Booking Modal Implementation (15 min)
**Objective:** Fix the iframe source in booking-modal.js with correct URL.

**Steps:**
1. Read `/Users/georgetozer/papercranewellness-upgrade/pc/src/js/booking-modal.js`
2. Identify where `practiceId=945851` is hardcoded
3. Update to use the working URL found in Phase 1
4. If no working URL exists, implement fallback (e.g., link to SimplePractice directly)

**Verification:** File saves without syntax errors

### Phase 3: Test Locally (15 min)
**Objective:** Verify booking modal loads correctly with fix applied.

**Steps:**
1. Ensure local server running on port 8765
2. Navigate to `http://localhost:8765/index.html`
3. Click "Book a Free 15 Minute Consultation" button
4. Verify iframe loads without 404 error
5. Check browser console for errors

**Verification:** No "This page seems to be missing" message, booking form visible or appropriate login screen

### Phase 4: E2E Test (10 min)
**Objective:** Add/verify Playwright test for booking modal functionality.

**Steps:**
1. Create/update test in `/Users/georgetozer/papercranewellness-upgrade/pc/tests/`
2. Test clicks consultation button and verifies modal opens
3. Verify iframe loads (HTTP 200 or appropriate content)
4. Run `npx playwright test --reporter=list`

**Verification:** All tests pass, no new failures introduced

## Success Criteria
- [ ] Booking modal opens when clicking "Book a Free 15 Minute Consultation"
- [ ] Iframe loads without 404 error message
- [ ] SimplePractice booking form or login screen displays correctly
- [ ] No JavaScript errors in browser console
- [ ] Playwright tests pass (no regressions)

## Files to Modify
- `/Users/georgetozer/papercranewellness-upgrade/pc/src/js/booking-modal.js` - Update iframe source URL
- `/Users/georgetozer/papercranewellness-upgrade/pc/tests/*.spec.js` - Add/verify booking modal test (if needed)

## Notes
- The modal overlay itself works correctly (opens/closes properly)
- Issue is specifically the iframe content returning 404 from SimplePractice
- May need to contact SimplePractice support if practice ID is truly invalid
- Alternative: Use direct link to SimplePractice instead of embedded widget

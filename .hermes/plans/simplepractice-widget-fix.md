# SimplePractice Widget Fix - Goal Loop Plan

## Problem
SimplePractice booking widgets not working on contact.html:
1. Appointment request button links to wrong URL (missing `/request` path)
2. Contact form widget missing from HTML
3. Widgets may have initialization issues

## Current State
- ✅ Both buttons present in production HTML
- ✅ Correct `data-spwidget-*` attributes set
- ✅ Integration script loaded: `https://widget-cdn.simplepractice.com/assets/integration-1.0.js`
- ❌ User reports widgets not working (screenshot unavailable)

## Root Cause Analysis
Possible issues:
1. **Missing `/request` path** - Appointment button should link to `clientsecure.me/request` not `clientsecure.me`
2. **Widget initialization** - May need `data-spwidget-scope-global` on script tag or specific init order
3. **CORS/CDN blocking** - SimplePractice CDN may be blocked by Cloudflare security rules
4. **JavaScript errors** - Console errors preventing widget binding

## Fix Plan

### Phase 1: Verify Widget Attributes
- [ ] Confirm both buttons have correct `data-spwidget-type` values
- [ ] Verify `data-spwidget-scope-global` is set correctly
- [ ] Check if script tag needs additional attributes

### Phase 2: Test Widget Loading
- [ ] Open contact.html in browser with DevTools open
- [ ] Check Network tab for SimplePractice CDN requests (should see `integration-1.0.js`)
- [ ] Check Console tab for JavaScript errors
- [ ] Verify widget buttons are visible and clickable

### Phase 3: Fix Initialization Issues
If widgets not binding:
- Add explicit initialization script after integration loads
- Ensure DOM is fully loaded before SimplePractice binds
- Check if `data-spwidget-autobind` is working correctly

### Phase 4: Deploy & Verify
- [ ] Commit changes to git
- [ ] Push to GitHub
- [ ] Deploy to Cloudflare Pages (`papercrane-wellness-v2`)
- [ ] Test both buttons in production
- [ ] Verify appointment request opens booking widget
- [ ] Verify contact form opens contact widget

## Verification Criteria
1. Appointment button click → SimplePractice booking calendar opens
2. Contact button click → SimplePractice contact form opens
3. No JavaScript errors in console
4. Both widgets functional on mobile and desktop

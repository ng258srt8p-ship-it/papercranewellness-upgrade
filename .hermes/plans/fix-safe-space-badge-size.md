# Fix SAFE SPACE ALLIANCE Graphic Size — Goal-Loop Plan

> **For Hermes:** Use goal-loop methodology. Each loop has explicit exit gates with machine-verifiable commands.

> **Plan Owner:** George Tozer
> **Context:** The SAFE SPACE ALLIANCE badge on faq.html is rendering at 1136×1136px (natural: 2293×2293px). It should be ~150px wide, consistent with standard website badge sizing.

---

## Executive Summary

**Goal:** Constrain the SAFE SPACE ALLIANCE graphic to a reasonable footprint (~150px wide) on faq.html.

**Root Cause:** The `<img>` tag for the Safe Space Alliance badge has **no width/height attributes** and **no CSS sizing constraints**. The browser renders it at half its natural size (1136×1136px), which is far too large for a footer badge.

**Architecture:** Static HTML. The badge appears only on faq.html in the footer trust-badges section. Fix via inline `width` attribute or CSS class.

**Tech Stack:** Static HTML/CSS, Playwright.

---

## Gate Table (Machine-Verifiable)

| Gate | Gate | Verification Method | Pass Condition |
|------|------|---------------------|----------------|
| G1 | Badge has inline width constraint | `grep 'trust-badge__img' faq.html \| grep -oE 'width="[0-9]+"'` | Output: `width="150"` |
| G2 | Badge rendered width <= 200px | Playwright: measure bounding box width on faq.html | Width <= 200 |
| G3 | Badge rendered height <= 200px | Playwright: measure bounding box height on faq.html | Height <= 200 |
| G4 | Badge still visible on faq.html | `grep -c 'trust-badge__img' faq.html` | Output: `1` |
| G5 | No other pages affected | `grep -rn 'trust-badge__img' *.html blog/ \| wc -l` | Output: `1` (only faq.html) |
| G6 | Local audit still passes | `npx playwright test --config=playwright.audit.config.js tests/content-audit.spec.js --reporter=line` | Exit code 0, 12/12 pass |
| G7 | Cloudflare deploy succeeds | `wrangler pages deploy ./ --project-name=papercrane-wellness-v2` | Exit code 0 |
| G8 | Live badge width <= 200px | Playwright against live URL: measure `.trust-badge__img` bounding box | Width <= 200 |
| G9 | GitHub main updated | `git log --oneline -1 origin/main` | Contains badge-size fix commit |

---

## Loop 0 — Confirm Current State

**Objective:** Verify the badge is oversized on the live site.

**Tasks:**

### Task 0-1: Measure badge on live site

**Command:**
```bash
cd /Users/georgetozer/papercranewellness-upgrade/pc
node -e "
const {chromium}=require('@playwright/test');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage();
  await p.goto('https://papercrane-wellness-v2.pages.dev/faq',{waitUntil:'domcontentloaded'});
  const img=p.locator('.trust-badge__img');
  const box=await img.boundingBox();
  console.log('Width:',box?.width,'Height:',box?.height);
  await b.close();
})();
"
```

**Expected:** Width > 200, Height > 200 (confirming the bug).

**Exit Gate:** ✅ G2–G3 fail (oversized) — bug confirmed.

---

## Loop 1 — Apply Fix

**Objective:** Add inline width="150" to the badge img tag on faq.html.

**Tasks:**

### Task 1-1: Add width attribute to badge

**File:** `faq.html` (line ~377)

**Find:**
```html
<img src="https://images.squarespace-cdn.com/content/v1/661863445145a83fe829c4fb/7dc29a00-cc9c-4535-9d52-de7764fc1dd3/Safe-Space-Alliance-logo-website-badge-transparent-background.png" alt="Safe Space" class="trust-badge__img" />
```

**Replace with:**
```html
<img src="https://images.squarespace-cdn.com/content/v1/661863445145a83fe829c4fb/7dc29a00-cc9c-4535-9d52-de7764fc1dd3/Safe-Space-Alliance-logo-website-badge-transparent-background.png" alt="Safe Space" class="trust-badge__img" width="150" />
```

**Verification:**
```bash
grep 'trust-badge__img' faq.html | grep -oE 'width="[0-9]+"'
```

**Exit Gate:** ✅ G1 — width="150" present.

---

## Loop 2 — Local Verification

**Objective:** Confirm the fix renders correctly locally.

**Tasks:**

### Task 2-1: Measure badge locally with Playwright

**Command:**
```bash
cd /Users/georgetozer/papercranewellness-upgrade/pc
node -e "
const {chromium}=require('@playwright/test');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage();
  await p.goto('file:///Users/georgetozer/papercranewellness-upgrade/pc/faq.html',{waitUntil:'domcontentloaded'});
  const img=p.locator('.trust-badge__img');
  const box=await img.boundingBox();
  console.log('Width:',box?.width,'Height:',box?.height);
  if (box && box.width <= 200 && box.height <= 200) {
    console.log('PASS: Badge is properly sized');
    process.exit(0);
  } else {
    console.log('FAIL: Badge still too large');
    process.exit(1);
  }
})();
"
```

**Exit Gate:** ✅ G2–G3 — Width <= 200, Height <= 200.

---

## Loop 3 — Audit Gate

**Objective:** Ensure the fix doesn't break existing tests.

**Task 3-1: Run content audit**

**Command:**
```bash
npx playwright test --config=playwright.audit.config.js tests/content-audit.spec.js --reporter=line
```

**Exit Gate:** ✅ G6 — 12/12 pass, exit code 0.

---

## Loop 4 — Deploy

**Objective:** Push the fix to Cloudflare Pages.

**Tasks:**

### Task 4-1: Commit and force-push

**Command:**
```bash
git add faq.html
git commit -m "fix: constrain SAFE SPACE ALLIANCE badge to width=150px on faq.html"
git push --force-with-lease origin main
```

**Exit Gate:** ✅ GitHub updated.

### Task 4-2: Direct deploy to Cloudflare

**Command:**
```bash
wrangler pages deploy ./ --project-name=papercrane-wellness-v2
```

**Exit Gate:** ✅ G7 — Deploy succeeds.

---

## Loop 5 — Live Verification

**Objective:** Confirm the fix on the live production site.

**Tasks:**

### Task 5-1: Measure badge on live site

**Command:**
```bash
node -e "
const {chromium}=require('@playwright/test');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage();
  await p.goto('https://papercrane-wellness-v2.pages.dev/faq',{waitUntil:'domcontentloaded'});
  const img=p.locator('.trust-badge__img');
  const box=await img.boundingBox();
  console.log('Width:',box?.width,'Height:',box?.height);
  if (box && box.width <= 200 && box.height <= 200) {
    console.log('PASS: Live badge is properly sized');
    process.exit(0);
  } else {
    console.log('FAIL: Live badge still too large');
    process.exit(1);
  }
})();
"
```

**Exit Gate:** ✅ G8 — Live badge width <= 200px.

---

## Rollback (if needed)

If the fix causes issues:

1. **Revert the change:**
   ```bash
   git checkout HEAD~1 -- faq.html
   git commit -m "revert: badge size fix"
   git push origin main
   wrangler pages deploy ./ --project-name=papercrane-wellness-v2
   ```

---

## Success Criteria (All Must Pass)

- ✅ G1: Badge has inline width constraint
- ✅ G2–G3: Badge rendered size <= 200px locally
- ✅ G4: Badge still visible on faq.html
- ✅ G5: Only faq.html has the badge
- ✅ G6: Local audit passes
- ✅ G7: Cloudflare deploy succeeds
- ✅ G8: Live badge size <= 200px
- ✅ G9: GitHub main updated

**Plan complete. Ready to execute. Shall I proceed?**
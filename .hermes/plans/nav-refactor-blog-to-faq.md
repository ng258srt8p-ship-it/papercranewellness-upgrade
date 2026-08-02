# Nav Refactor: Remove Blog, Add FAQ — Goal-Loop Plan

> **For Hermes:** Use goal-loop methodology. Each loop has explicit exit gates with machine-verifiable commands. Proceed to next loop only when current loop exits 0.

> **Plan Owner:** George Tozer (NIM Radar / TripTide / Portly)
> **Context:** User correction: Blog page should **not** be on the website; FAQ page **should** be. Current live site has Blog in the primary nav (Home/About/Blog/Contact) and FAQ is a separate page reachable only via footer. Need to revert to the canonical 4-item nav: Home / About / FAQ / Contact.

---

## Executive Summary

**Goal:** Refactor the primary navigation to remove Blog and restore FAQ as the 4th canonical nav item. Blog page should remain as a served page (for SEO) but **not** appear in the primary nav or mobile menu. FAQ should appear in both desktop and mobile nav with `aria-current="page"` when active.

**Root Cause:** The redesign branch accidentally replaced FAQ with Blog in the primary nav. The original canonical contract (from prior session) was: Home / About / FAQ / Contact.

**Architecture:** Static HTML/CSS/JS. Nav blocks are duplicated in every page's `<header>` and `<nav class="navbar__mobile-menu">`. No shared partials (yet).

**Tech Stack:** Static site, Playwright E2E, Cloudflare Pages.

---

## Gate Table (Machine-Verifiable)

| Gate | Gate | Verification Method | Pass Condition |
|------|------|---------------------|----------------|
| G1 | Local source: desktop nav has 4 canonical links (Home/About/FAQ/Contact) on all 9 pages | `for f in *.html 404.html blog/index.html; do echo "--- $f ---"; grep -oE 'href="(index|about|faq|contact)\.html"' $f \| sort \| uniq -c; done` | Each page shows exactly: 1×index, 1×about, 1×faq, 1×contact (4 total) |
| G2 | Local source: Blog **not** in desktop nav on any page | `grep -rn 'href="blog' *.html 404.html \| grep -v 'blog/index.html' \| wc -l` | Output: `0` (Blog only appears as a page, never in nav hrefs) |
| G3 | Local source: mobile nav mirrors desktop (4 canonical links) on all 9 pages | `for f in *.html 404.html blog/index.html; do echo "--- $f ---"; sed -n '/navbar__mobile-links/,/\/nav>/p' $f \| grep -oE 'href="(index|about|faq|contact)\.html"' \| sort \| uniq -c; done` | Each page shows exactly 4 canonical links in mobile menu |
| G4 | Local source: `aria-current="page"` on correct link per page | `for f in index about faq contact; do echo "--- $f.html ---"; grep -c 'aria-current="page"' $f.html; done` | index.html=1 (Home), about.html=1 (About), faq.html=1 (FAQ), contact.html=1 (Contact), service pages=0, 404.html=0 |
| G5 | Local source: blog/index.html still exists and is reachable | `ls -la blog/index.html` | File exists |
| G6 | Local source: `blog` **not** in nav on blog/index.html itself | `grep -n 'href="blog' blog/index.html \| grep -v 'blog/index.html' \| wc -l` | Output: `0` |
| G7 | Local audit: 66/66 Playwright tests pass | `npx playwright test --config=playwright.audit.config.js tests/redesign-audit.spec.js tests/content-audit.spec.js --reporter=line` | Exit code 0, 66 passed |
| G8 | Cloudflare deploy succeeds | `wrangler pages deploy ./ --project-name=papercrane-wellness-v2` | Exit code 0, deployment URL printed |
| G9 | Live site: `/` returns 200 | `curl -sIo /dev/null -w "%{http_code}" https://papercrane-wellness-v2.pages.dev/` | Output: `200` |
| G10 | Live site: `/faq` returns 200 | `curl -sIo /dev/null -w "%{http_code}" https://papercrane-wellness-v2.pages.dev/faq` | Output: `200` |
| G11 | Live site: `/blog` returns 200 (page exists, just not in nav) | `curl -sIo /dev/null -w "%{http_code}" https://papercrane-wellness-v2.pages.dev/blog` | Output: `200` |
| G12 | Live site: desktop nav has 4 canonical links | `curl -sL https://papercrane-wellness-v2.pages.dev/ \| grep -oE 'href="(index|about|faq|contact)\.html"' \| sort \| uniq -c` | Output: 4 distinct canonical links, zero Blog |
| G13 | Live site: mobile nav mirrors desktop | `curl -sL https://papercrane-wellness-v2.pages.dev/faq \| sed -n '/navbar__mobile-links/,/\/nav>/p' \| grep -oE 'href="(index|about|faq|contact)\.html"' \| sort \| uniq -c` | Output: 4 canonical links |
| G14 | Live site: contract spec 54/54 pass | `PLAYWRIGHT_BASE_URL=https://papercrane-wellness-v2.pages.dev npx playwright test --config=playwright.live.config.js tests/redesign-audit.spec.js --reporter=line` | Exit code 0, 54 passed |
| G15 | Live site: content spec 12/12 pass | `PLAYWRIGHT_BASE_URL=https://papercrane-wellness-v2.pages.dev npx playwright test --config=playwright.live.config.js tests/content-audit.spec.js --reporter=line` | Exit code 0, 12 passed |
| G16 | GitHub: `main` updated with refactor | `git log --oneline -1 origin/main` | Contains the nav-refactor commit |

---

## Loop 0 — Update Nav Contract Definition

**Objective:** Define the canonical nav as Home / About / FAQ / Contact (removing Blog).

**Tasks:**

### Task 0-1: Update the canonical nav constant in the test spec

**File:** `tests/redesign-audit.spec.js`

**Change:** Replace `blog/index.html` with `faq.html` in the `CANON` array.

**Before:**
```javascript
const CANON = [
  { href: 'index.html',      text: 'Home'   },
  { href: 'about.html',      text: 'About'  },
  { href: 'blog/index.html', text: 'Blog'   },
  { href: 'contact.html',    text: 'Contact' },
];
```

**After:**
```javascript
const CANON = [
  { href: 'index.html',  text: 'Home'   },
  { href: 'about.html',  text: 'About'  },
  { href: 'faq.html',     text: 'FAQ'    },
  { href: 'contact.html', text: 'Contact' },
];
```

### Task 0-2: Update the PAGES array current values

**File:** `tests/redesign-audit.spec.js`

**Change:** Replace `blog/index.html` current page marker.

**Before:**
```javascript
{ file: 'blog/index.html', current: 'Blog' },
```

**After:**
```javascript
{ file: 'faq.html', current: 'FAQ' },
```

### Task 0-3: Update the normalize helper for blog page

**File:** `tests/redesign-audit.spec.js`

**Change:** The helper that handles `blog/index.html` path prefix should now handle `faq.html` (which is at repo root, so no special prefix).

**Before:**
```javascript
const needsParentPrefix = (p) => p.file === 'blog/index.html';
```

**After:**
```javascript
const needsParentPrefix = (p) => false; // All pages are at repo root
```

Also remove the `basename` logic since FAQ is at repo root.

**Before:**
```javascript
const basename = (href) => {
  const i = href.lastIndexOf('/');
  return i >= 0 ? href.slice(i + 1) : href;
};
const normalize = (href, prefix, current) => {
  if (current) {
    return basename(href);
  }
  if (prefix && href && !href.startsWith('../') && !href.startsWith('http')) {
    return `../${href}`;
  }
  return href;
};
```

**After:**
```javascript
// All pages at repo root — no prefix needed, no basename needed
const normalize = (href, prefix, current) => href;
```

**Verification:** Run the local audit spec (should fail until pages are updated).

**Command:**
```bash
npx playwright test --config=playwright.audit.config.js tests/redesign-audit.spec.js --reporter=line
```

**Expected:** Some failures (because source HTML still has Blog in nav).

**Exit Gate:** ✅ Spec updated; local run shows expected failures (source not yet refactored).

---

## Loop 1 — Refactor All Page Nav Blocks

**Objective:** Replace Blog with FAQ in desktop + mobile nav on every served page.

**Files to update:**
- `index.html` (aria-current on Home)
- `about.html` (aria-current on About)
- `contact.html` (aria-current on Contact)
- `faq.html` (aria-current on FAQ)
- `individual-therapy-for-adults.html` (no aria-current)
- `neurodivergent-affirming-therapy.html` (no aria-current)
- `trauma-ptsd-emdr-and-prolonged-exposure-therapy.html` (no aria-current)
- `404.html` (no aria-current)
- `blog/index.html` (no aria-current; Blog page itself should **not** have Blog in its nav)

**Tasks:**

### Task 1-1: Replace Blog with FAQ in desktop nav on all 9 pages

**For each file:** Replace the Blog list item with FAQ.

**Before (example from index.html):**
```html
<ul class="navbar__links">
  <li><a href="index.html" aria-current="page">Home</a></li>
  <li><a href="about.html">About</a></li>
  <li><a href="blog/index.html">Blog</a></li>
  <li><a href="contact.html">Contact</a></li>
</ul>
```

**After:**
```html
<ul class="navbar__links">
  <li><a href="index.html" aria-current="page">Home</a></li>
  <li><a href="about.html">About</a></li>
  <li><a href="faq.html">FAQ</a></li>
  <li><a href="contact.html">Contact</a></li>
</ul>
```

**Files:** All 9 pages listed above.

**Script:** Use `sed` or `execute_code` to batch-replace across all files.

### Task 1-2: Replace Blog with FAQ in mobile nav on all 9 pages

**Before:**
```html
<ul class="navbar__mobile-links">
  <li><a href="index.html">Home</a></li>
  <li><a href="about.html">About</a></li>
  <li><a href="blog/index.html">Blog</a></li>
  <li><a href="contact.html">Contact</a></li>
</ul>
```

**After:**
```html
<ul class="navbar__mobile-links">
  <li><a href="index.html">Home</a></li>
  <li><a href="about.html">About</a></li>
  <li><a href="faq.html">FAQ</a></li>
  <li><a href="contact.html">Contact</a></li>
</ul>
```

**Files:** All 9 pages.

### Task 1-3: Ensure aria-current placement is correct per page

- `index.html`: `aria-current="page"` on Home link
- `about.html`: `aria-current="page"` on About link
- `faq.html`: `aria-current="page"` on FAQ link
- `contact.html`: `aria-current="page"` on Contact link
- All others (service pages, 404, blog): **no** `aria-current="page"` on any nav link

**Verification:**
```bash
grep -c 'aria-current="page"' index.html about.html faq.html contact.html \
  individual-therapy-for-adults.html neurodivergent-affirming-therapy.html \
  trauma-ptsd-emdr-and-prolonged-exposure-therapy.html 404.html blog/index.html
```

**Expected:**
```
index.html: 2  (desktop + mobile Home)
about.html: 2  (desktop + mobile About)
faq.html: 2    (desktop + mobile FAQ)
contact.html: 2 (desktop + mobile Contact)
individual-therapy-for-adults.html: 0
neurodivergent-affirming-therapy.html: 0
trauma-ptsd-emdr-and-prolonged-exposure-therapy.html: 0
404.html: 0
blog/index.html: 0
```

**Exit Gate:** ✅ G1–G4 — All nav blocks updated, aria-current correct.

---

## Loop 2 — Keep Blog Page but Remove from Nav

**Objective:** Blog page should still exist as a served page (for SEO/historical links) but **not** appear in any nav.

**Tasks:**

### Task 2-1: Verify blog/index.html still exists

**Command:**
```bash
ls -la blog/index.html && echo "EXISTS" || echo "MISSING"
```

**Expected:** `EXISTS`

### Task 2-2: Ensure blog is **not** referenced in any nav

**Command:**
```bash
grep -rn 'href="blog' *.html 404.html | grep -v 'blog/index.html' | wc -l
```

**Expected:** `0` (Blog only appears as the page itself, never as a nav link)

**Exit Gate:** ✅ G5–G6 — Blog page exists but not in nav.

---

## Loop 3 — Local Audit Gate

**Objective:** All 66 Playwright tests pass against the refactored local source.

**Task 3-1: Run local audit**

**Command:**
```bash
npx playwright test --config=playwright.audit.config.js tests/redesign-audit.spec.js tests/content-audit.spec.js --reporter=line
```

**Exit Gate:** ✅ G7 — 66/66 pass, exit code 0.

---

## Loop 4 — Deploy to Cloudflare

**Objective:** Push the refactored source to Cloudflare Pages and verify it serves correctly.

**Tasks:**

### Task 4-1: Commit the refactor

**Command:**
```bash
git add -A
git commit -m "refactor: remove Blog from nav, restore FAQ as 4th canonical nav item

- Desktop nav: Home / About / FAQ / Contact on all 9 pages
- Mobile nav: mirrors desktop on all 9 pages
- aria-current: correct placement per page (Home/About/FAQ/Contact)
- Blog page remains served but is NOT in any nav
- Updated test spec (tests/redesign-audit.spec.js) to expect FAQ instead of Blog"
```

### Task 4-2: Force-push to main (or merge)

**Command:**
```bash
git push --force-with-lease origin main
```

### Task 4-3: Direct deploy via wrangler

**Command:**
```bash
wrangler pages deploy ./ --project-name=papercrane-wellness-v2
```

**Exit Gate:** ✅ G8 — Deploy succeeds, URL printed.

---

## Loop 5 — Verify Live Site

**Objective:** Confirm the live stable alias serves the refactored nav.

**Tasks:**

### Task 5-1: Probe core paths

**Command:**
```bash
for path in / /about /contact /faq /blog /404; do
  code=$(curl -sIo /dev/null -w "%{http_code}" "https://papercrane-wellness-v2.pages.dev$path")
  echo "GET $path -> $code"
done
```

**Exit Gate:** ✅ G9–G11 — All paths return 200.

### Task 5-2: Check live nav structure

**Command:**
```bash
curl -sL https://papercrane-wellness-v2.pages.dev/ | grep -oE 'href="(index|about|faq|contact)\.html"' | sort | uniq -c
```

**Exit Gate:** ✅ G12 — 4 canonical links, zero Blog.

### Task 5-3: Check live mobile nav

**Command:**
```bash
curl -sL https://papercrane-wellness-v2.pages.dev/faq | sed -n '/navbar__mobile-links/,/\/nav>/p' | grep -oE 'href="(index|about|faq|contact)\.html"' | sort | uniq -c
```

**Exit Gate:** ✅ G13 — 4 canonical links in mobile nav.

---

## Loop 6 — Live Contract Gate

**Objective:** Full 66-test suite passes against the live production URL.

**Tasks:**

### Task 6-1: Run contract spec against live URL

**Command:**
```bash
PLAYWRIGHT_BASE_URL=https://papercrane-wellness-v2.pages.dev \
  npx playwright test --config=playwright.live.config.js \
    tests/redesign-audit.spec.js --reporter=line
```

**Exit Gate:** ✅ G14 — 54/54 pass, exit code 0.

### Task 6-2: Run content spec against live URL

**Command:**
```bash
PLAYWRIGHT_BASE_URL=https://papercrane-wellness-v2.pages.dev \
  npx playwright test --config=playwright.live.config.js \
    tests/content-audit.spec.js --reporter=line
```

**Exit Gate:** ✅ G15 — 12/12 pass, exit code 0.

---

## Rollback (if needed)

If the live site breaks after deploy:

1. **Revert to prior commit:**
   ```bash
   git checkout 4cbafab  # last known good
   wrangler pages deploy ./ --project-name=papercrane-wellness-v2
   ```

2. **Or redeploy the old commit:**
   ```bash
   wrangler pages deployment create ./ --project-name=papercrane-wellness-v2 --branch=main --commit=4cbafab
   ```

---

## Success Criteria (All Must Pass)

- ✅ G1–G4: Local source nav refactored correctly
- ✅ G5–G6: Blog page exists but not in nav
- ✅ G7: 66/66 local tests pass
- ✅ G8: Cloudflare deploy succeeds
- ✅ G9–G13: Live site paths + nav structure correct
- ✅ G14–G15: 66/66 live tests pass
- ✅ G16: GitHub `main` updated

**Plan complete. Ready to execute. Shall I proceed?**
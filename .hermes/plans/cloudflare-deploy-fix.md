# Cloudflare Deploy Fix — Goal-Loop Plan

> **For Hermes:** Use goal-loop methodology. Each loop has explicit exit gates with machine-verifiable commands. Proceed to next loop only when current loop exits 0.

> **Plan Owner:** George Tozer (NIM Radar / TripTide / Portly)
> **Context:** Local redesign commit `b6600e4` passes 66/66 Playwright audit locally but Cloudflare Pages auto-deploy for that commit shows `Status: Failure` — live site still serves old content.

---

## Executive Summary

**Goal:** Deploy the redesigned Paper Crane Wellness site (`b6600e4`) to Cloudflare Pages so the live URL (`papercrane-wellness-v2.pages.dev`) serves the new source and passes the 66-test gate.

**Root Cause:** Cloudflare Pages auto-deploy from the `001-papercrane-wellness-redesign` branch **failed** (`dc546b79-fcd6-4b62-b13a-007ea6e8d0a7`). The build likely fails due to missing build configuration — Cloudflare Pages expects a static-site build step, but the repo has no build script.

**Architecture:** Static HTML/CSS/JS (no build step). Cloudflare Pages can serve raw HTML from repo root. The local `index.html`, `about.html`, etc. are ready to serve as-is.

**Tech Stack:** Cloudflare Pages (static site), Playwright (E2E), wrangler CLI.

---

## Gate Table (Machine-Verifiable)

| Gate | Gate | Verification Method | Pass Condition |
|------|------|---------------------|----------------|
| G1 | Cloudflare Pages project exists | `wrangler pages project list \| grep papercrane-wellness-v2` | Exit 0, project listed |
| G2 | Build logs show root cause | `wrangler pages deployment tail --project-name=papercrane-wellness-v2 --environment=preview` | Logs retrieved, root cause identified |
| G3 | Direct deploy succeeds (wrangler) | `wrangler pages deploy ./ --project-name=papercrane-wellness-v2` | Exit 0, deploy URL printed |
| G4 | Live `/` returns 200 | `curl -sIo /dev/null -w "%{http_code}" https://papercrane-wellness-v2.pages.dev/` | Output: `200` |
| G5 | Live `/blog` returns 200 | `curl -sIo /dev/null -w "%{http_code}" https://papercrane-wellness-v2.pages.dev/blog` | Output: `200` |
| G6 | Live `/faq` returns 200 | `curl -sIo /dev/null -w "%{http_code}" https://papercrane-wellness-v2.pages.dev/faq` | Output: `200` |
| G7 | Live `/404` returns 200 | `curl -sIo /dev/null -w "%{http_code}" https://papercrane-wellness-v2.pages.dev/404` | Output: `200` |
| G8 | Live nav has 4 items (Home/About/Blog/Contact) | `curl -sL https://papercrane-wellness-v2.pages.dev/ \| grep -oE 'href="(index|about|blog/index|contact)\.html"' \| sort \| uniq -c` | Output: 4 distinct links |
| G9 | No `#129` on live site | `curl -sL https://papercrane-wellness-v2.pages.dev/contact \| grep -c '#129'` | Output: `0` |
| G10 | Live site contract spec passes | `npx playwright test --config=playwright.audit.config.js tests/redesign-audit.spec.js --reporter=list` | Exit 0, 54/54 pass |
| G11 | Live site content spec passes | `npx playwright test --config=playwright.audit.config.js tests/content-audit.spec.js --reporter=list` | Exit 0, 12/12 pass |

---

## Loop 0 — Diagnose the Failed Auto-Deploy

**Objective:** Identify why commit `b6600e4` failed to build on Cloudflare Pages.

**Tasks:**

### Task 0-1: Pull deployment logs from Cloudflare

**Command:**
```bash
cd /Users/georgetozer/papercranewellness-upgrade/pc
wrangler pages deployment tail --project-name=papercrane-wellness-v2 --environment=preview --format=pretty 2>&1 | tee audit-evidence/cloudflare-preview-logs.txt
```

**Expected:** Log stream showing error (e.g., missing build command, file not found, permission denied).

**Exit Gate:** ✅ G2 — Build logs show root cause.

---

## Loop 1 — Fix Build Configuration

**Objective:** Ensure Cloudflare Pages can build/deploy the static site without errors.

**Tasks:**

### Task 1-1: Verify Cloudflare Pages project build settings

**Command:**
```bash
wrangler pages project get --project-name=papercrane-wellness-v2 2>&1 | tee audit-evidence/cloudflare-project-config.json
```

**Check:** The output should show `"build": { "command": null, "watch": null }` for a static site. If it expects a build command (`npm run build`), Cloudflare will fail when none exists.

### Task 1-2: Configure Cloudflare to treat this as a static site (no build step)

If the project expects a build command, update it to **no build**:

**Command:**
```bash
wrangler pages project update --project-name=papercrane-wellness-v2 \
  --build-command "" \
  --root-dir "." 2>&1 | tee audit-evidence/cloudflare-project-update.txt
```

**Expected:** Confirmation that project updated.

**Exit Gate:** ✅ Static-site config confirmed (no build command, root dir = `.`).

---

## Loop 2 — Direct Deploy via Wrangler

**Objective:** Bypass Git auto-deploy; push the redesigned source directly to Cloudflare Pages via `wrangler pages deploy`.

**Tasks:**

### Task 2-1: Run wrangler deploy

**Command:**
```bash
cd /Users/georgetozer/papercranewellness-upgrade/pc
wrangler pages deploy ./ --project-name=papercrane-wellness-v2 2>&1 | tee audit-evidence/wrangler-deploy.txt
```

**Expected:** Exit 0, output contains `Published: https://...` URL.

**Exit Gate:** ✅ G3 — Direct deploy succeeds.

---

## Loop 3 — Verify Live Site

**Objective:** Confirm the newly deployed site is live and serving the redesigned content.

**Tasks:**

### Task 3-1: Probe core paths

**Commands:**
```bash
for path in / /about /contact /faq /blog /404; do
  code=$(curl -sIo /dev/null -w "%{http_code}" "https://papercrane-wellness-v2.pages.dev$path")
  echo "GET $path -> $code"
done
```

**Exit Gate:** ✅ G4-G7 — All paths return 200.

### Task 3-2: Check nav structure on live homepage

**Command:**
```bash
curl -sL https://papercrane-wellness-v2.pages.dev/ | grep -oE 'href="(index|about|blog/index|contact)\.html"' | sort | uniq -c
```

**Exit Gate:** ✅ G8 — 4 distinct canonical nav links.

### Task 3-3: Confirm address fix propagated

**Command:**
```bash
curl -sL https://papercrane-wellness-v2.pages.dev/contact | grep -c '#129'
```

**Exit Gate:** ✅ G9 — Count is `0`.

---

## Loop 4 — Run Full Contract Gate Against Live URL

**Objective:** Ensure the live site satisfies the same 66-test gate that passed locally.

**Tasks:**

### Task 4-1: Update Playwright config to point at live URL

**File:** `playwright.audit.config.js`

**Patch:**
```javascript
// Change baseURL to live production alias
use: {
  baseURL: 'https://papercrane-wellness-v2.pages.dev',
  ...
}
```

### Task 4-2: Run redesign-audit.spec.js against live URL

**Command:**
```bash
npx playwright test --config=playwright.audit.config.js tests/redesign-audit.spec.js --reporter=list
```

**Exit Gate:** ✅ G10 — 54/54 pass, exit 0.

### Task 4-3: Run content-audit.spec.js against live URL

**Command:**
```bash
npx playwright test --config=playwright.audit.config.js tests/content-audit.spec.js --reporter=list
```

**Exit Gate:** ✅ G11 — 12/12 pass, exit 0.

---

## Loop 5 — Re-enable Git Auto-Deploy

**Objective:** After direct deploy succeeds, ensure future `git push` triggers auto-deploy correctly.

**Tasks:**

### Task 5-1: Verify Cloudflare Pages Git integration

**Command:**
```bash
wrangler pages project get --project-name=papercrane-wellness-v2 | grep -A2 git
```

**Expected:** Shows Git provider linked, branch = `001-papercrane-wellness-redesign`.

### Task 5-2: Push the redesign branch to GitHub (already done in prior step)

**Command:**
```bash
git push origin 001-papercrane-wellness-redesign
```

**Expected:** Already pushed (`abb0a95..b6600e4`).

### Task 5-3: Trigger a fresh auto-deploy by pushing an empty commit

**Command:**
```bash
git commit --allow-empty -m "trigger: rebuild Cloudflare Pages auto-deploy"
git push origin 001-papercrane-wellness-redesign
```

**Expected:** Cloudflare detects new commit, rebuilds.

### Task 5-4: Poll for successful deploy

**Command:**
```bash
wrangler pages deployment list --project-name=papercrane-wellness-v2 | grep -E "001-papercrane-wellness-redesign.*Success"
```

**Exit Gate:** ✅ Most recent deploy for `001-papercrane-wellness-redesign` shows `Status: Success`.

---

## Rollback (if needed)

If the live site breaks after deploy:

1. **Revert to prior commit on Cloudflare:**
   ```bash
   wrangler pages rollback --project-name=papercrane-wellness-v2 --message="revert to 64b5306e" 2>&1
   ```

2. **Or redeploy the old commit directly:**
   ```bash
   git checkout 64b5306e  # or whatever the last-known-good commit is
   wrangler pages deploy ./ --project-name=papercrane-wellness-v2
   git checkout 001-papercrane-wellness-redesign
   ```

---

## Success Criteria (All Must Pass)

- ✅ G1: Cloudflare project exists
- ✅ G2: Build logs retrieved
- ✅ G3: Direct deploy succeeds
- ✅ G4–G7: All 5 core paths return 200
- ✅ G8: Live nav has 4 canonical items
- ✅ G9: No `#129` regressions
- ✅ G10: 54/54 contract tests pass on live URL
- ✅ G11: 12/12 content tests pass on live URL

**Plan complete. Ready to execute. Shall I proceed?**
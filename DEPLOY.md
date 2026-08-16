# Paper Crane Wellness — Deployment Guide

This site is deployed to **Cloudflare Pages** as a single-file static SPA
(`dist/index.html` + `og-image.png`). Two deployment methods are supported:

1. **Automatic** — GitHub Actions triggers on push to `main`
2. **Manual** — using the `wrangler` CLI locally

## Prerequisites

- Node.js 22+ (Vite 7 requirement; 20.19+ also works)
- Wrangler CLI (via `npx wrangler`, or `npm install -g wrangler`)
- Cloudflare account with Pages access
- GitHub repository with a `CLOUDFLARE_API_TOKEN` secret (automatic deploys)

## Build

```bash
npm ci          # install exact lockfile dependencies
npm run build   # → dist/ (single self-contained index.html + og-image.png)
npx tsc --noEmit   # type check
```

The build inlines all JS, CSS, and images into one `dist/index.html`
(~1 MB, ~590 KB gzipped). `public/og-image.png` is copied alongside.

## Automatic deployment (GitHub Actions)

When a commit is pushed to `main`, `.github/workflows/deploy.yml`:

1. Checks out the code
2. Sets up Node 22 and runs `npm ci`
3. Builds the SPA (`npm run build` → `dist/`)
4. Deploys `dist/` to the `papercranewellness` Pages project on branch
   `main` using the `CLOUDFLARE_API_TOKEN` secret, attaching the commit
   hash and message

### Manual trigger

Go to **Actions** → **Deploy to Cloudflare Pages** → **Run workflow**.

## Manual deployment (local)

```bash
npm run build

npx wrangler pages deploy dist \
  --project-name papercranewellness \
  --branch main \
  --commit-hash $(git rev-parse --short HEAD) \
  --commit-message "$(git log -1 --pretty=%s)"
```

### Verify

```bash
# site serves the SPA shell
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" \
  https://papercranewellness.pages.dev/

# broad QA sweep (routes, errors, overflow, fonts, SEO head, assets)
node scripts/prod-qa.mjs

# live SimplePractice widget suite against production
BASE_URL=https://papercranewellness.pages.dev npm test
```

## Configuration

### wrangler.toml

```toml
name = "papercranewellness"
compatibility_date = "2024-01-01"

[pages]
production_branch = "main"

[build]
command = "npm ci && npm run build"
pages_build_output_dir = "dist"
```

The `[build]` section is used by Cloudflare Pages CI builds; the GitHub
Actions workflow runs the same steps itself and deploys the local `dist/`.

### GitHub secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages write access |

To generate a token:
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Profile** → **API Tokens** → create a token with **Cloudflare Pages**
   → **Edit** permission
3. Scope it to your account (`f94ced49d897e59303c8e1f292985182`)

## URLs

| Environment | URL |
|-------------|-----|
| Production (Pages) | https://papercranewellness.pages.dev |
| Custom domain | https://www.papercranewellness.com (pending DNS switchover from the legacy Squarespace/AWS site) |
| Preview deployments | https://\<deployment-id\>.papercranewellness.pages.dev |

Custom domain: add `www.papercranewellness.com` in the Pages project
(**Custom domains** tab); Cloudflare provisions the certificate automatically.
Routing is hash-based, so no rewrite rules are needed on any host.

## Troubleshooting

### Build fails on CI

1. Check the Actions run logs — the build step output shows the Vite error.
2. `npm ci` fails only if `package.json`/`package-lock.json` are out of sync;
   run `npm install` locally to refresh the lockfile and commit both.

### Deployment not triggering

1. Confirm the push reached `main` (the only branch with automatic deploys).
2. Check the Actions tab for a failed/skipped run.
3. Verify `CLOUDFLARE_API_TOKEN` still exists and has Pages write access.

### Old content still served

1. Cloudflare Pages serves immutable assets by deployment; hard-refresh
   (the single-file build name never changes, so verify with
   `curl -s https://papercranewellness.pages.dev/ | wc -c` and compare to
   the local `dist/index.html` size).
2. For the custom domain, confirm DNS switched over and your browser isn't
   caching the old origin (check response headers with `curl -sI`).

### SimplePractice modals don't open in QA

1. The suite and `prod-qa.mjs` require live network access to
   `simplepractice.com`; headless runs with blocked egress will fail.
2. Check the scope/app IDs in `index.html` still match the SP account
   (see the "To update scope/app IDs" note in `README.md`).
3. SP's own console noise (render-mode rehydrate warnings) is expected and
   filtered — only site-origin errors should fail the suite.

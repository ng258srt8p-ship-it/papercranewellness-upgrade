# Paper Crane Wellness — Deployment Guide

## Overview

This site is deployed to **Cloudflare Pages** as a static site. Two deployment methods are supported:

1. **Automatic** — GitHub Actions triggers on push to `main`
2. **Manual** — Using `wrangler` CLI locally

## Prerequisites

- Node.js 20+ installed
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account with Pages access
- GitHub repository with `CLOUDFLARE_API_TOKEN` secret configured

## Automatic Deployment (GitHub Actions)

When a commit is pushed to `main`, GitHub Actions automatically:

1. Checks out the code
2. Installs Wrangler CLI
3. Authenticates to Cloudflare using the `CLOUDFLARE_API_TOKEN` secret
4. Deploys the current directory to the `papercranewellness` project
5. Attaches the commit hash and message to the deployment

### Manual Trigger

You can manually trigger a deployment via the GitHub Actions tab:
1. Go to **Actions** → **Deploy to Cloudflare Pages**
2. Click **Run workflow** → **Run workflow**

## Manual Deployment (Local)

### Prerequisites

1. Authenticate to Cloudflare:
   ```bash
   wrangler login
   ```

### Deploy

```bash
wrangler pages deploy . \
  --project-name papercranewellness \
  --branch main \
  --commit-hash $(git rev-parse --short HEAD) \
  --commit-message "$(git log -1 --pretty=%s)"
```

### Verify

After deployment completes, verify the site is serving correctly:

```bash
curl -s https://papercranewellness.pages.dev/src/js/booking-modal.js | head -5
```

## Configuration

### wrangler.toml

```toml
name = "papercranewellness"
compatibility_date = "2024-01-01"

[pages]
production_branch = "main"

[build]
command = ""
pages_build_output_dir = "."
```

### GitHub Secrets

The following secret must be configured in the GitHub repository:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages write access |

To generate a token:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Profile** → **API Tokens**
3. Create a token with **Cloudflare Pages** → **Edit** permission
4. Scope it to your account (`f94ced49d897e59303c8e1f292985182`)

## URLs

| Environment | URL |
|-------------|-----|
| Production (Pages) | https://papercranewellness.pages.dev |
| Custom Domain | https://www.papercranewellness.com (needs DNS update) |
| Preview Deployments | https://<deployment-id>.papercranewellness.pages.dev |

## Troubleshooting

### Build Fails Silently

1. Check the Cloudflare Pages dashboard for build logs
2. Verify the `wrangler.toml` has `pages_build_output_dir = "."`
3. Ensure all static files are present in the repository root

### Deployment Not Triggering

1. Check that the GitHub Actions workflow is enabled
2. Verify the `CLOUDFLARE_API_TOKEN` secret is configured
3. Check the Actions tab for failed runs

### Old Content Still Served

1. Cloudflare Pages deployments are instant — no caching delay
2. Verify the deployment was successful in the Cloudflare dashboard
3. Check that the correct branch (`main`) is configured as the production branch

### Custom Domain Not Pointing to Cloudflare

1. The custom domain `www.papercranewellness.com` is still served by Squarespace
2. Update DNS settings to point to Cloudflare Pages
3. Follow Cloudflare's [custom domain setup guide](https://developers.cloudflare.com/pages/platform/custom-domains/)

## Rollback

To rollback to a previous deployment:

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Select the `papercranewellness` project
3. Go to **Deployments** tab
4. Find the desired deployment and click **Promote to Production**

Or use the CLI:
```bash
wrangler pages deployment promote <deployment-id> \
  --project-name papercranewellness \
  --environment production
```

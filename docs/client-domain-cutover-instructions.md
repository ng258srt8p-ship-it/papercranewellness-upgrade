# Getting Your Website Domain Ready for the Switch

**For:** Rebekah / Paper Crane Wellness
**From:** George (developer)
**Goal:** Move `papercranewellness.com` off Squarespace and onto the new, privacy-compliant Cloudflare site. Right now visitors still see the old Squarespace page, which still carries the advertising trackers we need gone.

The new site is already built and live at `papercranewellness.pages.dev`. To put it on your real address, your domain needs to point at the Cloudflare account that hosts it — below is exactly how, with only two things requiring your time.

---

## What I need from you — 3 items

### 1. Confirm the domain + your email for Cloudflare
- Confirm the address the new site should live at: **papercranewellness.com** (plus its `www.` version).
  *(If you also want a shorter address like papercrane.com, tell me now — that's a separate domain purchase, and the old address would redirect to the new one.)*
- Reply with the **email address you want to use for Cloudflare** (any normal inbox). I will create the domain setup in my Cloudflare account and invite you as a member, so you always have your own view of everything without needing a separate account.

### 2. Move the domain's nameservers to Cloudflare (~10 minutes)
This is the one step only you can do, because it happens at wherever you bought/renew the domain.

1. I will first create `papercranewellness.com` as a site in Cloudflare and send you **two nameservers** (like `abc.ns.cloudflare.com`) plus confirm your email records came across.
2. Log into the place that currently manages the domain — most likely **Squarespace**: **Settings → Domains → papercranewellness.com → DNS** (or "Connect/Transfer" → use "connect existing domain" / nameserver settings). If you registered it elsewhere (GoDaddy, Namecheap…), it's in that account's domain/DNS settings.
3. Replace the existing nameservers with the two Cloudflare ones I send. Save.
4. That's it — propagation takes 15 minutes to 24 hours; Cloudflare emails when the status shows **"Active"** (I'll see it in the dashboard too and confirm with you).

**About your email:** your `rebekah@papercranewellness.com` mail is separate from the website and should keep working throughout. Before the nameservers switch, I'll verify the zone copy includes your MX / SPF / DKIM / DMARC records, so you don't need to touch any of that — but if anything ever looks off with email afterward, tell me immediately.

### 3. Remove the tracking code from Squarespace — **today, not later**
This is the urgent legal-exposure item (the ad trackers that fire on every page visit). Two options:

- **Option A — you do it (5 min, no password sharing):** Squarespace → **Settings → Advanced → Integrations (Google, Facebook, and Pinterest)** → delete the **Facebook Pixel ID** and the **Google tag** (starts with `AW-`). Then check **Settings → Advanced → Code Injection** for anything mentioning `facebook`, `fbevents`, or `gtag` and remove those blocks.
- **Option B — I do it:** invite me as an administrator (Settings → Website → Permissions → invite my email) and I'll strip them and show you exactly what I removed.

Either way, after the switch is verified, **cancel / don't renew Squarespace.** I suggest keeping the Squarespace site alive-but-unused for 1–2 weeks after the cutover as a safety net, then deleting it.

---

## What I'll handle once the domain is Active (nothing needed from you)
1. Attach `papercranewellness.com` and `www` as custom domains on the Cloudflare Pages project.
2. Set up automatic redirects so every old URL (e.g. `/contact`, `/faq`, `http://`, `www.`) lands on the matching new page.
3. Verify the SSL certificate, security headers, and re-run the third-party tracker audit on the real domain — then send you the final "zero trackers until a visitor clicks Book" report for your records.
4. Confirm your email still sends and receives.

## Timeline
- Item 1: reply to this message — 2 minutes.
- Item 2: after I send you the nameservers, 10 minutes.
- Item 3: today if possible (it closes the risk on the currently-live site immediately).
- My part: same day the domain goes Active, DNS propagation permitting.

## Questions you might be wondering
- **Will my website go down during the switch?** There may be a brief window during nameserver propagation where some visitors see the old site and some see the new one; both work throughout. No downtime.
- **Will booking still work?** Yes — the Book/Contact buttons open your SimplePractice secure form, same as now, and it loads only after you click (that's the compliance fix).
- **Do I still need Squarespace?** No. After the switch it's just hosting the page we replaced.
- **Who owns what afterward?** You own the domain (renewals ~$13–20/yr wherever it lives now) and the Cloudflare access (free plan); I stay as your invited developer until you remove me.

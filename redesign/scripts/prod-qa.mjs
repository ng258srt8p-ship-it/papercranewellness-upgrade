#!/usr/bin/env node
/**
 * Production QA scan for the Paper Crane Wellness SPA.
 *
 * Usage:
 *   node scripts/prod-qa.mjs                        # https://papercranewellness.pages.dev
 *   BASE_URL=http://localhost:4173 node scripts/prod-qa.mjs
 *   node scripts/prod-qa.mjs http://localhost:4173
 *
 * Scans every SPA route at desktop (1440x900) and mobile (375x812) plus an
 * in-app 404 check, and reports findings in two classes:
 *
 *   ERROR (non-zero exit):
 *     - uncaught page errors
 *     - console errors from the site's own origin
 *     - horizontal overflow (scrollWidth > innerWidth)
 *     - Inter / Playfair Display fonts not loaded
 *     - broken <img> (incomplete or naturalWidth 0)
 *     - document.title mismatch vs the route's expected title
 *     - in-app 404 not rendering
 *
 *   GAP (reported, does not affect exit code):
 *     - missing favicon link / OG tags / canonical / JSON-LD / meta description
 *     - <img> without alt
 *     - icon-only buttons/links without an accessible name
 *
 * Third-party console noise (SimplePractice's cross-origin clientsecure.me
 * iframe) is always informational, never a failure.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.argv[2] || process.env.BASE_URL || "https://papercranewellness.pages.dev").replace(/\/+$/, "");
const OUT = path.resolve(import.meta.dirname, "..", "audit-evidence", "prod");
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["/", "home", "Paper Crane Wellness \u2014 Trauma Therapy in South Carolina"],
  ["/about", "about", "About Rebekah Tozer, LISW-CP \u2014 Paper Crane Wellness"],
  ["/specialties", "specialties", "Specialties \u2014 Paper Crane Wellness"],
  ["/trauma", "trauma", "Trauma, PTSD & EMDR Therapy \u2014 Paper Crane Wellness"],
  ["/neurodivergent", "neuro", "Neurodivergent Affirming Therapy \u2014 Paper Crane Wellness"],
  ["/individual", "individual", "Individual Therapy for Adults \u2014 Paper Crane Wellness"],
  ["/faq", "faq", "FAQ \u2014 Paper Crane Wellness"],
  ["/contact", "contact", "Contact & Booking \u2014 Paper Crane Wellness"],
];
const VPS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];

const errors = [];
const gaps = [];
const info = [];
const note = (list, route, vp, check, detail) => list.push({ route, vp, check, detail });
const fail = (r, v, c, d) => note(errors, r, v, c, d);
const gap = (r, v, c, d) => note(gaps, r, v, c, d);

const SP_NOISE = /clientsecure\.me|simplepractice\.com|widget-cdn\.simplepractice/i;

const browser = await chromium.launch();
let shotCount = 0;

try {
  for (const vp of VPS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });

    for (const [route, slug, expectedTitle] of ROUTES) {
      const page = await ctx.newPage();
      const pageErrors = [];
      const consoleMsgs = [];
      page.on("pageerror", (e) => pageErrors.push(String(e.message)));
      page.on("console", (m) => {
        if (m.type() === "error" || m.type() === "warning") {
          consoleMsgs.push({ type: m.type(), text: m.text(), url: m.location().url });
        }
      });

      await page.goto(`${BASE}${route === "/" ? "/#" : `#${route}`}`, { waitUntil: "load", timeout: 30_000 });
      await page.waitForSelector("main", { timeout: 15_000 });
      await page.evaluate(() => document.fonts.ready).catch(() => {});
      // Headless IntersectionObserver can skip the reveal end-state without
      // an active scroll frame; force the deterministic revealed state.
      await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
        document.head.appendChild(st);
        document.querySelectorAll(".reveal,.reveal-clip").forEach((el) => el.classList.add("is-visible"));
      });
      await page.waitForTimeout(600);

      const origin = new URL(page.url()).origin;
      const c = await page.evaluate(() => {
        const q = (s) => document.querySelector(s);
        const all = (s) => [...document.querySelectorAll(s)];
        const meta = (n) => q(`meta[name="${n}"]`)?.getAttribute("content") ?? null;
        const prop = (n) => q(`meta[property="${n}"]`)?.getAttribute("content") ?? null;
        const imgs = all("img");
        const named = (el) =>
          el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || (el.textContent || "").trim();
        return {
          title: document.title,
          description: meta("description"),
          og: {
            title: prop("og:title"),
            description: prop("og:description"),
            image: prop("og:image"),
            url: prop("og:url"),
          },
          canonical: q('link[rel="canonical"]')?.getAttribute("href") ?? null,
          jsonLd: all('script[type="application/ld+json"]').length,
          favicon: q('link[rel~="icon"]') ? true : false,
          htmlLang: document.documentElement.lang || null,
          imgs: {
            total: imgs.length,
            noAlt: imgs.filter((i) => !i.hasAttribute("alt")).map((i) => (i.getAttribute("src") || "").slice(0, 48)),
            broken: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => (i.getAttribute("src") || "").slice(0, 48)),
          },
          buttons: {
            total: all("button").length,
            unnamed: all("button").filter((b) => !named(b)).length,
          },
          links: {
            total: all("a").length,
            unnamed: all("a").filter((a) => !named(a) && !a.querySelector("img[alt]")).length,
          },
          overflowX: document.documentElement.scrollWidth - window.innerWidth,
          fonts: [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family))],
        };
      });

      // --- ERROR class
      if (pageErrors.length) fail(route, vp.name, "pageerror", pageErrors.join(" | ").slice(0, 300));
      const siteErrors = consoleMsgs.filter((m) => m.type === "error" && m.url.startsWith(origin));
      if (siteErrors.length) fail(route, vp.name, "console-error(site)", siteErrors.map((m) => m.text.slice(0, 160)).join(" | ").slice(0, 400));
      if (c.overflowX > 0) fail(route, vp.name, "horizontal-overflow", `+${c.overflowX}px`);
      for (const fam of ["Inter", "Playfair Display"]) {
        if (!c.fonts.includes(fam)) fail(route, vp.name, "font-not-loaded", fam);
      }
      if (c.imgs.broken.length) fail(route, vp.name, "broken-image", c.imgs.broken.join(", "));
      if (c.title !== expectedTitle) fail(route, vp.name, "title-mismatch", `got "${c.title}"`);

      // --- GAP class (head-level items reported once, on desktop /)
      const head = route === "/" && vp.name === "desktop";
      if (head) {
        if (!c.favicon) gap(route, vp.name, "no-favicon-link", "site-wide");
        if (!c.og.title || !c.og.description || !c.og.image)
          gap(route, vp.name, "missing-og-tags", `have: ${Object.entries(c.og).filter(([, v]) => v).map(([k]) => k).join(",") || "none"}`);
        if (!c.canonical) gap(route, vp.name, "no-canonical", "site-wide");
        if (!c.jsonLd) gap(route, vp.name, "no-jsonld", "site-wide (previous static site had LocalBusiness)");
        if (!c.description) gap(route, vp.name, "no-meta-description", "site-wide");
        if (!c.htmlLang) gap(route, vp.name, "no-html-lang", "site-wide");
      }
      if (c.imgs.noAlt.length) gap(route, vp.name, "img-missing-alt", c.imgs.noAlt.join(", "));
      if (c.buttons.unnamed) gap(route, vp.name, "button-no-accessible-name", `${c.buttons.unnamed}/${c.buttons.total}`);
      if (c.links.unnamed) gap(route, vp.name, "link-no-accessible-name", `${c.links.unnamed}/${c.links.total}`);

      // --- Informational
      const spNoise = consoleMsgs.filter((m) => SP_NOISE.test(m.url));
      if (spNoise.length)
        info.push(`${route} [${vp.name}]: ${spNoise.length} third-party (SP widget) console msg(s): ${spNoise.slice(0, 3).map((m) => `${m.type} ${m.text.slice(0, 60)}`).join(" | ")}`);
      const otherWarn = consoleMsgs.filter((m) => m.type === "warning" && !m.url.startsWith(origin) && !SP_NOISE.test(m.url));
      if (otherWarn.length) info.push(`${route} [${vp.name}]: ${otherWarn.length} third-party console warning(s): ${otherWarn.slice(0, 3).map((m) => m.text.slice(0, 60)).join(" | ")}`);

      const shot = path.join(OUT, `${slug}-${vp.name}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      shotCount++;
      await page.close();
    }

    // In-app 404 check (desktop only)
    if (vp.name === "desktop") {
      const p = await ctx.newPage();
      await p.goto(`${BASE}#/definitely-not-a-page`, { waitUntil: "load", timeout: 30_000 });
      await p.waitForTimeout(700);
      const mainText = (await p.locator("main").textContent().catch(() => "")) || "";
      if (!/Page not found|Error 404/i.test(mainText)) fail("404", vp.name, "in-app-404", "expected 'Page not found' / 'Error 404' text in <main>");
      const t4 = await p.title();
      if (!t4.startsWith("Paper Crane Wellness")) fail("404", vp.name, "404-title", `got "${t4}"`);
      await p.close();
    }

    await ctx.close();
  }
} finally {
  await browser.close();
}

// --- Report
console.log(`\nProd QA scan: ${BASE}  (8 routes x 2 viewports + 404 check)\n`);
console.log(`ERRORS (${errors.length}):`);
if (!errors.length) console.log("  (none)");
for (const e of errors) console.log(`  [${e.route}] [${e.vp}] ${e.check}: ${e.detail}`);
console.log(`\nGAPS (${gaps.length}):`);
if (!gaps.length) console.log("  (none)");
for (const g of gaps) console.log(`  [${g.route}] [${g.vp}] ${g.check}: ${g.detail}`);
console.log(`\nINFO (${info.length}):`);
for (const i of info) console.log(`  ${i}`);
console.log(`\nScreenshots: ${shotCount} -> ${OUT}`);
console.log(`\nRESULT: ${errors.length ? "FAIL" : "PASS (no errors)"} — ${errors.length} error(s), ${gaps.length} gap(s)`);
process.exit(errors.length ? 1 : 0);

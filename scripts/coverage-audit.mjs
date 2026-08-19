#!/usr/bin/env node
/**
 * Round 2 coverage audit — Paper Crane Wellness.
 * Screenshots every route at 3 viewports, walks the full link graph,
 * checks 404 behavior, focus visibility, reduced-motion, and tap targets.
 * Evidence -> audit-evidence/uiux/coverage/ ; data -> coverage-report.json
 *
 * Usage: node scripts/coverage-audit.mjs [base_url]
 */
import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.argv[2] || "http://localhost:4173";
const OUT = path.join(ROOT, "audit-evidence/uiux/coverage");
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = ["/", "/about", "/specialties", "/trauma", "/neurodivergent", "/individual", "/faq", "/contact", "/admin"];
const VIEWS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const findings = [];
const add = (severity, check, route, detail) =>
  findings.push({ severity, check, route, detail });

const browser = await chromium.launch();
const normRoute = (r) => (r && r.startsWith("/") ? r : "/" + (r || ""));

const relToHash = (href) => {
  if (!href) return null;
  if (/^(https?:)?\/\//.test(href)) {
    if (href.includes("papercranewellness") || href.includes("paper-crane")) {
      if (href.includes("#")) return { kind: "same-site", href: href.slice(href.indexOf("#") + 1) };
      return { kind: "external-booking", url: href }; // SP booking-domain anchor (modal fallback target)
    }
    return { kind: "external", url: href };
  }
  if (href.startsWith("#/")) return { kind: "same-site", href: href.slice(1) };
  if (href.startsWith("#")) return { kind: "in-page", href: href.slice(1) };
  if (href.startsWith("mailto:")) return { kind: "mailto", url: href };
  if (href.startsWith("tel:")) return { kind: "tel", url: href };
  try {
    const u = new URL(href, BASE + "/");
    if (u.origin === new URL(BASE).origin) return { kind: "same-site", href: u.pathname + (u.hash ? u.hash.slice(1) : "") };
    return { kind: "external", url: href };
  } catch {
    return { kind: "external", url: href };
  }
};

async function settle(p) {
  await p.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const t = setInterval(() => {
        y += window.innerHeight / 2;
        window.scrollTo(0, y);
        if (y >= document.body.scrollHeight) { clearInterval(t); res(); }
      }, 60);
    });
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(700);
}

// ---------- link graph walk (desktop) ----------
const seen = new Set();
const queue = ["/"];
const visited = new Set();
const missing = new Set();

while (queue.length) {
  const r = normRoute(queue.shift());
  if (seen.has(r)) continue;
  seen.add(r);
  const known = ROUTES.includes(r);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const ok = await page.goto(BASE + "/" + r.replace(/^\//, ""), { waitUntil: "networkidle", timeout: 30000 }).then(() => true).catch(() => false);
  if (!ok) {
    add("blocker", "navigation", r, "page failed to load");
    await context.close();
    continue;
  }
  await page.waitForTimeout(1200);

  if (!known) {
    missing.add(r);
    const t = (await page.title()) || "";
    const bodyText = (await page.textContent("body").catch(() => "")) || "";
    if (!/404|not found|page.{0,20}missing|lost/i.test(t + " " + bodyText.slice(0, 500))) {
      add("major", "404", r, `unknown route renders no 404 state (title: ${t})`);
    } else {
      add("ok", "404", r, `unknown route renders 404 state (title: ${t})`);
    }
    await context.close();
    continue;
  }

  visited.add(r);

  // title + meta
  const title = await page.title();
  if (!title || title.trim().length < 8) add("minor", "title", r, `short/empty title: "${title}"`);
  const desc = await page.locator('meta[name="description"]').getAttribute("content").catch(() => null);
  if (!desc || desc.length < 40) add("minor", "meta-description", r, desc ? `short (${desc.length} chars)` : "missing");

  // links walk
  const anchors = page.locator("a[href]");
  const n = await anchors.count();
  const texts = [];
  const dead = [];
  for (let i = 0; i < n; i++) {
    const href = await anchors.nth(i).getAttribute("href");
    const info = relToHash(href);
    if (!info) continue;
    const label = ((await anchors.nth(i).innerText().catch(() => "")) || href).replace(/\s+/g, " ").trim().slice(0, 60);
    if (label) texts.push(label);
    if (info.kind === "same-site" && info.href) {
      const hr = normRoute(info.href);
      if (!visited.has(hr) && !seen.has(hr)) queue.push(hr);
    } else if (info.kind === "same-site" && info.href === null) {
      dead.push(`"${label}" -> ${href}`);
    }
  }
  if (dead.length) add("minor", "dead-link", r, dead.slice(0, 5).join("; "));
  const dupUnique = [...new Set(texts)].filter((t) => texts.filter((x) => x === t).length > 2);
  if (dupUnique.length) add("info", "duplicate-link-text", r, dupUnique.slice(0, 6).join("; "));

  // headings
  const heads = await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => h.tagName));
  const h1count = heads.filter((t) => t === "H1").length;
  if (h1count === 0) add("major", "headings", r, "no <h1>");
  if (h1count > 1) add("minor", "headings", r, `${h1count} <h1> elements`);
  let prev = 0;
  for (const h of heads) {
    const lvl = +h.slice(1);
    if (prev && lvl > prev + 1) { add("minor", "heading-jumps", r, `level jump ${prev} -> ${lvl} (order: ${heads.join(",")})`); break; }
    prev = lvl;
  }

  // aria on icon-only controls
  const iconOnly = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("button,a:not([href])")) {
      const t = (el.innerText || el.textContent || "").trim();
      if (t.length === 0 && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby"))
        out.push((el.className || el.id || "unnamed").toString().slice(0, 40));
    }
    return out;
  });
  if (iconOnly.length) add("major", "aria", r, `icon-only controls without aria-label: ${iconOnly.join(" | ")}`);

  // image alt
  const badImg = await page.evaluate(() => {
    const out = [];
    for (const img of document.querySelectorAll("img"))
      if (!img.getAttribute("alt") && !img.getAttribute("role")) out.push((img.src || "").split("/").pop().slice(0, 40));
    return out;
  });
  if (badImg.length) add("minor", "img-alt", r, `imgs without alt: ${badImg.join(", ")}`);

  // duplicate ids
  const dupIds = await page.evaluate(() => {
    const counts = {};
    for (const el of document.querySelectorAll("[id]")) counts[el.id] = (counts[el.id] || 0) + 1;
    return Object.entries(counts).filter(([, c]) => c > 1).map(([id, c]) => `${id}×${c}`).slice(0, 8);
  });
  if (dupIds.length) add("minor", "duplicate-ids", r, dupIds.join(", "));

  // skip-links (a11y 2.4.1)
  const skip = await page.evaluate(() => {
    const a = document.querySelector("a[href^='#']");
    if (!a) return null;
    const first = a.getBoundingClientRect();
    return a.textContent.trim().slice(0, 40);
  });
  if (!skip) add("info", "skip-link", r, "no skip-to-content link");

  // tab order of first 6 focusables
  const order = await page.evaluate(() => {
    const els = [...document.querySelectorAll("a[href],button,input,select,textarea,summary,[tabindex]")].filter((e) => {
      if (e.tabIndex < 0) return false;
      const b = e.getBoundingClientRect();
      return b.width > 0 || e.type === "hidden" === false;
    });
    return els.slice(0, 8).map((e) => `${e.tagName.toLowerCase()} "${((e.innerText || e.getAttribute("aria-label") || "").trim() || e.type || "?").slice(0, 28)}"`);
  });
  // focus visibility: Tab once, check outline/box-shadow
  await page.keyboard.press("Tab");
  const vis = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { none: true };
    const cs = getComputedStyle(el);
    return {
      el: el.tagName.toLowerCase() + " " + ((el.innerText || el.getAttribute("aria-label") || "").trim() || "?").slice(0, 28),
      outline: cs.outlineStyle, outlineW: parseFloat(cs.outlineWidth),
      boxShadow: cs.boxShadow !== "none",
    };
  });
  if (vis.none) add("major", "focus-visibility", r, "Tab focuses nothing (no focusable elements?)");
  else if (!vis.boxShadow && (vis.outline === "none" || vis.outlineW < 1))
    add("major", "focus-visibility", r, `first Tab focus not visible on: ${vis.el}`);
  else add("ok", "focus-visibility", r, `first Tab visible on: ${vis.el}`);

  await context.close();

  // mobile pass: screenshots + tap targets + hamburger
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const mp = await mctx.newPage();
  await mp.goto(BASE + "/" + r.replace(/^\//, ""), { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await mp.waitForTimeout(900);
  await settle(mp);
  const safe = r.replace(/\//g, "_") || "_home";
  await mp.screenshot({ path: path.join(OUT, `shot-${safe}-mobile.png`), fullPage: true }).catch(() => {});
  const taps = await mp.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("a,button,[role='button'],input,select,textarea,summary")) {
      const box = el.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) continue;
      if (Math.floor(box.height) < 44) {
        const label = ((el.innerText || el.getAttribute("aria-label") || el.placeholder || el.type || el.tagName).trim() || "?").replace(/\s+/g, " ").slice(0, 40);
        out.push(`${label} h=${box.height.toFixed(1)}`);
      }
    }
    return out;
  });
  if (taps.length) add("minor", "tap-targets", r, `${taps.length} <44px: ${taps.slice(0, 10).join("; ")}${taps.length > 10 ? " …" : ""}`);
  const burger = mp.locator("button[aria-label*='menu' i], button[aria-label*='Menu'], [class*='burger'], [class*='hamburger']");
  const bc = await burger.count().catch(() => 0);
  if (bc) {
    await burger.first().click().catch(() => {});
    await mp.waitForTimeout(700);
    const state = await mp.evaluate(() => {
      const btn = [...document.querySelectorAll("button[aria-expanded]")];
      const openBtn = btn.find((b) => b.getAttribute("aria-expanded") === "true");
      const drawer = openBtn ? (openBtn.closest("header") || document) : null;
      const links = drawer ? [...drawer.querySelectorAll("a")].map((a) => (a.innerText || "").trim()).filter(Boolean) : [];
      return { expanded: openBtn ? true : false, labels: links };
    });
    if (!state.expanded) add("major", "mobile-nav", r, `burger did not set aria-expanded=true`);
    else if (state.labels.length < 3) add("major", "mobile-nav", r, `menu open but only ${state.labels.length} nav links visible`);
    else add("ok", "mobile-nav", r, `menu opens (${state.labels.length} links: ${state.labels.join(", ")})`);
  }
  await mctx.close();

  // tablet + desktop full-page shots
  for (const v of VIEWS.filter((x) => x.name !== "mobile")) {
    const c2 = await browser.newContext({ viewport: { width: v.width, height: v.height } });
    const p2 = await c2.newPage();
    await p2.goto(BASE + "/" + r.replace(/^\//, ""), { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    await p2.waitForTimeout(900);
    await settle(p2);
    await p2.screenshot({ path: path.join(OUT, `shot-${safe}-${v.name}.png`), fullPage: true }).catch(() => {});
    await c2.close();
  }
}

// 404 check for a deliberately bogus route
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(BASE + "/this-route-does-not-exist", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const t = (await p.title()) || "";
  const txt = (await p.textContent("body").catch(() => "")) || "";
  if (/404|not found|page.{0,20}missing|lost/i.test(t + " " + txt.slice(0, 500))) add("ok", "404", "/this-route-does-not-exist", `renders 404 state (title: ${t})`);
  else add("major", "404", "/this-route-does-not-exist", `no 404 state (title: ${t})`);
  await c.close();
}

// reduced-motion on home
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  const anim = await p.evaluate(() => {
    let count = 0; const sample = [];
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if (cs.animationName !== "none" && parseFloat(cs.animationDuration) > 0.01) {
        count++;
        if (sample.length < 5) sample.push(`${(el.className || "?").toString().slice(0, 30)}:${cs.animationName}`);
      }
    }
    return { count, sample };
  });
  if (anim.count > 0) add("minor", "reduced-motion", "/", `${anim.count} elements still animating: ${anim.sample.join("; ")}`);
  else add("ok", "reduced-motion", "/", "no animations under prefers-reduced-motion");
  await c.close();
}

await browser.close();

fs.writeFileSync(path.join(OUT, "coverage-report.json"), JSON.stringify({ base: BASE, visited: [...visited], unknown: [...missing], findings }, null, 2));
console.log(`\nCoverage audit — ${BASE}`);
console.log(`routes visited: ${[...visited].join(", ")}`);
if (missing.size) console.log(`unknown routes (404-checked): ${[...missing].join(", ")}`);
for (const s of ["blocker", "major", "minor", "info", "ok"]) {
  const items = findings.filter((f) => f.severity === s);
  if (!items.length) { console.log(`${s}: 0`); continue; }
  console.log(`\n[${s.toUpperCase()}] ${items.length}`);
  for (const f of items) console.log(`  ${f.check} @ ${f.route}: ${f.detail}`);
}
console.log(`\nTotals: blocker=${findings.filter(f=>f.severity==='blocker').length} major=${findings.filter(f=>f.severity==='major').length} minor=${findings.filter(f=>f.severity==='minor').length}`);

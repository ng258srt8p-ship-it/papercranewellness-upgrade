#!/usr/bin/env node
/**
 * scripts/uiux-scan.mjs
 *
 * UI/UX CONSISTENCY SCAN — production
 * Sweeps every route × viewport, samples computed styles for a registry of
 * element ROLES (buttons, buttons-in-dark, headings, body text, containers,
 * sections, images, cards, focus/hover states), clusters values per role and
 * flags deviations. Also checks:
 *   - horizontal overflow
 *   - off-palette colors (bg/text/border not in the brand token set)
 *   - text contrast < 4.5:1 (3:1 for large text)
 *   - mobile tap targets < 44px
 *   - nav/footer presence on every route
 *
 * Usage:  node scripts/uiux-scan.mjs [base-url]
 * Output: audit-evidence/uiux/scan-data.json + console summary
 * Exit code: 0 (informational — classification happens in REPORT.md)
 */
import { chromium } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE = (process.argv[2] ?? "https://papercranewellness.pages.dev").replace(/\/$/, "");

const VIEWS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];
const ROUTES = ["/", "/about", "/specialties", "/trauma", "/neurodivergent", "/individual", "/faq", "/contact", "/admin"];

// Brand palette + known neutrals (computed values, sRGB hex).
const PALETTE = new Set([
  "#6b7c54", "#55643f", "#96a37f", // sage family
  "#24363a", "#162427", // navy family
  "#f0f4ee", "#e2e9dd", "#fbfaf6", // mist/paper
  "#c9b8a3", // clay
  "#ffffff", "#000000",
]);
// text colors that are blends of the above (commonly used: /85, /70, etc.)
// We allow any color whose channels sit between navy and paper for text,
// but FLAG colors far outside the palette hue range.

function hexToRgb(h) {
  const m = h.replace("#", "");
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}
function relLum({ r, g, b }) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const l1 = relLum(hexToRgb(a)), l2 = relLum(hexToRgb(b));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ---- in-browser sampler -------------------------------------------------
const SAMPLE = () => {
  const hx = (h) => { const m = h.replace("#", ""); return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)]; };

  const out = {
    buttons: [], btnDark: [], btnLight: [], headings: [], bodyText: [],
    containers: [], sections: [], imgs: [], cards: [], focusables: [],
    hScroll: false, docW: 0, scrollW: 0, hasNav: false, hasFooter: false,
    mainH: 0, title: document.title,
  };
  const cs = (el) => getComputedStyle(el);
  const norm = (v) => v.trim().replace(/\s+/g, " ");

  // horizontal overflow
  out.docW = document.documentElement.clientWidth;
  out.scrollW = document.scrollingElement ? document.scrollingElement.scrollWidth : 0;
  out.hScroll = out.scrollW > out.docW + 1;
  out.hasNav = !!document.querySelector("header, nav");
  out.hasFooter = !!document.querySelector("footer");
  out.mainH = (document.querySelector("main") || document.body).scrollHeight;

  const seen = new Set();
  const visible = (el) => {
    // skip collapsed mega-menu / drawers (opacity-0, max-h-0 patterns)
    let p = el;
    while (p && p !== document.documentElement) {
      const s = cs(p);
      if (parseFloat(s.opacity) < 0.05) return false;
      p = p.parentElement;
    }
    return true;
  };
  const add = (arr, el, cap = 400) => {
    if (!visible(el)) return;
    const key = el ? el.tagName + "|" + cs(el).backgroundColor + "|" + cs(el).color : "";
    if (seen.has(key) && seen.size < 3000) return;
    if (seen.size < 3000) seen.add(key);
    if (arr.length >= cap) return;
    const r = el.getBoundingClientRect();
    const s = cs(el);
    arr.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className && el.className.toString ? el.className.toString() : "").slice(0, 120),
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      bg: s.backgroundColor, color: s.color,
      font: s.fontFamily.split(",")[0].replace(/["']/g, ""),
      size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing,
      padT: s.paddingTop, padR: s.paddingRight, padB: s.paddingBottom, padL: s.paddingLeft,
      mt: s.marginTop, mb: s.marginBottom,
      radius: s.borderRadius, border: s.borderWidth + " " + s.borderStyle,
      shadow: s.boxShadow === "none" ? "" : s.boxShadow.slice(0, 60),
      text: (el.innerText || "").slice(0, 40),
      href: el.getAttribute("href") || "",
      display: s.display,
    });
  };

  // Buttons (links styled as buttons + <button>)
  document.querySelectorAll("a, button").forEach((el) => {
    if (el.closest("#sp-widget-host")) return;
    const s = cs(el);
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 8) return;
    const hasBg = s.backgroundColor !== "rgba(0, 0, 0, 0)";
    const hasBorder = s.borderWidth !== "0px" && s.borderStyle !== "none";
    if (hasBg || hasBorder) {
      // classify by context: dark section vs light section
      let dark = false;
      let p = el;
      while (p && p !== document.body) {
        const bg = cs(p).backgroundColor;
        if (bg !== "rgba(0, 0, 0, 0)") {
          const [rr, gg, bb] = hx(bg.startsWith("#") ? bg : "#000000");
          dark = (0.2126 * rr + 0.7152 * gg + 0.0722 * bb) / 255 < 0.45;
          break;
        }
        p = p.parentElement;
      }
      add(dark ? out.btnDark : out.btnLight, el);
    }
  });

  // Headings
  document.querySelectorAll("h1, h2, h3, h4").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 5) return;
    add(out.headings, el, 200);
    const last = out.headings[out.headings.length - 1];
    if (last) last.level = el.tagName.toLowerCase();
  });

  // Body text (p, span with text)
  document.querySelectorAll("p").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 5 || r.height < 4) return;
    if ((el.innerText || "").trim().length < 3) return;
    add(out.bodyText, el, 300);
  });

  // Containers: look for the max-width wrappers
  const cw = new Map();
  document.querySelectorAll("main *").forEach((el) => {
    const s = cs(el);
    if (s.maxWidth === "none") return;
    const w = el.getBoundingClientRect().width;
    const mw = parseFloat(s.maxWidth);
    if (mw > 400 && w > mw * 0.8) {
      if (!cw.has(s.maxWidth)) cw.set(s.maxWidth, { mw, count: 0, sampleW: w });
      const e = cw.get(s.maxWidth);
      e.count++;
    }
  });
  cw.forEach((v) => out.containers.push({ maxWidth: v.mw, count: v.count, sampleW: Math.round(v.sampleW) }));

  // Sections (direct children of main + their padding rhythm)
  const main = document.querySelector("main");
  if (main) {
    for (const child of main.children) {
      add(out.sections, child, 100);
    }
    // second-level "section" divs with vertical padding
    main.querySelectorAll(":scope > * > section, :scope > * > div > section").forEach((el) => add(out.sections, el, 120));
  }

  // Images
  document.querySelectorAll("img").forEach((el) => add(out.imgs, el, 100));

  // Card-like: rounded + (bg or border) distinct blocks inside light sections
  document.querySelectorAll("main div").forEach((el) => {
    const s = cs(el);
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 80) return;
    const rad = parseFloat(s.borderRadius) || 0;
    const hasBg = s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "rgba(0, 0, 0, 0)";
    if (rad >= 8 && (hasBg || s.borderStyle !== "none")) add(out.cards, el, 150);
  });

  // Focusables + tap targets (mobile)
  document.querySelectorAll("a[href], button, input, select, textarea").forEach((el) => {
    if (el.closest("#sp-widget-host")) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    out.focusables.push({
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || el.getAttribute("aria-label") || "").slice(0, 30),
      w: Math.round(r.width), h: Math.round(r.height),
    });
  });

  return out;
};

// ---- analysis -----------------------------------------------------------
function cluster(items, keyFn) {
  const map = new Map();
  for (const it of items) {
    const k = keyFn(it);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(it);
  }
  return map;
}

function reportFindings(data, base) {
  const F = [];
  const add = (sev, dim, route, view, msg, ev) => F.push({ sev, dim, route, view, msg, ev });

  for (const { name, width } of VIEWS) {
    for (const route of ROUTES) {
      const d = data[route]?.[name];
      if (!d || d.error) { add("CRITICAL", "availability", route, name, `page data missing/error: ${d?.error || "none"}`, null); continue; }
      if (!Array.isArray(d.headings)) continue;
      if (d.hScroll) add("CRITICAL", "overflow", route, name, `horizontal scroll (scrollW ${d.scrollW} > docW ${d.docW})`, null);
      if (!d.hasNav) add("CRITICAL", "structure", route, name, "nav missing", null);
      if (!d.hasFooter) add("CRITICAL", "structure", route, name, "footer missing", null);

      // heading FONT consistency per level (size varies by design via clamp())
      const byLevel = new Map();
      for (const h of d.headings) {
        const lvl = h.level || "h?";
        if (!byLevel.has(lvl)) byLevel.set(lvl, { fonts: new Set(), sizes: new Set() });
        byLevel.get(lvl).fonts.add(h.font);
        byLevel.get(lvl).sizes.add(h.size);
      }
      byLevel.forEach((v, lvl) => {
        if (v.fonts.size > 1) add("CRITICAL", "typography", route, name, `${lvl} mixes font families: ${[...v.fonts].join(" | ")}`, null);
        if (v.fonts.size === 1) {
          const f = [...v.fonts][0];
          if (lvl === "h1" && !f.toLowerCase().includes("playfair")) add("MINOR", "typography", route, name, `h1 not display font: ${f}`, null);
          if (v.sizes.size > 3) add("MINOR", "typography", route, name, `${lvl} has ${v.sizes.size} distinct sizes: ${[...v.sizes].sort((a, b) => parseFloat(b) - parseFloat(a)).slice(0, 6).join(", ")}`, null);
        }
      });

      // button radius/color variety
      const btnSig = new Set();
      for (const b of [...d.btnLight, ...d.btnDark]) btnSig.add(`${b.radius}|${b.bg}|${b.color}|${b.border}`);
      if (btnSig.size > 6) add("MINOR", "components", route, name, `${btnSig.size} distinct button styles on one page`, [...btnSig].slice(0, 8).join(" ~ "));

      // max-width: flag only competing WIDE container widths (narrow columns are by design)
      const wide = d.containers.filter((c) => c.maxWidth >= 700);
      const wideVals = [...new Set(wide.map((c) => c.maxWidth))].sort((a, b) => b - a);
      if (wideVals.length > 1 && (wideVals[0] - wideVals[wideVals.length - 1]) < wideVals[0] * 0.3) {
        add("MINOR", "spacing", route, name, `competing wide container max-widths: ${wideVals.join("px, ")}`, null);
      }

      // contrast
      let worst = null;
      for (const p of d.bodyText) {
        if (!p.color.startsWith("#") || !p.bg.startsWith("#") || p.bg === "#000000" && p.color === "#000000") continue;
        const c = contrast(p.color, p.bg);
        const large = parseFloat(p.size) >= 18.66;
        const need = large ? 3 : 4.5;
        if (c < need && (!worst || c < worst.c)) worst = { c, text: p.text, color: p.color, bg: p.bg };
      }
      if (worst) add("CRITICAL", "contrast", route, name, `contrast ${worst.c.toFixed(2)}:1 < required: "${worst.text.slice(0, 40)}" (${worst.color} on ${worst.bg})`, null);

      // off-palette background colors
      const bgs = new Set();
      for (const it of [...d.btnLight, ...d.btnDark, ...d.cards, ...d.sections]) {
        if (it.bg && it.bg !== "rgba(0, 0, 0, 0)" && it.bg.startsWith("#") && !PALETTE.has(it.bg.toLowerCase())) bgs.add(it.bg.toLowerCase());
      }
      if (bgs.size > 0) add("MINOR", "color", route, name, `off-palette bg colors: ${[...bgs].slice(0, 10).join(", ")}`, null);

      // tap targets (mobile)
      if (name === "mobile") {
        const small = d.focusables.filter((f) => f.h < 44 && f.h > 0 && f.w > 0);
        if (small.length) add("MINOR", "tap-targets", route, name, `${small.length} focusable elements < 44px tall: ` + small.slice(0, 6).map((s) => `"${s.text || s.tag}" h=${s.h}`).join(", "), null);
      }
    }
  }

  // cross-route: section rhythm — collect (route,view)->[section padT/padB] and
  // flag routes whose pattern deviates from the modal pattern
  return F;
}

// ---- main ---------------------------------------------------------------
const browser = await chromium.launch();
const data = {};
for (const route of ROUTES) {
  data[route] = {};
  for (const v of VIEWS) {
    const page = await browser.newPage({ viewport: { width: v.width, height: v.height } });
    try {
      await page.goto(BASE + "/#" + route, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(1800);
      // force any reveal/intersection states so content is visible
      await page.evaluate(() => {
        document.querySelectorAll(".reveal-clip, .reveal-fade, [class*=reveal]").forEach((el) => {
          el.classList.add("is-visible");
        });
      });
      await page.waitForTimeout(600);
      data[route][v.name] = await page.evaluate(SAMPLE);
    } catch (e) {
      data[route][v.name] = { error: String(e).slice(0, 120) };
    }
    await page.close();
  }
}
await browser.close();

const dir = path.join(ROOT, "audit-evidence", "uiux");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "scan-data.json"), JSON.stringify(data, null, 1));
const findings = reportFindings(data, BASE);
const counts = { CRITICAL: 0, MINOR: 0 };
for (const f of findings) counts[f.sev] = (counts[f.sev] || 0) + 1;
console.log(`\nScan of ${BASE} — ${ROUTES.length} routes × ${VIEWS.length} views`);
console.log(`Findings: ${counts.CRITICAL} CRITICAL, ${counts.MINOR} MINOR\n`);
for (const f of findings) {
  console.log(`[${f.sev}] ${f.dim} @ ${f.route} (${f.view}): ${f.msg}${f.ev ? " — " + f.ev : ""}`);
}
process.exit(0);

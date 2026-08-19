#!/usr/bin/env node
/**
 * WCAG contrast audit — Paper Crane Wellness.
 * Walks rendered text nodes, composites background colors up the ancestor
 * chain, and checks WCAG 2.2 contrast (4.5:1 body, 3:1 large text).
 * Text on gradients is flagged for manual review (auto-composite unreliable).
 * Usage: node scripts/contrast-audit.mjs [base_url]
 */
import { chromium } from "playwright";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = process.argv[2] || "http://localhost:4173";
const ROUTES = ["/", "/about", "/specialties", "/trauma", "/neurodivergent", "/individual", "/faq", "/contact", "/admin"];

const PAGE_FN = () => {
  function parseColor(str) {
    if (!str) return null;
    if (str.includes("oklab") || str.includes("color(") || str.includes("lab")) {
      // resolve via canvas — getComputedStyle does not re-resolve modern color spaces
      const cv = document.createElement("canvas"); cv.width = 1; cv.height = 1;
      const c2 = cv.getContext("2d"); c2.clearRect(0, 0, 1, 1); c2.fillStyle = str; c2.fillRect(0, 0, 1, 1);
      const d = c2.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    }
    str = String(str).trim();
    let m;
    if (str === "transparent" || str === "none") return [0, 0, 0, 0];
    if ((m = str.match(/^rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\)$/))) {
      const a = m[4] !== undefined ? (m[4].includes("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4])) : 1;
      return [+m[1], +m[2], +m[3], a];
    }
    if ((m = str.match(/^#([0-9a-f]{6})$/i)))
      return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1];
    if ((m = str.match(/^#([0-9a-f]{3})$/i)))
      return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16), 1];
    if ((m = str.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s*([\d.]+%?))?\)$/))) {
      const a = m[4] !== undefined ? (m[4].includes("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4])) : 1;
      return [m[1] * 255, m[2] * 255, m[3] * 255, a];
    }
    // oklch/oklab: approximate via lightness only (luminance of nearest grey)
    if ((m = str.match(/^okl(?:ab|ch)\(([\d.]+)(?:\s+[\d.]+(?:deg)?\s+[\d.]+(?:deg)?)?(?:\s+\/\s*([\d.]+%?))?\)$/))) {
      const L = parseFloat(m[1]);
      let v;
      if (L <= 0.008856) v = L / 903.3;
      else v = Math.pow((L + 0.16) / 1.16, 2.4);
      const g = Math.round(Math.min(255, Math.max(0, v * 255)));
      const a = m[2] !== undefined ? (m[2].includes("%") ? parseFloat(m[2]) / 100 : parseFloat(m[2])) : 1;
      return [g, g, g, a];
    }
    const named = { white: [255, 255, 255], black: [0, 0, 0] };
    if (named[str.toLowerCase()]) return named[str.toLowerCase()].concat(1);
    return null;
  }
  function composite(fg, bg) {
    fg = fg || [0,0,0,0]; bg = bg || [0,0,0,0];
    if (fg[3] >= 0.999) return fg.slice();
    const out = [0, 0, 0];
    for (let i = 0; i < 3; i++) out[i] = fg[i] * fg[3] + bg[i] * (1 - fg[3]);
    out[3] = fg[3] + bg[3] * (1 - fg[3]);
    return out;
  }
  function lum(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  function ratio(a, b) {
    const l1 = lum(a), l2 = lum(b);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  const results = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (results.length > 6000) break;
    const val = node.nodeValue;
    if (!val || !val.trim()) continue;
    let el = node.parentElement;
    if (!el || el.closest("script,style,svg,noscript")) continue;
    const cs = getComputedStyle(el);
    const fg = parseColor(cs.color);
    if (!fg) continue;

    // chain of backgrounds from el up to <body>
    const chain = [];
    let hasGradient = false;
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const s = getComputedStyle(cur);
      const c = parseColor(s.backgroundColor);
      chain.unshift(c);
      if (s.backgroundImage && s.backgroundImage.includes("gradient")) hasGradient = true;
      cur = cur.parentElement;
    }
    let bg = [251, 250, 246, 1]; // page paper fallback
    for (const c of chain) bg = composite(c, bg);

    const size = parseFloat(cs.fontSize) || 0;
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    if (fg[3] < 0.05) continue; // effectively invisible text (decorative)
    const fgComp = composite(fg, bg); // composite text alpha over resolved bg
    const r = ratio(fgComp, bg);
    const key = el.tagName + "|" + val.trim().slice(0, 40) + "|" + r.toFixed(2) + "|" + bg.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({
      text: val.trim().replace(/\s+/g, " ").slice(0, 60),
      el: el.tagName.toLowerCase(),
      cls: (el.className || "").toString().slice(0, 44),
      ratio: +r.toFixed(2),
      large, size: +size.toFixed(1), weight,
      fg: cs.color.slice(0, 44),
      bg: bg.map((v) => Math.round(v)).join(","),
      onGradient: hasGradient,
      fail: r < (large ? 3 : 4.5) - 0.001,
    });
  }
  return results;
};

const browser = await chromium.launch();
const allFails = [];
for (const r of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/" + r.replace(/^\//, ""), { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(1000);
  // settle reveals by scrolling
  await p.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const t = setInterval(() => { y += 400; window.scrollTo(0, y); if (y >= document.body.scrollHeight) { clearInterval(t); res(); } }, 50);
    });
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(600);
  const results = await p.evaluate(PAGE_FN);
  const fails = results.filter((x) => x.fail);
  const grad = results.filter((x) => x.onGradient);
  console.log(`${r}: ${results.length} samples, ${fails.length} contrast failures${grad.length ? ` (${grad.length} on gradients, unmeasured)` : ""}`);
  for (const f of fails) {
    console.log(`  ${f.ratio}:1 [${f.large ? "large" : "body"} ${f.size}px/${f.weight}] "${f.text}" fg=${f.fg} bg=[${f.bg}] <${f.el}> .${f.cls}`);
    allFails.push({ route: r, ...f });
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(ROOT, "audit-evidence/uiux/contrast.json"), JSON.stringify(allFails, null, 2));
console.log(`\nTOTAL contrast failures: ${allFails.length}`);

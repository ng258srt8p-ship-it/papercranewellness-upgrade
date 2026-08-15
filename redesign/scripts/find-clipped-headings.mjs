// Detect visually cut-off headings: overflow clipping, ellipsis, line-clamp,
// ancestor overflow:hidden cropping, and tight line-height + clipping ancestor.
// Usage: node scripts/find-clipped-headings.mjs   (needs preview on :4174)
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4174";
const ROUTES = [
  ["home", "/"],
  ["about", "/#/about"],
  ["specialties", "/#/specialties"],
  ["trauma", "/#/trauma"],
  ["neuro", "/#/neurodivergent"],
  ["individual", "/#/individual"],
  ["faq", "/#/faq"],
  ["contact", "/#/contact"],
];
const VPS = [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 375, height: 812 }]];
const SEL = "h1, h2, h3, h4, .display, .eyebrow";

const issues = [];

const browser = await chromium.launch();
for (const [vpName, vp] of VPS) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  for (const [rName, rPath] of ROUTES) {
    await page.goto(BASE + rPath, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    // force reveals
    await page.evaluate(async () => {
      const step = 300;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);
    // Force reveal end-state (headless IO never fires quiet compositor)
    await page.evaluate(() => {
      document.querySelectorAll(".reveal, .reveal-clip").forEach(e => e.classList.add("is-visible"));
    });
    await page.waitForTimeout(300);

    const found = await page.evaluate((sel) => {
      const out = [];
      const els = [...document.querySelectorAll(sel)];
      const px = (v) => parseFloat(v) || 0;
      for (const el of els) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || el.offsetParent === null && cs.position !== "fixed") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        // Skip intentionally-hidden content: if any ancestor computes to opacity 0
        // (e.g. the collapsed max-h-0 mega-menu panel) the whole subtree is invisible
        // by design, so nothing inside it is "visually cut-off".
        let opA = el.parentElement;
        while (opA) { if (getComputedStyle(opA).opacity === "0") break; opA = opA.parentElement; }
        if (opA) continue;

        const selfH = el.scrollWidth > el.clientWidth + 1;
        const selfV = el.scrollHeight > el.clientHeight + 1;
        const ellipsis = cs.textOverflow === "ellipsis" && selfH;
        const clamp = (cs.webkitLineClamp || cs.lineClamp) && cs.webkitLineClamp !== "none" && cs.webkitLineClamp !== "";

        // the element's OWN clip-path: anything other than "none" clips its
        // painting to the shape, including overflow content.
        let selfClip = null;
        const cp = cs.clipPath || cs.webkitClipPath || "none";
        if (cp !== "none" && /inset\(/.test(cp)) {
          const m = cp.match(/inset\(\s*([^)]+)\s*\)/);
          if (m) {
            const parts = m[1].trim().split(/\s+/).map(v => ({ v: parseFloat(v), pct: v.endsWith("%") }));
            if (parts.length === 4) {
              const toPx = (o, dim) => (o.pct ? (o.v / 100) * dim : o.v);
              const cBottom = rect.bottom - toPx(parts[2], rect.height);
              const cRight = rect.right - toPx(parts[1], rect.width);
              const pBottom = rect.top + el.scrollHeight;
              const pRight = rect.left + el.scrollWidth;
              if (pBottom > cBottom + 1 || pRight > cRight + 1) {
                selfClip = `clip rects: painted(${pBottom.toFixed(0)}/${pRight.toFixed(0)}) vs clip(${cBottom.toFixed(0)}/${cRight.toFixed(0)})`;
              }
            }
          }
        }

        // nearest ancestor with clipping overflow
        let clippingAncestor = null;
        let a = el.parentElement;
        while (a) {
          const acs = getComputedStyle(a);
          if (/(hidden|clip)/.test(acs.overflow) || /(hidden|clip)/.test(acs.overflowY)) {
            const ar = a.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            const eps = 1.5;
            if (r.bottom > ar.bottom + eps || r.right > ar.right + eps || r.top < ar.top - eps || r.left < ar.left - eps) {
              clippingAncestor = (a.className && a.className.toString ? a.className.toString() : a.tagName).slice(0, 90);
              break;
            }
          }
          a = a.parentElement;
        }

        const fs = px(cs.fontSize);
        const lh = px(cs.lineHeight);
        const tight = fs > 0 && lh > 0 && lh < fs * 1.15;
        const tightWithClip = tight && (selfV || clippingAncestor);

        if (selfClip || ellipsis || clamp || clippingAncestor) {
          out.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && el.className.toString ? el.className.toString() : "").slice(0, 110),
            text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 70),
            reasons: [
              selfClip && "self-clip",
              (selfV && clippingAncestor) && "v-overflow+clipping",
              (selfH && clippingAncestor) && "h-overflow+clipping",
              ellipsis && "ellipsis",
              clamp && "line-clamp",
              clippingAncestor && "ancestor-crop",
            ].filter(Boolean),
            fs, lh,
            tight,
            tightWithClip,
            rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
            scroll: { sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight },
            ancestor: clippingAncestor || null,
          });
        }
      }
      return out;
    }, SEL);

    for (const f of found) issues.push({ vp: vpName, route: rName, ...f });
  }
  await ctx.close();
}
await browser.close();

// Dedupe identical issues
const seen = new Set();
const uniq = [];
for (const i of issues) {
  const k = [i.vp, i.route, i.tag, i.cls, i.text, i.reasons.join("+")].join("|");
  if (!seen.has(k)) { seen.add(k); uniq.push(i); }
}
for (const i of uniq) {
  console.log(`[${i.vp}/${i.route}] <${i.tag}> "${i.text}"`);
  console.log(`   reasons: ${i.reasons.join(", ")} | fs=${i.fs}px lh=${i.lh}px tight=${i.tight} | rect=${JSON.stringify(i.rect)} scroll=${JSON.stringify(i.scroll)}`);
  console.log(`   class: ${i.cls}`);
  if (i.reasons.includes("ancestor-crop")) console.log(`   ancestor: ${i.ancestor}`);
}
console.log(`\nTOTAL: ${uniq.length} clipped-heading issue(s) across ${ROUTES.length * VPS.length} route/viewport combos`);
process.exit(uniq.length ? 1 : 0);

#!/usr/bin/env node
// Verify that the hero clip-reveal spans no longer clip painted
// descenders after the reveal completes (root cause: .display
// line-height 0.98 + clip-path inset(0 0 0 0) end-state).
//
// For each hero .reveal-clip span we check that the FINAL clip rect
// (computed clip-path inset, negatives extend past the border box)
// fully contains the painted text extent (border box + scrollHeight
// overflow below, + small allowances for ascender/side overflow).

import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173/";
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "375", width: 375, height: 812 },
];

const browser = await chromium.launch();
let failures = 0;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });

  // Wait for the reveal spans to get is-visible (IO in headless can be
  // slow). If they haven't fired in ~8s, force the end-state so we can
  // still verify the final clip geometry (real browsers apply it).
  let forced = false;
  try {
    await page.waitForFunction(
      () => {
        const spans = [...document.querySelectorAll("h1 .reveal-clip")];
        return spans.length > 0 && spans.every((s) => s.classList.contains("is-visible"));
      },
      { timeout: 8000 },
    );
  } catch {
    forced = true;
    await page.evaluate(() =>
      document.querySelectorAll("h1 .reveal-clip").forEach((s) => s.classList.add("is-visible")),
    );
  }
  // Let the 1.2s clip-path transition finish.
  await page.waitForTimeout(1600);

  const result = await page.evaluate(() => {
    const spans = [...document.querySelectorAll("h1 .reveal-clip")];
    return spans.map((s) => {
      const cs = getComputedStyle(s);
      const r = s.getBoundingClientRect();
      const clip = (cs.clipPath || cs.webkitClipPath || "").trim();
      // parse inset(a b c d) with px or %
      let insets = null;
      const m = clip.match(/inset\(\s*([^)]+)\s*\)/);
      if (m) {
        insets = m[1].trim().split(/\s+/).map((v) => ({
          v: parseFloat(v),
          pct: v.endsWith("%"),
        }));
        // CSS 3-value inset() = (top, horizontal, bottom): left = right
        if (insets.length === 3) insets = [insets[0], insets[1], insets[2], insets[1]];
      }
      const toPx = (ins, dim, boxDim) => {
        if (!ins) return 0;
        return ins.pct ? (ins.v / 100) * boxDim : ins.v;
      };
      // clip rect in viewport coords (reference box = border box)
      const boxW = r.width, boxH = r.height;
      const clipTop = r.top + (insets ? toPx(insets[0], null, boxH) : 0);
      const clipRight = r.right - (insets && insets[1] ? toPx(insets[1], null, boxW) : 0);
      const clipBottom = r.bottom - (insets && insets[2] ? toPx(insets[2], null, boxH) : 0);
      const clipLeft = r.left + (insets && insets[3] ? toPx(insets[3], null, boxW) : 0);
      // painted extent: bottom can overflow the box by scrollHeight - clientHeight;
      // top/side overflow is small for this type but allow a few px.
      const paintedBottom = r.top + s.scrollHeight;
      const paintedRight = r.left + s.scrollWidth;
      const paintedTop = r.top - 4; // ascender headroom allowance
      const paintedLeft = r.left - 4;
      return {
        text: s.textContent.trim(),
        clip,
        is_visible: s.classList.contains("is-visible"),
        box: { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), h: +boxH.toFixed(1), w: +boxW.toFixed(1) },
        clipRect: { top: +clipTop.toFixed(1), right: +clipRight.toFixed(1), bottom: +clipBottom.toFixed(1), left: +clipLeft.toFixed(1) },
        scrollH: s.scrollHeight, clientH: s.clientHeight, scrollW: s.scrollWidth, clientW: s.clientWidth,
        overflowBottom: s.scrollHeight - s.clientHeight,
        contains: paintedBottom <= clipBottom + 0.5 && paintedRight <= clipRight + 0.5 &&
                   paintedTop >= clipTop - 0.5 && paintedLeft >= clipLeft - 0.5,
        headroomBottom: +(clipBottom - paintedBottom).toFixed(1),
        headroomRight: +(clipRight - paintedRight).toFixed(1),
      };
    });
  });

  // Screenshot the hero h1 with padding so descenders are in frame.
  const h1 = await page.$("h1");
  if (h1) {
    const box = await h1.boundingBox();
    await page.screenshot({
      path: `audit-evidence/hero-descender-${vp.name}.png`,
      clip: { x: 0, y: Math.max(0, box.y - 20), width: vp.width, height: box.height + 60 },
    });
  }

  console.log(`\n=== ${vp.width}x${vp.height} (forced end-state: ${forced}) ===`);
  for (const s of result) {
    const ok = s.contains && s.is_visible;
    if (!ok) failures++;
    console.log(`${ok ? "PASS" : "FAIL"}  "${s.text.slice(0, 24)}"  clip=${s.clip}  boxH=${s.box.h}  scrollH=${s.scrollH}  overflowBelow=${s.overflowBottom}px  headroomBelow=${s.headroomBottom}px  headroomRight=${s.headroomRight}px`);
    if (!s.contains) console.log("      clipRect:", JSON.stringify(s.clipRect), "box:", JSON.stringify(s.box));
  }
  await ctx.close();
}

await browser.close();
if (failures) {
  console.error(`\n${failures} span(s) FAIL - descenders clipped or not revealed`);
  process.exit(1);
}
console.log("\nALL SPANS PASS - no painted descender falls outside the final clip rect");

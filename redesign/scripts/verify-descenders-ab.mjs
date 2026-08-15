
import { chromium } from "@playwright/test";
import sharp from "sharp";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
await page.evaluate(() => {
  const spans = [...document.querySelectorAll("h1 .reveal-clip")];
  spans.forEach(s => { s.classList.add("is-visible"); s.style.transition = "none"; });
  const t = spans.find(x => x.textContent.includes("to stay this way"));
  spans.filter(s => s !== t).forEach(s => (s.style.visibility = "hidden"));
});
await page.waitForTimeout(150);
const box = await page.evaluate(() => {
  const s = [...document.querySelectorAll("h1 .reveal-clip")].find(x => x.textContent.includes("to stay this way"));
  const r = s.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, scrollH: s.scrollHeight };
});
console.log("box bottom:", box.bottom.toFixed(1), " scrollH bottom would be:", (box.top + box.scrollH).toFixed(1));

// Band strictly BELOW the border box, right side (where "way"/"y" lives), away from the left gradient blob
const band = { x: 560, y: Math.ceil(box.bottom) + 1, width: 240, height: 24 }; // y: 570..594
const THRESH = 245; // paper is 246-251; catches faint AA strokes

async function bandInk(cssClip) {
  await page.evaluate((c) => {
    const t = [...document.querySelectorAll("h1 .reveal-clip")].find(x => x.textContent.includes("to stay this way"));
    t.style.clipPath = c;
  }, cssClip);
  await page.waitForTimeout(150);
  const computed = await page.evaluate(() => {
    const t = [...document.querySelectorAll("h1 .reveal-clip")].find(x => x.textContent.includes("to stay this way"));
    return getComputedStyle(t).clipPath;
  });
  const buf = await page.screenshot({ clip: band });
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  let ink = 0; const byRow = [];
  for (let y = 0; y < info.height; y++) {
    let rowInk = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      if (data[i] < THRESH || data[i+1] < THRESH || data[i+2] < THRESH) rowInk++;
    }
    if (rowInk) { ink += rowInk; byRow.push([band.y + y, rowInk]); }
  }
  return { computed, ink, byRow };
}

const oldState = await bandInk("inset(0 0 0 0)");
const newState = await bandInk("inset(-10% -5% -40% -5%)");
console.log("\nOLD clip  (inset 0 0 0 0):", JSON.stringify(oldState));
console.log("NEW clip  (fixed):      ", JSON.stringify(newState));
const ok = newState.ink > 0 && newState.ink > oldState.ink;
console.log(ok ? "\nDEFINITIVE: descender tail paints below the old clip line in the fixed build, not in the old build." : "\nCheck results.");
process.exit(ok ? 0 : 1);

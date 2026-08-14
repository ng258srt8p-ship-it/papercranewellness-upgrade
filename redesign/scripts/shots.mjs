// Visual evidence: full-page screenshots of every route (desktop 1440 + mobile 375).
// Usage: node scripts/shots.mjs   (serves dist/ on :4174 via static server started separately)
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const OUT = "audit-evidence";
await mkdir(OUT, { recursive: true });

const routes = [
  ["home", "/"],
  ["about", "/#/about"],
  ["specialties", "/#/specialties"],
  ["specialty-trauma", "/#/trauma"],
  ["faq", "/#/faq"],
  ["contact", "/#/contact"],
];

const browser = await chromium.launch();
for (const [name, path] of routes) {
  for (const [vp, label] of [
    [{ width: 1440, height: 900 }, "desktop"],
    [{ width: 375, height: 812 }, "mobile"],
  ]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto("http://localhost:4174" + path, { waitUntil: "networkidle" });
    // let reveal animations settle
    await page.waitForTimeout(1600);
    // force any below-fold reveals
    await page.evaluate(async () => {
      const step = 400;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${label}-${name}.png`, fullPage: true });
    await ctx.close();
    console.log(`shot: ${label}-${name}.png`);
  }
}
await browser.close();

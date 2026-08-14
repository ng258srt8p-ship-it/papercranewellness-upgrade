// Programmatic visual/brand compliance checks (no vision needed).
import { chromium } from "@playwright/test";

const BASE = "http://localhost:4174";
const results = [];
const ok = (name, pass, detail = "") => results.push({ name, pass, detail });

const browser = await chromium.launch();

// --- 1. All routes: title updates, no horizontal overflow, images loaded, no missing fonts
const routes = [
  ["home", "/", "Paper Crane Wellness"],
  ["about", "/#/about", ""],
  ["specialties", "/#/specialties", ""],
  ["trauma", "/#/trauma", ""],
  ["faq", "/#/faq", ""],
  ["contact", "/#/contact", ""],
];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const [name, path] of routes) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    const broken = imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.alt || i.src.slice(0, 40));
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const h1 = document.querySelector("h1, .display");
    const body = getComputedStyle(document.body);
    const h1font = h1 ? getComputedStyle(h1).fontFamily : null;
    return {
      title: document.title,
      broken,
      imgCount: imgs.length,
      overflow,
      bodyFont: body.fontFamily,
      h1font,
      h1Text: h1?.textContent?.slice(0, 60),
    };
  });
  ok(`${name}: document.title set`, info.title.length > 5, info.title);
  ok(`${name}: no broken images`, info.broken.length === 0, info.broken.join("; ") || `${info.imgCount} imgs`);
  ok(`${name}: no horizontal overflow`, info.overflow <= 0, `overflow=${info.overflow}px`);
  ok(`${name}: body font is Inter stack`, /Inter/i.test(info.bodyFont), info.bodyFont.slice(0, 60));
  if (info.h1font) ok(`${name}: display font is Playfair`, /Playfair/i.test(info.h1font), `${info.h1font.slice(0, 60)} ("${info.h1Text}")`);
}
await ctx.close();

// --- 2. Contact page: SP contact button brand styles
const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await c2.newPage();
await p2.goto(BASE + "/#/contact", { waitUntil: "networkidle" });
await p2.waitForTimeout(800);
const btn = p2.locator('#root a.spwidget-button[data-spwidget-type="Contact form"]');
const st = await btn.evaluate((el) => {
  const s = getComputedStyle(el);
  return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius, pad: s.padding, border: s.borderTopWidth };
});
ok("contact: SP button sage bg", st.bg === "rgb(107, 124, 84)", st.bg);
ok("contact: SP button white text", st.color === "rgb(255, 255, 255)", st.color);
ok("contact: SP button pill", st.radius === "999px", st.radius);
ok("contact: SP button 14x28 padding", st.pad === "14px 28px", st.pad);
await c2.close();

// --- 3. Palette spot-checks: sample background colors on home
const c3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p3 = await c3.newPage();
await p3.goto(BASE + "/", { waitUntil: "networkidle" });
await p3.waitForTimeout(1200);
const colors = await p3.evaluate(() => {
  const out = new Set();
  const seen = document.querySelectorAll("body *");
  let n = 0;
  for (const el of seen) {
    if (n++ > 600) break;
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)") out.add(bg);
  }
  return [...out];
});
const expected = ["rgb(251, 250, 246)", "rgb(240, 244, 238)", "rgb(36, 54, 58)", "rgb(107, 124, 84)"];
const missing = expected.filter((e) => !colors.some((c) => c === e));
ok("home: brand palette present (paper/mist/navy/sage)", missing.length === 0, missing.join(", ") || `bg set: ${colors.slice(0, 8).join(", ")}`);
await c3.close();

// --- 4. Mobile: no overflow on every route + hamburger present
const c4 = await browser.newContext({ viewport: { width: 375, height: 812 } });
const p4 = await c4.newPage();
for (const [name, path] of routes) {
  await p4.goto(BASE + path, { waitUntil: "networkidle" });
  await p4.waitForTimeout(700);
  const overflow = await p4.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`mobile ${name}: no horizontal overflow`, overflow <= 0, `overflow=${overflow}px`);
}
const burger = await p4.locator('button[aria-label*="menu" i]').count();
ok("mobile: hamburger present", burger === 1, `count=${burger}`);
await c4.close();

await browser.close();

let fail = 0;
for (const r of results) {
  if (!r.pass) fail++;
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  — " + r.detail : ""}`);
}
console.log(`\n${results.length - fail}/${results.length} checks passed`);
process.exit(fail ? 1 : 0);

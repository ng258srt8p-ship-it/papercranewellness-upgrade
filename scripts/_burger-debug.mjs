import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const p = await c.newPage();
await p.goto("http://localhost:4173/#/", { waitUntil: "networkidle" });
await p.waitForTimeout(1000);
const before = await p.evaluate(() => {
  const btns = [...document.querySelectorAll("button")];
  return btns.map((b) => ({ label: b.getAttribute("aria-label"), expanded: b.getAttribute("aria-expanded"), cls: String(b.className).slice(0, 50) }));
});
console.log("buttons before:", JSON.stringify(before, null, 1));
const burger = p.locator("button[aria-label*='menu' i]").first();
console.log("burger count:", await p.locator("button[aria-label*='menu' i]").count());
await burger.click({ timeout: 5000 }).catch((e) => console.log("click err:", e.message));
await p.waitForTimeout(800);
const after = await p.evaluate(() => {
  const btns = [...document.querySelectorAll("button")].filter((b) => b.getAttribute("aria-expanded") !== null);
  const navLinks = [...document.querySelectorAll("nav a")].map((a) => (a.innerText || "").trim()).filter(Boolean);
  return { btns: btns.map((b) => ({ label: b.getAttribute("aria-label"), expanded: b.getAttribute("aria-expanded") })), navLinks };
});
console.log("after:", JSON.stringify(after, null, 1));
await p.screenshot({ path: "/tmp/burger-open.png", fullPage: false });
await b.close();

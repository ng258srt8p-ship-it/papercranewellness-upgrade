import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await c.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
p.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 120)); });
p.on("response", (r) => { if (r.status() >= 400) errors.push("http " + r.status() + " " + r.url().slice(0, 90)); });

for (const url of ["http://localhost:4173/this-route-does-not-exist", "http://localhost:4173/#/this-route-does-not-exist"]) {
  const resp = await p.goto(url, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2500);
  const title = await p.title();
  const rootHtml = await p.evaluate(() => {
    const r = document.getElementById("root");
    return r ? r.innerHTML.slice(0, 300) : "NO ROOT";
  });
  const bodyText = (await p.textContent("body").catch(() => "")) || "";
  console.log("=== " + url);
  console.log("status:", resp ? resp.status() : "?", "| title:", title);
  console.log("root starts:", rootHtml.slice(0, 200).replace(/\s+/g, " "));
  console.log("body has 404?:", /404|not found/i.test(title + " " + bodyText));
  console.log("errors:", errors.splice(0, 8));
}
await b.close();

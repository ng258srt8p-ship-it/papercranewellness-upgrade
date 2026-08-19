import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const goto = (u) => p.goto(u, { waitUntil: "domcontentloaded" }).then((r) => r.status()).catch(() => "ERR");

let s = await goto("https://papercranewellness.pages.dev/#/this-route-does-not-exist");
await p.waitForTimeout(2500);
console.log("prod /#/bogus http:", s, "title:", await p.title());

s = await goto("https://papercranewellness.pages.dev/about-extra");
await p.waitForTimeout(2500);
console.log("prod /about-extra http:", s, "title:", await p.title());

// does the router treat /about-extra as path? test hash on wrong path
s = await goto("https://papercranewellness.pages.dev/whatever/#/faq");
await p.waitForTimeout(2500);
console.log("prod /whatever/#/faq http:", s, "title:", await p.title());
await b.close();

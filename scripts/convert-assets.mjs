// One-shot asset pipeline: source photos (repo root) -> redesign/src/assets/images/
import sharp from "sharp";
import { cpSync, rmSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "..");
const src = path.join(root, "src/assets/images");
const out = path.resolve(import.meta.dirname, "..", "src/assets/images");

const jobs = [
  // [source, output, transform]
  ["rebekah-headshot.webp", "rebekah-headshot.webp", null],
  ["rebekah-tozer.webp", "rebekah-tozer.webp", null],
  ["rebekah-outdoor.webp", "rebekah-outdoor.webp", (im) => im.resize({ width: 1200 }).webp({ quality: 80 })],
  ["Office.png", "office.webp", (im) => im.resize({ width: 1343 }).webp({ quality: 82 })],
];

for (const [s, d, t] of jobs) {
  let img = sharp(path.join(src, s));
  if (t) img = t(img);
  const outPath = path.join(out, d);
  await img.toFile(outPath);
  const { statSync } = await import("node:fs");
  console.log(`${s} -> ${d} (${statSync(outPath).size} bytes)`);
}
cpSync(path.join(src, "favicon.png"), path.join(out, "favicon.png"));
console.log("favicon.png copied");

// remove arena placeholders
for (const f of ["rebekah.jpg", "portrait.jpg", "office.jpg", "room.jpg", "paper.jpg"]) {
  rmSync(path.join(import.meta.dirname, "..", "src/assets", f), { force: true });
}
console.log("arena placeholder jpgs removed");

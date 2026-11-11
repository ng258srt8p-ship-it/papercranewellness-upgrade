// Keeps the social share thumbnail (og:image) in sync with the portrait set.
// Runs as `prebuild` (locally and in the GitHub deploy workflow) and generates
// public/og-image.webp — a 4:3 crop of the portrait the user chose for shares
// (headshots/2026-11/082443, same photo as the Meet-Rebekah card) — so the
// static <meta> tag in index.html, which Applebot and other link previewers
// read without running JS, always shows a current photo.
//
// The 4:3 landscape crop is top-anchored: the faces sit in the upper half of
// these portraits, so cropping from the top keeps the face and trims torsos.
import { statSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Prefer the archival high-res PNG; fall back to the bundled WebP so the script
// works even if the photo folder is trimmed down later.
const srcPng = resolve(root, "rebekah-headshots-2026-11/1-tilted-head-square.png");
const srcWebp = resolve(root, "src/assets/images/rebekah-outdoor.webp"); // the same portrait
const src = existsSync(srcPng) ? srcPng : srcWebp;
const dest = resolve(root, "public/og-image.webp");

if (!existsSync(src)) {
  console.error(`[sync-og] missing source ${src} — reconvert it from rebekah-headshots-2026-11/`);
  process.exit(1);
}

const { width, height } = await sharp(src).metadata();
const cropH = Math.round((width * 3) / 4); // 4:3 landscape, anchored at top
if (cropH > height) {
  console.error(`[sync-og] source ${width}×${height} is too short for a 4:3 crop`);
  process.exit(1);
}
await sharp(src)
  .extract({ left: 0, top: 0, width, height: cropH })
  .resize({ width: 1200, height: 900, fit: "cover" })
  .webp({ quality: 85 })
  .toFile(dest);

const { size } = statSync(dest);
console.log(`[sync-og] portrait → og-image.webp 1200×900 (${Math.round(size / 1024)} kB)`);

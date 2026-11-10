// Keeps the social share thumbnail (og:image) in sync with the site hero photo.
// Runs as `prebuild` (locally and in the GitHub deploy workflow), copying the
// current hero asset from src/assets into public/ so the static <meta> tag in
// index.html — which Applebot and other link previewers read without running
// JS — always points at the same photo visitors see on the site.
//
// To change the share thumbnail, change the hero import in src/assets/images.ts.
import { copyFileSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "src/assets/images/rebekah-headshot.webp");
const dest = resolve(root, "public/og-image.webp");

copyFileSync(src, dest);
const { size } = statSync(dest);
console.log(`[sync-og] hero → og-image.webp (${Math.round(size / 1024)} kB)`);

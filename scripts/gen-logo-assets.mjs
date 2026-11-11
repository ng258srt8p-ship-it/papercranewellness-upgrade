/*
 * Generates favicon + icon assets from the traced crane mark
 * (brand/crane-traced.svg — potrace output from the original brand artwork,
 * see brand/paper-crane-wellness-logo-source.png).
 *
 * Run manually after re-tracing:  npm run gen:logo
 * Outputs (committed to the repo): public/favicon.svg, public/icon-192.png,
 * public/icon-512.png, public/apple-touch-icon.png, public/favicon.ico
 *
 * No build hook: everything here is deterministic from committed sources.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));

const src = readFileSync(root + 'brand/crane-traced.svg', 'utf8');
// potrace emits one <path> per traced polygon (crane = 9 facets/dots).
const ds = src.match(/d="([^"]+)"/g).map((m) => m.slice(3, -1).replace(/\s+/g, ' ').trim());
const vb = src.match(/viewBox="([\d. ]+)"/)[1].trim().split(/\s+/).map(Number);
const W = vb[2];
const H = vb[3];
// W,H = crane size in display units (potrace path data lives in 10x space,
// flipped by its own translate/scale — reproduced verbatim below).

// 512 badge: off-white rounded square (paper), crane centered at ~76% width.
const targetW = 390;
const s = targetW / W;
const targetH = H * s;
const tx = (512 - targetW) / 2;
const ty = (512 - targetH) / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="102" fill="#F4F1EA"/>
  <g fill="#24363A" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(5)})">
    <g transform="translate(0 ${H.toFixed(6)}) scale(0.1 -0.1)">${ds.map((p) => `<path d="${p}"/>`).join('')}</g>
  </g>
</svg>`;

writeFileSync(root + 'public/favicon.svg', svg);
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(root + 'public/icon-512.png');
await sharp(Buffer.from(svg)).resize(192, 192).png().toFile(root + 'public/icon-192.png');
// iOS applies its own rounded mask and composites on a solid background, so
// apple-touch-icon must be a full-bleed opaque square — no corner radius, no alpha.
const fullBleed = svg.replace('rx="102"', 'rx="0"');
await sharp(Buffer.from(fullBleed)).resize(180, 180).png().toFile(root + 'public/apple-touch-icon.png');
// sharp cannot emit .ico — build it from the 512 png with Pillow.
execFileSync('python3', [
  '-c',
  `from PIL import Image
img = Image.open(${JSON.stringify(root + 'public/icon-512.png')}).convert('RGBA')
img.save(${JSON.stringify(root + 'public/favicon.ico')}, format='ICO', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])`,
]);
console.log('favicon.svg + PNG/ICO icons regenerated from brand/crane-traced.svg');

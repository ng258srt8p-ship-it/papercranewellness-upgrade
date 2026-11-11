# Rebekah headshots — November 2026 session

Source photos for the site's portrait slots (supersede the August `rtoz-bean-*` set).
These files are the archival originals; the site imports the converted WebPs from
`src/assets/images/` (rebekah-headshot / rebekah-outdoor / rebekah-tozer / rebekah-spare).

| File                          | Used as                                             |
| ----------------------------- | --------------------------------------------------- |
| `1-tilted-head-square.png`    | Meet Rebekah card (`img.portrait`) + og-image crop  |
| `2-front-facing-wavy.png`     | About page hero (`img.spare`)                       |
| `3-looking-aside-square.png`  | Archived spare (not currently rendered)             |
| `4-hero-front-facing.png`     | Home hero portrait (`img.rebekah`)                  |

To re-generate the share thumbnail after swapping photos: `npm run build`
(`scripts/sync-og.mjs` runs as `prebuild` and rewrites `public/og-image.webp`
as a top-anchored 4:3 / 1200×900 crop of `img.portrait`).

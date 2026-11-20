#!/usr/bin/env node
/**
 * Compliance gate for the build output (wiretap/CIPA posture):
 * the shipped site must reference NO ad/analytics/session-replay/chat/recaptcha
 * endpoints. Runs after `vite build`; fails CI on any hit.
 *
 * Allowlist of third-party domains the site may reference in source/comments
 * (simplepractice.com is runtime-gated on click; psychologytoday.com is a
 * JSON-LD sameAs link only).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = process.argv[2] ?? "dist";

const DENY = [
  { pattern: /fonts\.googleapis\.com/, label: "Google Fonts stylesheet (self-host instead)" },
  { pattern: /fonts\.gstatic\.com/, label: "Google Fonts file host" },
  { pattern: /googletagmanager|gtag\(|gtag\.js/, label: "Google Tag Manager / gtag" },
  { pattern: /googleads|doubleclick\.net|\.gdoubleclick/, label: "Google Ads / DoubleClick" },
  { pattern: /connect\.facebook\.net|fbevents|fbq\(/, label: "Meta (Facebook) Pixel" },
  { pattern: /tiktok|analytics\.tiktok/, label: "TikTok Pixel" },
  { pattern: /snap\.licdn|sc\.sitecatalyst|adobedtm|omtrdc/, label: "LinkedIn / Adobe tag managers" },
  { pattern: /hotjar|clarity\.ms|posthog|fullstory|logrocket|mouseflow|crazyegg/, label: "session replay / heatmap tools" },
  { pattern: /recaptcha|captcha\.google|google\.com\/js\/gstatic/, label: "reCAPTCHA" },
  { pattern: /intercom|drift\.com|tawk\.to|crisp\.chat|zendesk|livechat|tidio/, label: "third-party chat widgets" },
  { pattern: /google-analytics|googlerecaptcha|analytics\.google/, label: "Google Analytics" },
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(html|css|js|mjs|json|txt|xml)$/.test(name)) out.push(p);
  }
  return out;
}

let failures = 0;
for (const file of walk(DIST)) {
  const text = readFileSync(file, "utf8");
  for (const { pattern, label } of DENY) {
    const m = text.match(pattern);
    if (m) {
      failures++;
      console.error(`FAIL ${relative(".", file)}: ${label} — matched ${JSON.stringify(m[0])}`);
    }
  }
}

if (failures) {
  console.error(`\ncompliance-check: ${failures} disallowed reference(s) in ${DIST}/`);
  process.exit(1);
}
console.log(`compliance-check: ${DIST}/ clean (no trackers/analytics/replay/chat/reCAPTCHA endpoints)`);

/**
 * Paper Crane Wellness logo — vectorized from the brand's original artwork
 * (papercranewellness.com) with potrace at source resolution, so the crane's
 * folded facets are straight. Both shapes inherit the surrounding text color.
 *
 * Path data is machine-generated from brand/crane-traced.svg (potrace run on
 * the 2500px source PNG); do not hand-edit the d strings. Regenerate with:
 *   potrace <crane crop>.pbm -s -o brand/crane-trace.svg
 *
 * Wordmark: crane mark + text stack (used in the header; markClass drives the
 * scroll-condense transition). CraneMark: the crane alone (footer, favicon).
 */

// potrace maps its 10x integer space with a y-flip: y -> H - 0.1*y.
const POTRACE = (h: number) => `translate(0 ${h}) scale(0.1 -0.1)`;

// Crane traced from brand/paper-crane-wellness-logo-source.png, crop
// (608,244)-(1976,1438): the six facets of the bird, no script fragments.
const CRANE_D =
  "M2481 11882 c20 -54 3526 -7812 3530 -7812 6 0 2434 4135 2443 4161 4 10 -877 553 -2975 1834 -1639 1001 -2985 1822 -2991 1824 -6 2 -9 -1 -7 -7z M1090 8866 c0 -5 4398 -5596 4424 -5623 9 -10 50 54 181 278 94 160 169 296 167 303 -7 22 -2084 4621 -2090 4628 -4 3 -599 97 -1322 208 -723 111 -1325 204 -1337 207 -13 3 -23 2 -23 -1z M8503 7850 c-1189 -2022 -4531 -7726 -4528 -7728 3 -4 5596 2336 5604 2344 3 2 -21 140 -52 307 -151 813 -958 5154 -960 5167 -2 8 -30 -32 -64 -90z M11471 6269 c-232 -551 -420 -1003 -418 -1005 5 -5 2577 53 2583 59 5 5 -1721 1939 -1735 1945 -5 1 -198 -448 -430 -999z M10427 6268 c-630 -475 -1146 -870 -1147 -878 -1 -24 472 -2564 479 -2572 3 -4 415 963 914 2149 499 1186 905 2158 903 2160 -1 2 -519 -385 -1149 -859z M90 2237 c121 -74 3536 -2190 3546 -2198 8 -7 184 285 567 938 306 522 559 956 562 966 6 15 1 17 -36 17 -24 0 -1078 70 -2342 155 -1264 85 -2310 155 -2325 155 -24 0 -21 -4 28 -33z";
const CRANE_H = 1194.0;

export function CraneMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1368 1194"
      className={className}
      role="img"
      aria-label="Paper Crane Wellness origami crane mark"
      fill="currentColor"
    >
      <g transform={POTRACE(CRANE_H)}>
        <path d={CRANE_D} />
      </g>
    </svg>
  );
}

export function Wordmark({
  className = "",
  markClass = "h-9 w-9",
}: {
  className?: string;
  markClass?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <CraneMark className={markClass} />
      <span className="flex flex-col items-center leading-none">
        <span className="display text-[1.06rem] tracking-[-0.01em]">Paper Crane</span>
        <span className="eyebrow eyebrow-bare mt-[5px] w-full text-center text-[0.5625rem] opacity-60">Wellness</span>
      </span>
    </span>
  );
}

import { useEffect, useRef, useState } from "react";

/** Decorative folded-paper geometry used in place of stock photography. */
export function PaperFold({
  className = "",
  seed = 0,
  settle = false,
}: {
  className?: string;
  seed?: number;
  /** One-shot fold-in when scrolled into view (specialty aside). */
  settle?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!settle) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [settle]);

  const sets = [
    ["M0 240 L180 0 L400 120 Z", "M180 0 L400 120 L400 400 Z", "M0 240 L400 400 L120 400 Z"],
    ["M400 0 L400 260 L120 60 Z", "M0 80 L120 60 L400 400 Z", "M0 80 L400 400 L0 400 Z"],
    ["M60 0 L400 180 L200 400 Z", "M60 0 L200 400 L0 300 Z", "M400 180 L400 400 L200 400 Z"],
  ];
  const s = sets[seed % sets.length];
  return (
    <svg
      ref={ref}
      viewBox="0 0 400 400"
      className={settle ? `${className}${live ? " fold-settle" : " opacity-0"}` : className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={s[0]} fill="currentColor" opacity="0.9" />
      <path d={s[1]} fill="currentColor" opacity="0.55" />
      <path d={s[2]} fill="currentColor" opacity="0.28" />
    </svg>
  );
}

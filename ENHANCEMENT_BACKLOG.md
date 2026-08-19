# Enhancement Backlog — Paper Crane Wellness
Generated: 2026-08-18 · Scope: enhancements beyond the strict goal-loop's in-scope fixes.
Source data: `audit-evidence/uiux/contrast.json` (391 residual failures after Group A elimination).

## G1 · Navy-alpha contrast ladder (Group C — 386 of 391 residual samples)
`--color-navy` is #1A2343; Tailwind opacity variants `text-navy/35…/65` all fall below
4.5:1 on paper (#FBFAF6) for text under 18.66px bold (many sit at 3.1–4.4:1).
Options, cheapest first:
1. Introduce an `ink` scale in index.css: `--color-ink-90: #232e52` (≈5.1:1),
   `--color-ink-70: #33406b` (≈4.6:1) and migrate `text-navy/55|60|65` body text to it.
2. Or raise the floor: no `text-navy/XX` below `/70` for body-size text; reserve
   `/35–/55` for ≥19px display text (large-text 3:1 rule) only.
3. Footer `text-navy/40` column heads + mist-toned secondary text (mist/40, mist/55):
   audit separately — these are the deliberate "quiet footer" tier; keep only if paired
   with ≥14px tracking-widest uppercase, else lift to `/55`.

## G2 · Five non-navy, non-sage residuals (specific)
- `/` `Home.tsx` modalities watermarks `01/02/03` — white/15 on navy, 44.8px/400 =
  1.6:1 (large-text fails 3:1 too). NOW `aria-hidden` (Phase 4.4) so excluded from
  a11y tree; if the brand wants them "visible to WCAG" later, raise to white/30
  (≈3.2:1 large) or drop below visual threshold intentionally.
- `/contact` "Location" / "Insurance" labels — mist-ish #C0AB9F?? (oklab .962…) on navy,
  11.2px = 2.77:1. Fix: `text-mist` → `text-mist/90`+ or `text-navy/0`→use paper-tint
  label color ≥4.5:1 (e.g. #D8DCE8 on navy ≈ 7:1).

## G3 · Borders / non-text UI (WCAG 1.4.11)
`hairline` (border-navy/8) and `border-navy/10` card borders are decorative today;
separators carrying meaning (FAQ open/close, input focus) should carry ≥3:1 or be
reinforced by a second channel (weight, spacing) — mostly satisfied already; verify
input focus rings specifically.

## G4 · Third-party
SP widget "Experimental render mode rehydrate isn't working" console errors (mobile,
both viewports) — script #19, upstream SimplePractice issue; monitor, not fixable in
site code. Prod-qa classifies these as third-party (not counted).

## Deliberately NOT changed (in-scope constraint)
- `#6b7c54` (sage) token value itself — hard-asserted at `tests/sp-widget.spec.ts:180`
  and painted by the SP-hosted CSS (`scripts/apply-widget-brand.js`). All fixes were
  made at call sites using the new `sage-deep` (#5A684A) token instead.
- Large display text (≥24px or ≥18.66px/700) left on sage — passes 3:1 large-text rule.
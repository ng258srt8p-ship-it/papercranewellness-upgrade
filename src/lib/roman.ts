const SCALE: Array<[number, string]> = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/**
 * Convert a positive integer (1–3999) to a Roman numeral: 1 -> "I", 3 -> "III".
 * Lenient input: strips everything that isn't a digit, so "01" works too.
 * Returns the trimmed input unchanged when it isn't a number in range.
 */
export function toRoman(value: number | string): string {
  const s = String(value).trim();
  const n = /^\d+$/.test(s) ? parseInt(s, 10) : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 3999) return s;
  let out = "";
  let rest = n;
  for (const [v, glyph] of SCALE) {
    while (rest >= v) {
      out += glyph;
      rest -= v;
    }
  }
  return out;
}

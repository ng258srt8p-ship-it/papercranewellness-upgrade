import { test, expect, Locator } from "@playwright/test";

/**
 * Eyebrow design QA — Paper Crane Wellness.
 *
 * Verifies the eyebrow tone system shipped in the latest redesign:
 *  - micro-type styling (11px / 500 / 0.22em tracking / uppercase)
 *  - signature leading rule via ::before on every non-bare eyebrow
 *  - centered eyebrows (.eyebrow-center) get rules on both sides
 *  - bare eyebrows (.eyebrow-bare, logo lockup) opt out of the rule
 *  - tone variants map to the palette:
 *      deep  -> text-sage-deep (#55643f)
 *      muted -> text-navy/40    (navy #24363a @ 40% alpha)
 *      light -> text-sage-soft  (#96a37f)
 *  - eyebrow presence + rule integrity across all core routes
 *
 * Runs wherever the suite runs (local preview or production via BASE_URL).
 */

const SAGE_DEEP = "#55643f"; // rgb(85, 100, 63)
const SAGE_SOFT = "#96a37f"; // rgb(150, 163, 127)

/** Read camelCase computed-style props (kebab-case getPropertyValue misses some). */
async function stylesOf(
  loc: Locator,
  pseudo: ":before" | ":after" | null = null
): Promise<Record<string, string>> {
  return loc.first().evaluate((el, p) => {
    const cs = getComputedStyle(el as HTMLElement, p);
    return {
      content: cs.content,
      width: cs.width,
      height: cs.height,
      display: cs.display,
      opacity: cs.opacity,
      backgroundColor: cs.backgroundColor,
      marginRight: cs.marginRight,
      marginLeft: cs.marginLeft,
      color: cs.color,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      textTransform: cs.textTransform,
    } as Record<string, string>;
  }, pseudo);
}

function parseColor(value: string): { r: number; g: number; b: number; a: number } {
  const v = value.replace(/\s+/g, "").toLowerCase();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length === 4) h = h.slice(0, 3) + h[3] + h[3];
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1;
    return { r, g, b, a };
  }
  const m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(",").map((x) => parseFloat(x));
    const r = Number.isNaN(p[0]) ? NaN : p[0];
    const g = Number.isNaN(p[1]) ? NaN : p[1];
    const b = Number.isNaN(p[2]) ? NaN : p[2];
    const a = p.length < 4 || Number.isNaN(p[3]) ? 1 : p[3];
    return { r, g, b, a };
  }
  return { r: NaN, g: NaN, b: NaN, a: NaN };
}

function colorMatches(actual: string, expected: string, tol = 3): boolean {
  const a = parseColor(actual);
  const e = parseColor(expected);
  if ([a.r, a.g, a.b, a.a, e.r, e.g, e.b, e.a].some(Number.isNaN)) return false;
  return (
    Math.abs(a.r - e.r) <= tol &&
    Math.abs(a.g - e.g) <= tol &&
    Math.abs(a.b - e.b) <= tol &&
    Math.abs(a.a - e.a) <= 0.05
  );
}

/** Alpha of a computed color in any color space (rgb(a,b,c,α), rgba, oklab(… / α)). */
function alphaOf(color: string): number {
  const v = color.trim().toLowerCase();
  const slash = v.match(/\/\s*([0-9.]+)\s*\)?$/);
  if (slash) return parseFloat(slash[1]);
  const m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(",").map((s) => parseFloat(s));
    return Number.isNaN(p[3]) ? 1 : p[3];
  }
  return 1; // opaque rgb()/hex form
}

test.describe("Eyebrow design system", () => {
  test("base eyebrow: micro-type + signature leading rule", async ({ page }) => {
    await page.goto("/");
    const hero = page
      .locator(".eyebrow:not(.eyebrow-bare):not(.eyebrow-center)")
      .filter({ hasText: "Mount Pleasant" });
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(600);
    expect((await hero.textContent())?.trim()).toContain("Mount Pleasant");
    // hero eyebrow uses the default "deep" tone
    expect(await hero.evaluate((el) => el.className)).toContain("text-sage-deep");

    const base = await stylesOf(hero);
    expect(base.fontSize).toBe("11px"); // 0.6875rem
    expect(base.fontWeight).toBe("500");
    expect(base.letterSpacing).toBe("2.42px"); // 0.22em at 11px
    expect(base.textTransform).toBe("uppercase");
    expect(colorMatches(base.color, SAGE_DEEP)).toBeTruthy();

    const before = await stylesOf(hero, ":before");
    expect(before.content).not.toBe("none");
    expect(before.width).toBe("32px"); // 2rem signature rule
    expect(before.height).toBe("1px");
    expect(before.display).toBe("inline-block");
    expect(before.opacity).toBe("0.5");
    // rule inherits the eyebrow's own text color (resolved in computed style)
    expect(before.backgroundColor).toBe(base.color);
    expect(before.marginRight).toBe("12px");
    const after = await stylesOf(hero, ":after");
    expect(after.content).toBe("none"); // non-centered: leading rule only
  });

  test("centered eyebrows get rules on both sides", async ({ page }) => {
    await page.goto("/");
    const centered = page.locator(".eyebrow-center").filter({ hasText: "What clients say" });
    await centered.scrollIntoViewIfNeeded();
    await expect(centered).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(600);

    const before = await stylesOf(centered, ":before");
    expect(before.content).not.toBe("none");
    expect(before.width).toBe("32px");
    expect(before.height).toBe("1px");
    expect(before.marginLeft).toBe("12px");

    const after = await stylesOf(centered, ":after");
    expect(after.content).not.toBe("none");
    expect(after.width).toBe("32px");
    expect(after.height).toBe("1px");
    expect(after.display).toBe("inline-block");
    expect(after.opacity).toBe("0.5");
    // the rule inherits currentColor (a resolved rgb() in computed style)
    const base = await stylesOf(centered);
    expect(after.backgroundColor).toBe(base.color);
  });

  test("bare eyebrow (logo lockup) opts out of the rule", async ({ page }) => {
    await page.goto("/");
    const bare = page.locator(".eyebrow-bare").first();
    await expect(bare).toBeVisible({ timeout: 20_000 });
    await expect(bare).toHaveText("Wellness");
    const before = await stylesOf(bare, ":before");
    const after = await stylesOf(bare, ":after");
    expect(before.content).toBe("none");
    expect(after.content).toBe("none");
  });

  test("tone variants map to the palette classes and colors", async ({ page }) => {
    await page.goto("/contact");

    // deep — page hero eyebrow
    const deep = page.locator(".eyebrow").filter({ hasText: "Contact" }).first();
    await expect(deep).toBeVisible({ timeout: 20_000 });
    expect(await deep.evaluate((el) => el.className)).toContain("text-sage-deep");
    const deepStyle = await stylesOf(deep);
    expect(colorMatches(deepStyle.color, SAGE_DEEP)).toBeTruthy();

    // muted — footer column heading
    const muted = page.locator(".eyebrow").filter({ hasText: "Practice" }).first();
    await muted.scrollIntoViewIfNeeded();
    await expect(muted).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(600);
    expect(await muted.evaluate((el) => el.className)).toContain("text-navy/40");
    const mutedStyle = await stylesOf(muted);
    expect(Math.abs(alphaOf(mutedStyle.color) - 0.4)).toBeLessThan(0.05);
    // and the opaque navy reference it derives from is #24363a
    const ref = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.className = "text-navy";
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });
    expect(colorMatches(ref, "#24363a")).toBeTruthy();

    // light — "Preferred route" on the dark contact panel
    const light = page.locator(".eyebrow").filter({ hasText: "Preferred route" }).first();
    await light.scrollIntoViewIfNeeded();
    await expect(light).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(600);
    expect(await light.evaluate((el) => el.className)).toContain("text-sage-soft");
    const lightStyle = await stylesOf(light);
    expect(colorMatches(lightStyle.color, SAGE_SOFT)).toBeTruthy();
  });

  test("eyebrows render on every core route; every non-bare eyebrow keeps its rule", async ({ page }) => {
    const routes = ["/", "/about", "/specialties", "/faq", "/contact"];
    const distinct = new Set<string>();
    for (const route of routes) {
      const errors: string[] = [];
      const onPageError = (msg: string) => errors.push(msg);
      page.on("pageerror", onPageError);
      try {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(900);

        const info = await page
          .locator(".eyebrow")
          .evaluateAll((els) =>
            els.map((el) => ({
              text: (el.textContent ?? "").trim(),
              bare: el.classList.contains("eyebrow-bare"),
              ruleContent: getComputedStyle(el, ":before").content,
              ruleWidth: getComputedStyle(el, ":before").width,
            }))
          );
        expect(info.length, `${info.length} eyebrows on ${route}`).toBeGreaterThan(0);
        for (const e of info) {
          if (e.text) distinct.add(`${route}::${e.text}`);
          if (!e.bare) {
            expect(e.ruleContent, `rule on ${route} :: "${e.text}"`).not.toBe("none");
            expect(e.ruleWidth, `rule width on ${route} :: "${e.text}"`).toBe("32px");
          }
        }
        const siteErrors = errors.filter((e) => !/clientsecure\.me|spwidget/i.test(e));
        expect(siteErrors, `site-origin errors on ${route}: ${siteErrors.join(" | ")}`).toEqual([]);
      } finally {
        page.off("pageerror", onPageError);
      }
    }
    expect(distinct.size, `distinct eyebrows across routes: ${[...distinct].join(", ")}`).toBeGreaterThanOrEqual(6);
  });
});

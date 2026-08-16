import { test, expect, Page } from "@playwright/test";

/**
 * SimplePractice widget QA — Paper Crane Wellness redesign.
 *
 * Verifies the production SP integration (scope ef573a05-...) end to end:
 * hidden autobind anchors, modal open/close from every CTA, brand styling,
 * scroll-state restoration, and mobile behavior. Runs against the live SP
 * production widget (network required).
 */

const SP_SCOPE_ID = "ef573a05-79ef-46ab-9b18-d5c65a183d97";
const SP_APP_ID = "7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b";
const BOOKING_URL = "https://papercranewellness.clientsecure.me";

/** Wait for the deferred SP script to register its autobind function. */
async function waitForSp(page: Page) {
  await page.waitForFunction(
    () => typeof (window as any).spWidgetAutoBind === "function",
    null,
    { timeout: 15_000 }
  );
}

/**
 * Close the SP modal. SP's close affordances are verified at runtime:
 * backdrop click first, then Escape; finally assert the overlay is gone.
 */
async function closeModal(page: Page) {
  const overlay = page.locator(".spwidget--overlay").first();
  await overlay.click({ position: { x: 3, y: 3 }, force: true }).catch(() => {});
  if (await overlay.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
  }
  await expect(overlay).not.toBeVisible({ timeout: 10_000 });
}

/** Body scroll-related state, used to assert clean scroll-restore. */
async function bodyScrollState(page: Page) {
  return page.evaluate(() => ({
    cls: document.body.className,
    top: document.body.style.top,
    overflow: getComputedStyle(document.body).overflow,
  }));
}

/**
 * Instrument the page for SITE-code errors only.
 *
 * SP preloads a cross-origin clientsecure.me iframe (Ember app) whose console
 * noise (404s, fastboot warnings, storage-permission denials) bubbles up to
 * the page console. We therefore:
 *  - keep only console errors whose source URL is our origin, and
 *  - capture runtime errors only in the top window (via an init script).
 */
async function collectSiteErrors(page: Page) {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const current = page.url();
    if (!current || current === "about:blank") return;
    const origin = new URL(current).origin;
    if (msg.location().url.startsWith(origin)) {
      consoleErrors.push(msg.text());
    }
  });
  await page.addInitScript(() => {
    (window as any).__siteErrors = [];
    window.addEventListener("error", (e: ErrorEvent) => {
      if (window === window.top) {
        (window as any).__siteErrors.push(String(e.message || e.error || "uncaught error"));
      }
    });
  });
  return async (): Promise<string[]> => {
    const runtime = await page
      .evaluate(() => ((window as any).__siteErrors as string[]) ?? [])
      .catch(() => [] as string[]);
    return [...consoleErrors, ...runtime];
  };
}

/* =====================================================================
 * Widget host
 * ===================================================================== */
test.describe("Widget host", () => {
  test("hidden host contains both SP widget anchors with exact production attributes", async ({ page }) => {
    await page.goto("/");
    await waitForSp(page);

    const oar = page.locator('#sp-widget-host a.spwidget-button[data-spwidget-type="OAR"]');
    const contact = page.locator('#sp-widget-host a.spwidget-button[data-spwidget-type="Contact form"]');

    await expect(oar).toHaveCount(1);
    await expect(contact).toHaveCount(1);

    for (const [anchor, text] of [
      [oar, "Request Appointment"],
      [contact, "Contact"],
    ] as const) {
      await expect(anchor).toHaveText(text);
      await expect(anchor).toHaveAttribute("data-spwidget-scope-id", SP_SCOPE_ID);
      await expect(anchor).toHaveAttribute("data-spwidget-scope-uri", "papercranewellness");
      await expect(anchor).toHaveAttribute("data-spwidget-application-id", SP_APP_ID);
      await expect(anchor).toHaveAttribute("href", BOOKING_URL);
    }
    // channel + contact flag are Contact-widget-specific attributes
    await expect(contact).toHaveAttribute("data-spwidget-channel", "embedded_widget");
    await expect(contact).toHaveAttribute("data-spwidget-contact", "");

    // Host is visually hidden but present in the DOM.
    const display = await page.locator("#sp-widget-host").evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("none");
  });

  test("SP script does not produce console errors or page errors in site code", async ({ page }) => {
    const getErrors = await collectSiteErrors(page);
    await page.goto("/");
    await waitForSp(page);
    await page.waitForTimeout(1500); // allow any async noise to surface
    expect(await getErrors()).toEqual([]);
  });
});

/* =====================================================================
 * Booking modal — desktop
 * ===================================================================== */
test.describe("Booking modal — desktop", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await waitForSp(page);
  });

  test("hero Book a Free Consult opens the SP modal without navigating", async ({ page }) => {
    const getErrors = await collectSiteErrors(page);
    const urlBefore = page.url();
    await page.locator('main a:has-text("Book a Free Consult")').first().click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    expect(page.url()).toBe(urlBefore);
    expect(page.url()).not.toContain("clientsecure.me");
    const iframe = page.locator(".spwidget--scroller iframe, .spwidget--overlay iframe").first();
    await expect(iframe).toBeVisible({ timeout: 10_000 });
    expect(await getErrors()).toEqual([]);
    await closeModal(page);
  });

  test("nav Free Consult pill opens the modal", async ({ page }) => {
    await page.locator('header a:has-text("Free Consult")').first().click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    await closeModal(page);
  });

  test("footer Book button opens the modal", async ({ page }) => {
    await page.locator('footer a:has-text("Book a Free Consultation")').scrollIntoViewIfNeeded();
    await page.locator('footer a:has-text("Book a Free Consultation")').click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    await closeModal(page);
  });
});

/* =====================================================================
 * Contact page
 * ===================================================================== */
test.describe("Contact page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#/contact");
    await waitForSp(page);
  });

  test("contact page shows the brand-styled SP Contact button", async ({ page }) => {
    // Scope to #root: the hidden widget host outside #root matches the same selector.
    const btn = page.locator('#root a.spwidget-button[data-spwidget-type="Contact form"]');
    await expect(btn).toBeVisible();
    const styles = await btn.evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, radius: s.borderRadius, padding: s.padding, color: s.color };
    });
    expect(styles.bg).toBe("rgb(107, 124, 84)"); // sage #6B7C54
    expect(styles.radius).toBe("999px"); // pill (brand CSS: 999px)
    expect(styles.padding).toBe("14px 28px");
    expect(styles.color).toBe("rgb(255, 255, 255)");
  });

  test("Contact button opens the SP contact modal", async ({ page }) => {
    const getErrors = await collectSiteErrors(page);
    const urlBefore = page.url();
    await page.locator('#root a.spwidget-button[data-spwidget-type="Contact form"]').click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    expect(page.url()).toBe(urlBefore);
    expect(await getErrors()).toEqual([]);
    await closeModal(page);
  });

  test("contact page BookingCard CTA opens the modal", async ({ page }) => {
    await page.locator('a:has-text("Book Free 15-Minute Consultation")').click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    await closeModal(page);
  });
});

/* =====================================================================
 * Modal lifecycle
 * ===================================================================== */
test.describe("Modal lifecycle", () => {
  test("modal close restores scroll state (clean close)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await waitForSp(page);

    const before = await bodyScrollState(page);
    await page.locator('main a:has-text("Book a Free Consult")').first().click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });

    await closeModal(page);

    const after = await bodyScrollState(page);
    expect(after).toEqual(before);
  });

  test("modal can be reopened after closing", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await waitForSp(page);

    await page.locator('main a:has-text("Book a Free Consult")').first().click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    await closeModal(page);

    await page.locator('main a:has-text("Book a Free Consult")').first().click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    await closeModal(page);
  });
});

/* =====================================================================
 * Mobile (375x812)
 * ===================================================================== */
test.describe("Mobile (375x812)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("drawer booking button opens the modal", async ({ page }) => {
    await page.goto("/");
    await waitForSp(page);

    await page.locator('button[aria-label*="menu" i]').first().click();
    const urlBefore = page.url();
    await page.locator('a:has-text("Book a Free Consultation")').first().click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    expect(page.url()).toBe(urlBefore);
    await closeModal(page);
  });

  test("modal close restores scroll state on mobile", async ({ page }) => {
    await page.goto("/");
    await waitForSp(page);

    const before = await bodyScrollState(page);
    await page.locator('main a:has-text("Book a Free Consult")').first().click();
    await expect(page.locator(".spwidget--overlay")).toBeVisible({ timeout: 20_000 });
    await closeModal(page);

    const after = await bodyScrollState(page);
    expect(after).toEqual(before);
  });
});

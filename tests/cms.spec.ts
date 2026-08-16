import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * CMS (Cloudflare Worker + D1) QA — Paper Crane Wellness.
 *
 * Verifies the public API, the SPA's CMS-driven rendering (announcement bar,
 * FAQ, contact details), and the token-protected admin round-trip (edit →
 * save → live on the site → restore). API tests run wherever the suite runs;
 * the admin write test is skipped unless a token is available
 * (CMS_TEST_TOKEN env or the local, untracked .env.cms file).
 */

const CMS_API =
  process.env.CMS_API_URL || "https://papercrane-cms.vqh9mnrdbp.workers.dev";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function readLocalToken(): string | null {
  try {
    const text = fs.readFileSync(path.join(REPO_ROOT, ".env.cms"), "utf8");
    const line = text
      .split("\n")
      .find((l) => l.startsWith("CMS_ADMIN_TOKEN="));
    return line ? line.slice("CMS_ADMIN_TOKEN=".length).trim() : null;
  } catch {
    return null;
  }
}

const ADMIN_TOKEN = process.env.CMS_TEST_TOKEN || readLocalToken() || null;

let cmsUp = true;

test.beforeAll(async () => {
  try {
    const res = await fetch(`${CMS_API}/api/health`, { signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as { ok?: boolean };
    cmsUp = res.ok && data.ok === true;
  } catch {
    cmsUp = false;
  }
});

test("API: health responds ok", async () => {
  test.skip(!cmsUp, "CMS API unreachable");
  const res = await fetch(`${CMS_API}/api/health`);
  expect(res.status).toBe(200);
  const data = (await res.json()) as { ok: boolean; service: string };
  expect(data.ok).toBe(true);
  expect(data.service).toBe("papercrane-cms");
});

test("API: public content list + faq entry", async () => {
  test.skip(!cmsUp, "CMS API unreachable");
  const listRes = await fetch(`${CMS_API}/api/content`);
  expect(listRes.status).toBe(200);
  const list = (await listRes.json()) as { slug: string }[];
  expect(list.map((e) => e.slug).sort()).toEqual(["announcement", "contact", "faq"]);

  const faqRes = await fetch(`${CMS_API}/api/content/faq`);
  expect(faqRes.status).toBe(200);
  const faq = (await faqRes.json()) as { body: { items: { q: string; a: string }[] } };
  expect(Array.isArray(faq.body.items)).toBe(true);
  expect(faq.body.items.length).toBeGreaterThan(0);
  for (const item of faq.body.items) {
    expect(typeof item.q).toBe("string");
    expect(typeof item.a).toBe("string");
  }
});

test("API: missing slug → 404; admin write without token → 401", async () => {
  test.skip(!cmsUp, "CMS API unreachable");
  const missing = await fetch(`${CMS_API}/api/content/definitely-not-a-slug`);
  expect(missing.status).toBe(404);

  const put = await fetch(`${CMS_API}/api/admin/content/announcement`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "x", body: {} }),
  });
  expect(put.status).toBe(401);
});

test("SPA: home announcement bar follows the CMS value", async ({ page }) => {
  test.skip(!cmsUp, "CMS API unreachable");
  const ann = (await (
    await fetch(`${CMS_API}/api/content/announcement`)
  ).json()) as { body: { text: string } };
  await page.goto("/");
  const bar = page.locator("div.bg-navy");
  if (ann.body.text.trim()) {
    // Non-empty text → the bar renders with that text.
    await expect(bar.first()).toBeVisible({ timeout: 10_000 });
    await expect(bar.first()).toContainText(ann.body.text);
  } else {
    // Empty text → the bar is hidden (the site ships with it disabled).
    await expect(bar.first()).toHaveCount(0);
  }
});

test("SPA: FAQ page renders the CMS-managed questions", async ({ page }) => {
  test.skip(!cmsUp, "CMS API unreachable");
  const faq = (await (await fetch(`${CMS_API}/api/content/faq`)).json()) as {
    body: { items: { q: string }[] };
  };
  await page.goto("/#/faq");
  for (const item of faq.body.items) {
    await expect(page.getByText(item.q, { exact: true }).first()).toBeAttached({
      timeout: 10_000,
    });
  }
});

test("SPA: contact page shows the CMS-managed email", async ({ page }) => {
  test.skip(!cmsUp, "CMS API unreachable");
  const contact = (await (await fetch(`${CMS_API}/api/content/contact`)).json()) as {
    body: { email: string };
  };
  await page.goto("/#/contact");
  await expect(
    page.locator(`a[href="mailto:${contact.body.email}"]`).first()
  ).toBeAttached({ timeout: 10_000 });
});

test("SPA: /admin renders without a token", async ({ page }) => {
  test.skip(!cmsUp, "CMS API unreachable");
  await page.goto("/#/admin");
  await expect(page.getByRole("heading", { name: /edit site content/i })).toBeAttached();
  await expect(
    page.getByPlaceholder("Paste CMS admin token")
  ).toBeAttached();
});

test("Admin: full edit → live → restore round trip", async ({ page }) => {
  test.skip(!cmsUp, "CMS API unreachable");
  test.skip(!ADMIN_TOKEN, "no admin token available (CMS_TEST_TOKEN / .env.cms)");

  const original = (await (await fetch(`${CMS_API}/api/content/announcement`)).json()) as {
    body: { text: string };
  };
  const originalText = original.body.text;
  const marker = ` [cms-test ${Date.now()}]`;
  const modified = originalText + marker;

  try {
    await page.goto("/#/admin");
    await page.getByPlaceholder("Paste CMS admin token").fill(ADMIN_TOKEN);
    await page.getByRole("button", { name: /load content/i }).click();
    await expect(page.getByText(/loaded \d+ entr/i)).toBeVisible({ timeout: 15_000 });

    const card = page.locator('[data-cms-entry="announcement"]').first();
    const textarea = card.locator("textarea").first();
    const parsed = JSON.parse((await textarea.inputValue()) as string) as { text: string };
    parsed.text = modified;
    await textarea.fill(JSON.stringify(parsed, null, 2));
    await card.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/saved "announcement"/i)).toBeVisible({ timeout: 15_000 });

    // the edit is live on the site (fresh page → fresh fetch)
    const site = page;
    await site.goto("/#/");
    await expect(site.locator("div.bg-navy").getByText(modified).first()).toBeVisible({
      timeout: 10_000,
    });
  } finally {
    // always restore the original announcement, even on failure
    const res = await fetch(`${CMS_API}/api/admin/content/announcement`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ title: "Site announcement", body: original.body }),
    });
    expect(res.status).toBe(200);
    const check = (await (await fetch(`${CMS_API}/api/content/announcement`)).json()) as {
      body: { text: string };
    };
    expect(check.body.text).toBe(originalText);
  }
});

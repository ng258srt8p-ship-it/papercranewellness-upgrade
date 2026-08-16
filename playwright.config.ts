import { defineConfig } from "@playwright/test";

// Production runs: BASE_URL=https://papercranewellness.pages.dev npx playwright test
const BASE_URL = process.env.BASE_URL || "http://localhost:4173";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 1,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },
  // Local preview server only for the local default; production runs need none.
  ...(process.env.BASE_URL
    ? {}
    : {
        webServer: {
          command: "npm run preview -- --port 4173 --strictPort",
          url: "http://localhost:4173",
          reuseExistingServer: true,
          timeout: 30_000,
        },
      }),
});

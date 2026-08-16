// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.1 }
  },
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'spwidget-button-styles',
      testMatch: /.*buttons\.spec\.js/
    },
    {
      name: 'contact-page-fixes',
      testMatch: /.*contact-page-fixes\.spec\.js/
    }
  ]
});

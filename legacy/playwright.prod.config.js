const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests', timeout: 60000, retries: 0,
  use: { headless: true, ignoreHTTPSErrors: true, screenshot: 'only-on-failure' },
  projects: [{ name: 'prod', testMatch: /.*production-verify\.spec\.js/ }],
});

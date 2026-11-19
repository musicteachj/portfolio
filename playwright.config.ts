import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4317' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Only the tests tagged @cross-browser run here; chromium runs everything.
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grep: /@cross-browser/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, grep: /@cross-browser/ },
  ],
  webServer: {
    command: 'node scripts/serve-static.mjs .output/public 4317',
    url: 'http://localhost:4317',
    reuseExistingServer: !process.env.CI,
  },
})

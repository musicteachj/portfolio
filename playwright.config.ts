import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4317' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/serve-static.mjs .output/public 4317',
    url: 'http://localhost:4317',
    reuseExistingServer: !process.env.CI,
  },
})

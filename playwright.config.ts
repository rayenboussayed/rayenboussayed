import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:4180',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview -- --port 4180',
    port: 4180,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'unit', include: ['src/**/*.unit.test.ts'] } },
      { test: { name: 'integration', include: ['src/**/*.integration.test.tsx'] } },
    ],
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})

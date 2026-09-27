import type { Page } from '@playwright/test'

// Shared helpers for the e2e tier (REQUIREMENTS v13).
// No playwright.config.ts yet (owner-created): specs use absolute preview
// URLs and write artifacts explicitly under bundle/.
// BASE matches the required preview webServer port (REQUIREMENTS v15 §15).

export const BASE = 'http://127.0.0.1:4180'

/** Collect console messages + page errors for artifact dump + failure triage. */
export function captureLogs(page: Page) {
  const messages: Array<{ type: string; text: string }> = []
  const errors: string[] = []
  page.on('console', (m) => messages.push({ type: m.type(), text: m.text() }))
  page.on('pageerror', (e) => errors.push(String(e)))
  return { messages, errors }
}

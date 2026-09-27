import { test, expect } from '@playwright/test'
import { BASE, captureLogs } from './helpers'

// Scroll replay (v9 §8: once:false, amount:0.2 — replay both directions).
// English-only site: no language persistence to verify on reload.
test('scroll down+up replays without errors', async ({ page }) => {
  const { errors } = captureLogs(page)
  await page.goto(BASE, { waitUntil: 'load' })

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(800)
  await expect(page.getByRole('heading', { name: /Skills|skills/ }).first()).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(800)
  await expect(page.locator('#hero')).toBeVisible()
  expect(errors).toEqual([])
})

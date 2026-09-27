import { test, expect } from '@playwright/test'
import { BASE } from './helpers'

// Reduced motion: static gradient, zero WebGL (spec §9 wrapper contract).
test.use({ reducedMotion: 'reduce' })

test('reduced motion renders no canvas', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'load' })
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('#hero')).toBeVisible()
})

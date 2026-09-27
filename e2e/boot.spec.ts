import { test, expect } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { BASE, captureLogs } from './helpers'

// BUNDLE Flow 1: cold boot is English-only — no worker, no model bytes.
test('boot: English, one canvas, zero worker/ONNX traffic', async ({ page }) => {
  const { messages, errors } = captureLogs(page)
  const liveRequests: string[] = []
  page.on('request', (r) => {
    const url = r.url()
    if (url.includes('worker') || url.includes('.onnx') || url.includes('huggingface')) {
      liveRequests.push(url)
    }
  })

  await page.goto(BASE, { waitUntil: 'load' })
  await expect(page.getByRole('heading', { name: /Skills|skills/ }).first()).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(1)
  expect(liveRequests).toEqual([])
  expect(errors).toEqual([])

  await page.screenshot({ path: 'bundle/e2e-boot.png' })
  writeFileSync('bundle/e2e-boot-console.json', JSON.stringify({ messages, errors }, null, 2))
})

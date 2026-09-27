import { test, expect } from '@playwright/test'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { BASE, captureLogs } from './helpers'

// PWA installable minimum (REQUIREMENTS v14 §14, v15 §15).
// Runs against `vite preview` (port :4180) of the PWA build — never file://.

test('pwa: build emits sw.js + manifest.webmanifest', () => {
  expect(existsSync('dist/sw.js')).toBe(true)
  expect(existsSync('dist/manifest.webmanifest')).toBe(true)
  const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8')) as {
    name: string
    theme_color: string
    icons: Array<{ src: string; sizes: string }>
  }
  expect(manifest.name).toContain('RYNBSD')
  expect(manifest.theme_color).toBe('#7B61FF')
  expect(manifest.icons.some((i) => i.sizes === '192x192')).toBe(true)
  expect(manifest.icons.some((i) => i.sizes === '512x512')).toBe(true)
})

test('pwa: SW registers, manifest 200, offline reload serves fallback', async ({
  page,
  context,
}) => {
  const { messages, errors } = captureLogs(page)

  await page.goto(BASE, { waitUntil: 'load' })
  await expect(page.getByRole('heading', { name: /Skills|skills/ }).first()).toBeVisible()

  // Service worker registered and controlling the page (autoUpdate: silent).
  const registration = await page.evaluate(() =>
    navigator.serviceWorker.getRegistration().then((r) => r?.scope ?? null),
  )
  expect(registration).toContain('127.0.0.1:4180')

  // Web manifest served with entries matching index.html.
  const manifestResponse = await page.request.get(`${BASE}/manifest.webmanifest`)
  expect(manifestResponse.status()).toBe(200)
  const themeColor = await page.getAttribute('meta[name="theme-color"]', 'content')
  expect(themeColor).toBe('#7B61FF')

  // Offline reload serves the cached app shell (navigateFallback), no errors.
  await context.setOffline(true)
  await page.reload({ waitUntil: 'load' })
  await expect(page.getByRole('heading', { name: /Skills|skills/ }).first()).toBeVisible()
  expect(errors).toEqual([])
  await context.setOffline(false)

  await page.screenshot({ path: 'bundle/e2e-pwa.png' })
  writeFileSync('bundle/e2e-pwa-console.json', JSON.stringify({ messages, errors }, null, 2))
})

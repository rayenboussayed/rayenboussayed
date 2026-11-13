import { expect, test, type Page, type BrowserContext } from '@playwright/test'
import { BASE, captureLogs } from './helpers'

/**
 * End-to-end coverage for the multi-layer translation fallback chain.
 *
 * Service workers are blocked so the production SW cannot mask routes.
 * All specs run with an isolated browser context (fresh localStorage and
 * IndexedDB), so every test starts from an untranslated page.
 */

test.use({ serviceWorkers: 'block' })

const REMOTE_PATTERN = /translate\.googleapis\.com|mozhi\.|projectsegfau|mymemory/
const MODEL_PATTERN = /huggingface\.co|cdn-lfs|xet-bridge|bergamot\.s3\.amazonaws/

const injectChromeAvailable = async (page: Page) => {
  await page.addInitScript(() => {
    class FakeTranslator {
      static async availability() {
        return 'available'
      }
      static async create() {
        return {
          translate: async (text: string) => `FR:${text}`,
          destroy() {},
        }
      }
    }
    Object.defineProperty(window, 'Translator', { value: FakeTranslator, configurable: true })
  })
}

const injectChromeUnavailable = async (page: Page) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'Translator', { value: undefined, configurable: true })
  })
}

/** Fulfill every remote tier with positionally-correct fake translations. */
const stubRemotes = async (context: BrowserContext) => {
  await context.route(REMOTE_PATTERN, async (route) => {
    const request = route.request()
    const url = request.url()
    const cors = { 'access-control-allow-origin': '*' }
    if (url.includes('googleapis')) {
      const params = new URLSearchParams(request.postData() ?? '')
      const q = params.getAll('q')
      return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(q.map((text) => `FR:${text}`)) })
    }
    if (url.includes('mozhi')) {
      const params = new URLSearchParams(request.postData() ?? '')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: cors,
        body: JSON.stringify({ 'translated-text': `FR:${params.get('text') ?? ''}` }),
      })
    }
    if (url.includes('mymemory')) {
      const q = new URL(url).searchParams.get('q') ?? ''
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: cors,
        body: JSON.stringify({ responseData: { translatedText: `FR:${q}` }, responseStatus: 200, quotaFinished: false }),
      })
    }
    return route.fulfill({ status: 500, headers: cors, body: 'unsupported fake tier' })
  })
}

test('chrome: zero model/remote traffic when Translator is available', async ({ page, context }) => {
  const { errors } = captureLogs(page)
  const hits: string[] = []
  await context.route(REMOTE_PATTERN, (route) => {
    hits.push(route.request().url())
    return route.fulfill({ status: 500, body: 'must not be called' })
  })
  await context.route(MODEL_PATTERN, (route) => {
    hits.push(route.request().url())
    return route.abort()
  })
  await injectChromeAvailable(page)
  await page.goto(BASE, { waitUntil: 'load' })
  await page.selectOption('select[aria-label="Language"]', 'fr')
  await expect(page.locator('nav a', { hasText: 'FR:Skills' }).first()).toBeVisible({ timeout: 15_000 })
  expect(hits).toEqual([])
  expect(errors).toEqual([])
})

test('remote: free tiers serve when chrome is absent and bergamot is unreachable', async ({ page, context }) => {
  const { errors } = captureLogs(page)
  await injectChromeUnavailable(page)
  await context.route(MODEL_PATTERN, (route) => route.abort())
  await stubRemotes(context)
  await page.goto(BASE, { waitUntil: 'load' })
  await page.selectOption('select[aria-label="Language"]', 'fr')
  await expect(page.locator('nav a', { hasText: 'FR:Skills' }).first()).toBeVisible({ timeout: 20_000 })
  expect(errors).toEqual([])
})

test('exhausted chain: English retained with zero uncaught errors', async ({ page, context }) => {
  const { errors } = captureLogs(page)
  await injectChromeUnavailable(page)
  await context.route(REMOTE_PATTERN, (route) => route.abort())
  await context.route(MODEL_PATTERN, (route) => route.abort())
  await page.goto(BASE, { waitUntil: 'load' })
  await page.selectOption('select[aria-label="Language"]', 'fr')
  await expect(page.getByRole('heading', { name: /Skills/i }).first()).toBeVisible({ timeout: 20_000 })
  expect(errors).toEqual([])
})

test('cached translation reloads without any translation network traffic', async ({ page, context }) => {
  await injectChromeAvailable(page)
  await page.goto(BASE, { waitUntil: 'load' })
  await page.selectOption('select[aria-label="Language"]', 'fr')
  await expect(page.locator('nav a', { hasText: 'FR:Skills' }).first()).toBeVisible({ timeout: 15_000 })

  const hits: string[] = []
  await context.route(REMOTE_PATTERN, (route) => {
    hits.push(route.request().url())
    return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, body: '[]' })
  })
  await context.route(MODEL_PATTERN, (route) => {
    hits.push(route.request().url())
    return route.abort()
  })
  await page.reload({ waitUntil: 'load' })
  await expect(page.locator('nav a', { hasText: 'FR:Skills' }).first()).toBeVisible({ timeout: 15_000 })
  expect(hits).toEqual([])
})

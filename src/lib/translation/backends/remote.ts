/**
 * Remote free-tier backends — used only when the on-device paths (Chrome
 * Translator, bergamot) are unavailable or fail. Every endpoint here is keyless
 * and anonymous, verified to answer browser CORS requests with `ACAO: *`.
 *
 * Privacy: only this site's own public copy (~3 KB of static marketing text,
 * never user input) is transmitted — no credentials, no cookies, no accounts.
 * If you are uncomfortable with that, remove the remote tiers; the chain will
 * degrade to on-device translation and then English.
 *
 * Proven properties (verified 2026-11 with curl):
 *  - Google `translate_a/t?client=dict-chrome-ex` — NOT `client=gtx` (429 from
 *    datacenter IPs). GET or form-encoded POST (simple request, no preflight).
 *    Response is a flat string array aligned to repeated `q` params (in order).
 *    The commonly cited `single?client=gtx` endpoint is deliberately unused.
 *  - Mozhi (open-source Google relay): `POST /api/translate`, form-encoded.
 *    Response JSON carries `"translated-text"` (hyphen, easy to miss). Empty
 *    string signals failure — treated as a failed string, never as success.
 *  - MyMemory: GET only, ≤500 bytes per request, anonymous quota 5000 chars/day.
 *    Returns HTTP 200 with `responseStatus` as int or string and `quotaFinished`
 *    — both must be checked. Budget: ~1–2 pages of this site per day per IP;
 *    this tier is the last resort before English.
 *
 * Timeouts are 8 s per request (MyMemory 10 s); there is no retry — a failure
 * simply advances the chain. Circuit breakers in `chain.ts` keep a dead host
 * from being hit repeatedly within a session.
 */

import type { TranslationBackend } from '../chain'

const GOOGLE_URL = 'https://translate.googleapis.com/translate_a/t'
const GOOGLE_BATCH = 20 // strings per POST; comfortably inside its tested capacity
const MOZHI_ENDPOINTS = [
  'https://mozhi.aryak.me/api/translate',
  'https://translate.projectsegfau.lt/api/translate',
] as const
const MOZHI_BATCH_CONCURRENCY = 5
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'
const MYMEMORY_MAX_BYTES = 450 // stay under the 500-byte request limit
const MYMEMORY_CONCURRENCY = 4

class IntegrityFailure extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IntegrityFailure'
  }
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number): Promise<unknown> {
  const response = await fetch(url, {
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const type = response.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) throw new IntegrityFailure('non-JSON response')
  return response.json() as Promise<unknown>
}

const postForm = (url: string, fields: URLSearchParams): Promise<unknown> =>
  fetchJson(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: fields,
  }, 8000)

const getJson = (url: string, timeoutMs: number): Promise<unknown> =>
  fetchJson(url, { method: 'GET' }, timeoutMs)

/** Exact-length validation: a misaligned batch would silently bind translations to the wrong source strings. */
function asStringArray(value: unknown, expectedLength: number): (string | null)[] {
  if (!Array.isArray(value)) throw new IntegrityFailure('response is not an array')
  if (value.length !== expectedLength) {
    throw new IntegrityFailure(`expected ${expectedLength} results, got ${value.length}`)
  }
  return value.map((element: unknown) =>
    typeof element === 'string' && element.length > 0 ? element : null,
  )
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R | null>,
  wallMs: number,
): Promise<(R | null)[]> {
  const deadline = Date.now() + wallMs
  const results: (R | null)[] = new Array(items.length).fill(null)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = cursor
      cursor += 1
      if (index >= items.length || Date.now() > deadline) break
      results[index] = await fn(items[index]!, index)
    }
  })
  await Promise.all(workers)
  return results
}

/**
 * Per-string remote backends fail silently one string at a time. When the
 * majority of a batch comes back empty (dead host, rate limit), report the
 * whole backend as failed so the chain's circuit breaker opens and future
 * runs skip it immediately.
 */
function isFailedMajority(results: readonly (string | null)[]): boolean {
  if (results.length < 3) return false
  const failed = results.filter((value) => value === null).length
  return failed * 2 > results.length
}

const encoder = new TextEncoder()

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

function createGoogleBackend(): TranslationBackend {
  return {
    id: 'remote-google',
    isAvailable: () => Promise.resolve(true),
    async translate(texts, targetLang) {
      const batches = chunk(texts, GOOGLE_BATCH)
      const results: (string | null)[] = []
      for (const batch of batches) {
        const fields = new URLSearchParams({ client: 'dict-chrome-ex', sl: 'en', tl: targetLang })
        for (const text of batch) fields.append('q', text)
        const data = await postForm(GOOGLE_URL, fields)
        results.push(...asStringArray(data, batch.length))
      }
      return results
    },
  }
}

function createMozhiBackend(host: string, index: number): TranslationBackend {
  return {
    id: `remote-mozhi-${index}`,
    isAvailable: () => Promise.resolve(true),
    async translate(texts, targetLang) {
      const results = await mapWithConcurrency(
        texts,
        MOZHI_BATCH_CONCURRENCY,
        async (text) => {
          try {
            const fields = new URLSearchParams({
              engine: 'google',
              from: 'en',
              to: targetLang,
              text,
            })
            const data = (await postForm(host, fields)) as { 'translated-text'?: unknown }
            const translated = data['translated-text']
            return typeof translated === 'string' && translated.length > 0 ? translated : null
          } catch {
            return null
          }
        },
        20_000,
      )
      if (isFailedMajority(results)) throw new Error('mozhi backend failed majority of batch')
      return results
    },
  }
}

const byteLength = (text: string): number => encoder.encode(text).length

function createMyMemoryBackend(): TranslationBackend {
  return {
    id: 'remote-mymemory',
    isAvailable: () => Promise.resolve(true),
    async translate(texts, targetLang) {
      const results = await mapWithConcurrency(
        texts,
        MYMEMORY_CONCURRENCY,
        async (text) => {
          if (byteLength(text) > MYMEMORY_MAX_BYTES) return null // exceeds the per-request limit
          try {
            const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
            const data = (await getJson(url, 10_000)) as {
              responseData?: { translatedText?: unknown }
              responseStatus?: unknown
              quotaFinished?: unknown
            }
            if (String(data.responseStatus) !== '200' || (data.quotaFinished === true || data.quotaFinished === 'true')) return null
            const translated = data.responseData?.translatedText
            return typeof translated === 'string' && translated.length > 0 ? translated : null
          } catch {
            return null
          }
        },
        20_000,
      )
      if (isFailedMajority(results)) throw new Error('mymemory backend failed majority of batch')
      return results
    },
  }
}

/** Ordered remote tiers; the chain tries them in array order. */
export function createRemoteBackends(): TranslationBackend[] {
  return [
    createGoogleBackend(),
    ...MOZHI_ENDPOINTS.map((host, i) => createMozhiBackend(host, i + 1)),
    createMyMemoryBackend(),
  ]
}

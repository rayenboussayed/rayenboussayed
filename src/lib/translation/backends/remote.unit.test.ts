/**
 * Unit tests for the remote free-tier backends' response validation.
 * `fetch` is stubbed; no network traffic happens here.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRemoteBackends } from './remote'

function stubFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(handler))
}

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    ...init,
  })

const backendById = (id: string) => {
  const backends = createRemoteBackends()
  const backend = backends.find((b) => b.id === id)
  if (!backend) throw new Error(`backend ${id} not found`)
  return backend
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('remote-google', () => {
  const backend = () => backendById('remote-google')

  it('maps the flat array response onto input order', async () => {
    stubFetch(async (_url, init) => {
      expect(String(init?.body)).toContain('client=dict-chrome-ex')
      return jsonResponse(['المنزل', 'مهارات'])
    })
    const result = await backend().translate(['Home', 'Skills'], 'ar')
    expect(result).toEqual(['المنزل', 'مهارات'])
  })

  it('yields null slots for non-string entries instead of corrupting them', async () => {
    stubFetch(async () => jsonResponse(['المنزل', 42, null]))
    const result = await backend().translate(['Home', 'Skills', 'About'], 'ar')
    expect(result).toEqual(['المنزل', null, null])
  })

  it('treats HTTP failure as batch failure (chain failover)', async () => {
    stubFetch(async () => new Response('Sorry', { status: 429 }))
    await expect(backend().translate(['Home'], 'ar')).rejects.toThrow('HTTP 429')
  })

  it('throws IntegrityFailure when Google drops or reorders q params', async () => {
    stubFetch(async () => jsonResponse(['المنزل'])) // only one result for two queries
    await expect(backend().translate(['Home', 'Skills'], 'ar')).rejects.toThrow('expected 2')
  })

  it('rejects non-JSON payloads (content-type guard)', async () => {
    stubFetch(async () => new Response('<html>oops</html>', {
      status: 200,
      headers: { 'content-type': 'text/html' },
    }))
    await expect(backend().translate(['Home'], 'ar')).rejects.toThrow('non-JSON')
  })
})

describe('remote-mozhi', () => {
  const backend = () => backendById('remote-mozhi-1')

  it('extracts translated-text (hyphenated key)', async () => {
    stubFetch(async () => jsonResponse({ 'translated-text': 'تحميل' }))
    const result = await backend().translate(['Download'], 'ar')
    expect(result).toEqual(['تحميل'])
  })

  it('treats empty translated-text as a failed string', async () => {
    stubFetch(async () => jsonResponse({ 'translated-text': '' }))
    const result = await backend().translate(['Download', 'Continue'], 'ar')
    expect(result).toEqual([null, null])
  })

  it('majority-failure in a batch throws so the breaker opens', async () => {
    stubFetch(async () => jsonResponse({ 'translated-text': '' }))
    await expect(backend().translate(['a', 'b', 'c'], 'ar')).rejects.toThrow('majority')
  })

  it('survives individual request failures without sinking the batch', async () => {
    let call = 0
    stubFetch(async () => {
      call += 1
      if (call === 2) return new Response('nope', { status: 500 })
      return jsonResponse({ 'translated-text': `ok-${call}` })
    })
    const result = await backend().translate(['one', 'two', 'three'], 'fr')
    expect(result[0]).toBe('ok-1')
    expect(result[1]).toBeNull()
    expect(result[2]).toBe('ok-3')
  })
})

describe('remote-mymemory', () => {
  const backend = () => backendById('remote-mymemory')

  it('accepts responseStatus 200 as a string or a number', async () => {
    stubFetch(async () =>
      jsonResponse({
        responseData: { translatedText: 'تنزيل' },
        responseStatus: '200',
        quotaFinished: false,
      }),
    )
    const result = await backend().translate(['Download'], 'ar')
    expect(result).toEqual(['تنزيل'])
  })

  it('rejects quota/limit error payloads carried by HTTP 200 — batch reports failure', async () => {
    stubFetch(async () =>
      jsonResponse({
        responseData: { translatedText: 'QUERY LENGTH LIMIT EXCEEDED. MAX ALLOWED QUERY : 500 CHARS' },
        responseStatus: '403',
        quotaFinished: false,
      }),
    )
    await expect(backend().translate(['Download', 'Resume', 'Today'], 'fr')).rejects.toThrow('majority')
  })

  it('rejects quotaFinished=true even on 200 with responseStatus 200 — batch reports failure', async () => {
    stubFetch(async () =>
      jsonResponse({ responseData: { translatedText: 'x' }, responseStatus: 200, quotaFinished: true }),
    )
    await expect(backend().translate(['Download', 'Resume', 'Today'], 'fr')).rejects.toThrow('majority')
  })

  it('treats the string "false" in quotaFinished as falsy', async () => {
    stubFetch(async () =>
      jsonResponse({
        responseData: { translatedText: 'Télécharger' },
        responseStatus: 200,
        quotaFinished: 'false',
      }),
    )
    const result = await backend().translate(['Download'], 'fr')
    expect(result).toEqual(['Télécharger'])
  })

  it('skips strings that exceed the 500-byte request limit', async () => {
    stubFetch(async () =>
      jsonResponse({ responseData: { translatedText: 'x' }, responseStatus: 200, quotaFinished: false }),
    )
    const result = await backend().translate(['é'.repeat(300)], 'fr') // 600 bytes
    expect(result).toEqual([null])
  })
})

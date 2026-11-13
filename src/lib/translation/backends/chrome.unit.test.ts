/**
 * Unit tests for the Chrome/Edge Translator backend. `Translator` is stubbed
 * on `globalThis`; no browser or network is involved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createChromeBackend } from './chrome'

interface FakeSession {
  translate: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
}

const fakeTranslator = (state: string, session?: FakeSession) => {
  const made: FakeSession[] = []
  const api = {
    availability: vi.fn<() => Promise<string>>(async () => state),
    create: vi.fn<() => Promise<FakeSession>>(async () => {
      const s =
        session ?? {
          translate: vi.fn<(t: string) => Promise<string>>(async (t) => `FR:${t}`),
          destroy: vi.fn<() => void>(),
        }
      made.push(s)
      return s
    }),
  }
  vi.stubGlobal('Translator', api)
  return { api, made }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('chrome backend', () => {
  it('isAvailable is false when the API is absent', async () => {
    // No stub installed this test.
    vi.stubGlobal('Translator', undefined)
    const backend = createChromeBackend()
    await expect(backend.isAvailable('fr')).resolves.toBe(false)
  })

  it('isAvailable is true for downloadable/available, false for unavailable', async () => {
    const available = fakeTranslator('available')
    const backend = createChromeBackend()
    await expect(backend.isAvailable('fr')).resolves.toBe(true)
    expect(available.api.availability).toHaveBeenCalledWith({ sourceLanguage: 'en', targetLanguage: 'fr' })
  })

  it('recognises a class-valued Translator global (browser reality)', async () => {
    class FakeTranslator {
      static async availability() {
        return 'available'
      }
      static async create() {
        return { translate: async (t: string) => `FR:${t}`, destroy() {} }
      }
    }
    vi.stubGlobal('Translator', FakeTranslator)
    const backend = createChromeBackend()
    await expect(backend.isAvailable('fr')).resolves.toBe(true)
    const result = await backend.translate(['Home'], 'fr')
    expect(result).toEqual(['FR:Home'])
  })

  it('isAvailable is false for unavailable', async () => {
    fakeTranslator('unavailable')
    const backend = createChromeBackend()
    await expect(backend.isAvailable('de')).resolves.toBe(false)
  })

  it('isAvailable is false when availability() rejects', async () => {
    vi.stubGlobal('Translator', {
      availability: vi.fn<() => Promise<string>>(async () => {
        throw new Error('boom')
      }),
    })
    const backend = createChromeBackend()
    await expect(backend.isAvailable('es')).resolves.toBe(false)
  })

  it('translate returns per-string nulls on individual failures', async () => {
    const session = {
      translate: vi.fn<(t: string) => Promise<string>>(async (t) => {
        if (t === 'bad') throw new Error('output filtered')
        return `FR:${t}`
      }),
      destroy: vi.fn<() => void>(),
    }
    fakeTranslator('available', session)
    const backend = createChromeBackend()
    const result = await backend.translate(['good', 'bad'], 'de') // fresh language — avoids singleton session reuse
    expect(result).toEqual(['FR:good', null])
  })

  it('switching languages destroys the previous session (LRU of 1)', async () => {
    const created: FakeSession[] = []
    vi.stubGlobal('Translator', {
      availability: vi.fn<() => Promise<string>>(async () => 'available'),
      create: vi.fn<() => Promise<FakeSession>>(async () => {
        const s: FakeSession = {
          translate: vi.fn<(t: string) => Promise<string>>(async (t) => `X:${t}`),
          destroy: vi.fn<() => void>(),
        }
        created.push(s)
        return s
      }),
    })
    const backend = createChromeBackend()
    await backend.translate(['one'], 'sv')
    const svSession = created[created.length - 1]!
    await backend.translate(['two'], 'ru')
    expect(created.length).toBeGreaterThanOrEqual(2)
    expect(svSession.destroy).toHaveBeenCalled()
  })
})

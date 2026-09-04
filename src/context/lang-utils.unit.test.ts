import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectInitialLang, dirFor } from './LanguageContext'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('dirFor', () => {
  it.each([
    ['en', 'ltr'],
    ['fr', 'ltr'],
    ['es', 'ltr'],
    ['ar', 'rtl'],
    ['unknown-code', 'ltr'],
  ])('%s → %s', (code, expected) => {
    expect(dirFor(code)).toBe(expected)
  })
})

describe('detectInitialLang', () => {
  it('falls back to defaultLang without a window (SSR/node)', () => {
    vi.stubGlobal('window', undefined)
    expect(detectInitialLang()).toBe('en')
  })

  it('explicit stored choice wins over the browser', () => {
    vi.stubGlobal('window', { localStorage: store({ lang: 'ar' }) })
    vi.stubGlobal('navigator', { language: 'fr-FR', languages: ['fr-FR'] })
    expect(detectInitialLang()).toBe('ar')
  })

  it('ignores a stored code that is not supported', () => {
    vi.stubGlobal('window', { localStorage: store({ lang: 'de' }) })
    vi.stubGlobal('navigator', { language: 'es-MX', languages: ['es-MX', 'es'] })
    expect(detectInitialLang()).toBe('es')
  })

  it('walks navigator.languages preference order (region → base)', () => {
    vi.stubGlobal('window', { localStorage: store({}) })
    vi.stubGlobal('navigator', { language: 'fr-CA', languages: ['fr-CA'] })
    expect(detectInitialLang()).toBe('fr')
  })

  it('returns defaultLang when nothing matches', () => {
    vi.stubGlobal('window', { localStorage: store({}) })
    vi.stubGlobal('navigator', { language: 'de-DE', languages: ['de-DE'] })
    expect(detectInitialLang()).toBe('en')
  })
})

/** Minimal localStorage stand-in (jsdom not needed for these pure lookups). */
function store(values: Record<string, string>) {
  const map = new Map(Object.entries(values))
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  }
}

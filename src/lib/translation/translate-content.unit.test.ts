import { describe, expect, it } from 'vitest'
import { translateContent } from './translate-content'

const source = {
  nav: [
    { href: '#hero', label: 'Home' },
    { href: '#skills', label: 'Skills' },
  ],
  profile: { name: 'Rayen', bio: 'I build products.' },
  meta: { id: 'keep-me', date: '2026-09-02' },
}

describe('translateContent', () => {
  it('falls back to the source string per-entry for degenerate output', async () => {
    const runaway = Array.from({ length: 100 }, () => 'البيت').join(' ')
    const translate = async (texts: string[]) =>
      texts.map((t) => {
        if (t === 'Home') return runaway // degenerate
        if (t === 'Skills') return 'Compétences'
        return t === 'I build products.' ? 'Je construis des produits.' : t
      })

    const { content: out, degraded } = await translateContent(source, translate)

    expect(out.nav[0].label).toBe('Home') // degenerate -> English fallback
    expect(out.nav[1].label).toBe('Compétences')
    expect(out.profile.bio).toBe('Je construis des produits.')
    expect(degraded).toBe(1) // only 'Home' fell back
  })

  it('never translates ids, dates, urls or proper names and keeps structure intact', async () => {
    const translate = async (texts: string[]) => texts.map((t) => `[${t}]`)
    const { content: out } = await translateContent(source, translate)

    expect(out.meta.id).toBe('keep-me')
    expect(out.meta.date).toBe('2026-09-02')
    expect(out.profile.name).toBe('Rayen') // proper name, never translated
    expect(out).not.toBe(source)
    expect(Object.keys(out)).toEqual(Object.keys(source))
  })
})

import { describe, expect, it } from 'vitest'
import { cacheKey, formatGiveUp } from './LiveTranslationContext'
import { capProgress } from '../hooks/useLiveTranslation'

describe('formatGiveUp (never "0.333 min")', () => {
  it.each([
    [0, '0 sec'],
    [999, '1 sec'],
    [1000, '1 sec'],
    [20_000, '20 sec'],
    [59_999, '60 sec'],
    [60_000, '1 min'],
    [90_000, '2 min'],
    [30 * 60_000, '30 min'],
  ])('%i ms → %s', (ms, expected) => {
    expect(formatGiveUp(ms)).toBe(expected)
  })
})

describe('cacheKey', () => {
  it('scopes source text per target flores', () => {
    expect(cacheKey('fra_Latn', 'Hello')).toBe('fra_Latn|Hello')
    expect(cacheKey('fra_Latn', 'Hello')).not.toBe(cacheKey('arb_Arab', 'Hello'))
    expect(cacheKey('fra_Latn', 'Hello')).not.toBe(cacheKey('fra_Latn', 'Bonjour'))
  })
})

describe('capProgress (display 0–100 int)', () => {
  it.each([
    [0, 0],
    [42.4, 42],
    [99.6, 100],
    [100, 100],
    [150, 100],
    [-5, 0],
  ])('%i → %i', (input, expected) => {
    expect(capProgress(input)).toBe(expected)
  })
})

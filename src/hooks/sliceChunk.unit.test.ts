import { describe, expect, it } from 'vitest'
import { sliceChunk } from './useLiveTranslation'

const t = (n: number, char = 'x') => char.repeat(n)

describe('sliceChunk (≤6 texts and ≤2000 chars per worker message)', () => {
  it('takes up to 6 short texts', () => {
    const texts = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    expect(sliceChunk(texts, 0)).toEqual([['a', 'b', 'c', 'd', 'e', 'f'], 6])
    expect(sliceChunk(texts, 6)).toEqual([['g'], 7])
  })

  it('respects the char budget before the count', () => {
    const texts = [t(900), t(900), t(900)]
    // 900+900 fits, third would exceed 2000
    expect(sliceChunk(texts, 0)).toEqual([[t(900), t(900)], 2])
  })

  it('a text exactly at budget travels with room to spare for nothing else', () => {
    expect(sliceChunk([t(2000), 'a'], 0)).toEqual([[t(2000)], 1])
  })

  it('a single over-budget text travels solo', () => {
    const texts = [t(2001), 'a']
    expect(sliceChunk(texts, 0)).toEqual([[t(2001)], 1])
    expect(sliceChunk(texts, 1)).toEqual([['a'], 2])
  })

  it('empty input yields an empty chunk and still advances', () => {
    expect(sliceChunk([], 0)).toEqual([[], 1])
  })

  it('sequential slices cover the whole batch without overlap', () => {
    const texts = [t(1500), t(1500), 'a', 'b', 'c', 'd', 'e', 'f', 'g']
    const seen: string[] = []
    let start = 0
    let guard = 0
    while (start < texts.length && guard++ < 20) {
      const [chunk, next] = sliceChunk(texts, start)
      expect(chunk.length).toBeLessThanOrEqual(6)
      expect(chunk.join('').length).toBeLessThanOrEqual(2000)
      seen.push(...chunk)
      start = next
    }
    expect(seen).toEqual(texts)
  })
})

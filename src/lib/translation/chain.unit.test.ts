/**
 * Unit tests for the translation fallback chain. All backends are fakes — the
 * suite never touches the network, workers, or wasm.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { TranslationChainService, type TranslationBackend } from './chain'
import { isAcceptableTranslation } from './guard'

const ok = (id: string): TranslationBackend => ({
  id,
  isAvailable: vi.fn<() => Promise<boolean>>(() => Promise.resolve(true)),
  translate: vi.fn<(texts: readonly string[]) => Promise<(string | null)[]>>(
    async (texts) => texts.map((t) => `${id}:${t}`),
  ),
})

const boom = (id: string): TranslationBackend => ({
  id,
  isAvailable: () => Promise.resolve(true),
  translate: vi.fn<(texts: readonly string[]) => Promise<(string | null)[]>>(
    async () => {
      throw new Error(`${id} is down`)
    },
  ),
})

const silent = (id: string): TranslationBackend => ({
  id,
  isAvailable: () => Promise.resolve(true),
  translate: vi.fn<(texts: readonly string[]) => Promise<(string | null)[]>>(
    async (texts) => texts.map(() => null),
  ),
})

const partial = (id: string): TranslationBackend => ({
  id,
  isAvailable: () => Promise.resolve(true),
  translate: vi.fn<(texts: readonly string[]) => Promise<(string | null)[]>>(
    async (texts) => texts.map((t, i) => (i % 2 === 0 ? `${id}:${t}` : null)),
  ),
})

const no = (id: string): TranslationBackend => ({
  id,
  isAvailable: () => Promise.resolve(false),
  translate: vi.fn<(texts: readonly string[]) => Promise<(string | null)[]>>(
    async (texts) => texts.map(() => null),
  ),
})

const chain = (backends: TranslationBackend[], now?: () => number) =>
  new TranslationChainService(backends, now ? { now } : undefined)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('translate fallback chain', () => {
  it('1. preserves input order across a multi-string batch', async () => {
    const result = await chain([ok('a')]).translate(['one', 'two', 'three'])
    expect(result).toEqual(['a:one', 'a:two', 'a:three'])
  })

  it('2. the first backend wins — later backends are never called', async () => {
    const second = ok('b')
    const result = await chain([ok('a'), second]).translate(['x'])
    expect(result).toEqual(['a:x'])
    expect(second.translate).not.toHaveBeenCalled()
  })

  it('3. falls through to the next backend when one throws', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await chain([boom('a'), ok('b')]).translate(['x'])
    expect(result).toEqual(['b:x'])
  })

  it('4. per-string nulls leave slots for the next backend, keeping partial success', async () => {
    const result = await chain([partial('a'), ok('b')]).translate(['one', 'two'])
    expect(result).toEqual(['a:one', 'b:two'])
  })

  it('5. degenerate candidates are rejected to English (looksDegenerate)', async () => {
    const degenerate: TranslationBackend = {
      id: 'd',
      isAvailable: () => Promise.resolve(true),
      translate: async () => ['م'],
    }
    const result = await chain([degenerate]).translate(['Skills'])
    expect(result).toEqual(['Skills'])
  })

  it('6. markup-bearing candidates are rejected (injection defense)', async () => {
    const hostile: TranslationBackend = {
      id: 'h',
      isAvailable: () => Promise.resolve(true),
      translate: async () => ['</script><script>window.pwned=1</script>'],
    }
    const result = await chain([hostile]).translate(['Software Engineer'])
    expect(result).toEqual(['Software Engineer'])
  })

  it('7. identical output passes through — brands may survive translation', async () => {
    const brand: TranslationBackend = {
      id: 'brand',
      isAvailable: () => Promise.resolve(true),
      translate: async () => ['RYNBSD'],
    }
    const result = await chain([brand]).translate(['RYNBSD'])
    expect(result).toEqual(['RYNBSD'])
  })

  it('8. a length-mismatched response is discarded and the next backend serves', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const short: TranslationBackend = {
      id: 'short',
      isAvailable: () => Promise.resolve(true),
      translate: async () => ['only-one'],
    }
    const result = await chain([short, ok('b')]).translate(['a', 'b', 'c'])
    expect(result).toEqual(['b:a', 'b:b', 'b:c'])
  })

  it('9. every backend failing ends in English — and never rejects', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const service = chain([boom('a'), boom('b')])
    const result = await service.translate(['First', 'Second'])
    expect(result).toEqual(['First', 'Second'])
  })

  it('10. an unavailable backend is skipped without calling translate', async () => {
    const unavailable = no('remote')
    const result = await chain([unavailable, ok('b')]).translate(['x'])
    expect(result).toEqual(['b:x'])
    expect(unavailable.translate).not.toHaveBeenCalled()
  })

  it('11. a throwing availability check is treated as unavailable', async () => {
    const broken: TranslationBackend = {
      id: 'broken',
      isAvailable: () => Promise.reject(new Error('probe exploded')),
      translate: vi.fn<(texts: readonly string[]) => Promise<(string | null)[]>>(
        async (texts) => texts.map(() => 'X'),
      ),
    }
    const result = await chain([broken, ok('b')]).translate(['x'])
    expect(result).toEqual(['b:x'])
    expect(broken.translate).not.toHaveBeenCalled()
  })

  it('12. circuit breaker opens after 3 consecutive failures, skipping the backend', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const flaky = boom('flaky')
    const service = chain([flaky, ok('b')])
    await service.translate(['x'])
    await service.translate(['y'])
    await service.translate(['z'])
    await service.translate(['w'])
    expect(flaky.translate).toHaveBeenCalledTimes(3)
  })

  it('13. a success resets the consecutive-failure counter', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    let calls = 0
    const flaky: TranslationBackend = {
      id: 'flaky',
      isAvailable: () => Promise.resolve(true),
      translate: vi.fn<(texts: readonly string[]) => Promise<(string | null)[]>>(
        async (texts) => {
          calls += 1
          if (calls === 2 || calls === 4) throw new Error('transient')
          return texts.map((t) => `flaky:${t}`)
        },
      ),
    }
    const service = chain([flaky])
    expect(await service.translate(['a'])).toEqual(['flaky:a'])
    expect(await service.translate(['b'])).toEqual(['b'])   // 1st failure
    expect(await service.translate(['c'])).toEqual(['flaky:c']) // success resets
    expect(await service.translate(['d'])).toEqual(['d'])   // 1st failure again
    expect(flaky.translate).toHaveBeenCalledTimes(4)
  })

  it('14. the circuit breaker re-admits the backend after the cooldown', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    let clock = 1_000_000
    const flaky = boom('flaky')
    const service = chain([flaky, ok('b')], () => clock)
    await service.translate(['x'])
    await service.translate(['x'])
    await service.translate(['x']) // breaker opens (openedAt = clock)
    clock += 61_000 // past the 60 s cooldown
    await service.translate(['x'])
    expect(flaky.translate).toHaveBeenCalledTimes(4)
  })

  it('15. all-null output still tries the next backend instead of accepting silence', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await chain([silent('a'), ok('b')]).translate(['one', 'two'])
    expect(result).toEqual(['b:one', 'b:two'])
  })

  it('16. empty input resolves without touching any backend', async () => {
    const backend = ok('a')
    const result = await chain([backend]).translate([])
    expect(result).toEqual([])
    expect(backend.translate).not.toHaveBeenCalled()
  })

  it('17. availability is probed once per language per session', async () => {
    const backend = ok('a')
    const service = chain([backend])
    await service.translate(['one'])
    await service.translate(['two'])
    expect(backend.isAvailable).toHaveBeenCalledTimes(1)
  })

  it('18. duplicate strings keep position and length', async () => {
    const result = await chain([ok('a')]).translate(['Home', 'Home', 'Skills'])
    expect(result).toEqual(['a:Home', 'a:Home', 'a:Skills'])
  })
})

describe('init warmup handling', () => {
  const warnSpy = () => vi.spyOn(console, 'warn').mockImplementation(() => {})

  it('a throwing (not rejecting) warmup falls through to the next backend', async () => {
    warnSpy()
    const hanging: TranslationBackend = {
      id: 'hanging',
      isAvailable: () => Promise.resolve(true),
      warmup: () => Promise.reject(new Error('NotAllowedError: activation required')),
      translate: vi.fn<TranslationBackend['translate']>(async (texts) => texts.map(() => 'hanging:x')),
    }
    const service = chain([hanging, ok('remote')])
    await service.init('ar')
    const result = await service.translate(['hello'])
    expect(result).toEqual(['remote:hello'])
    expect(hanging.translate).not.toHaveBeenCalled()
  })

  it('a never-resolving warmup is timeboxed and the backend is skipped this init', async () => {
    vi.useFakeTimers()
    try {
      warnSpy()
      const hanging: TranslationBackend = {
        id: 'hanging',
        isAvailable: () => Promise.resolve(true),
        warmup: () => new Promise<void>(() => {}), // Chrome create() pending forever
        translate: vi.fn<TranslationBackend['translate']>(async (texts) => texts.map(() => 'hanging:x')),
      }
      const service = chain([hanging, ok('remote')])
      const initDone = service.init('ar')
      await vi.advanceTimersByTimeAsync(30_000)
      await initDone
      const result = await service.translate(['hello'])
      expect(result).toEqual(['remote:hello'])
      expect(hanging.translate).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('isAcceptableTranslation', () => {
  it.each([
    ['empty string', '', 'Home', false],
    ['markup', '<b>x</b>', 'Home', false],
    ['degenerate', 'م', 'Skills', false],
    ['identical (brand)', 'RYNBSD', 'RYNBSD', true],
    ['normal translation', 'المهارات', 'Skills', true],
    ['punctuation only', '!!!', 'Home', false],
  ])('%s', (_label, candidate, source, expected) => {
    expect(isAcceptableTranslation(candidate, source)).toBe(expected)
  })
})

/**
 * Multi-layer translation fallback chain (Chain of Responsibility + circuit breaker).
 *
 * Order is fixed and deliberate — fastest / most-private / most-reliable first,
 * always ending in English so the page never renders garbage:
 *
 *   1. Chrome/Edge built-in Translator API  (on-device, zero network)
 *   2. bergamot (Firefox Translations WASM) (on-device, ~25 MB lazy download)
 *   3. Google unofficial "t" endpoint        (free, keyless, CORS-open)
 *   4. Mozhi (Google relay) × 2 hosts       (free, keyless)
 *   5. MyMemory                             (free anonymous quota: 5000 B/s, 5k chars/day)
 *   6. English                              (silent, final — always succeeds)
 *
 * Contract of every backend:
 *  - `isAvailable(lang)` resolves `false` instead of throwing; failures are not health events.
 *  - `translate(texts, lang)` returns EXACTLY `texts.length` entries, same order, where
 *    `null` means "not translated — pass the slot to the next link". A throw means the
 *    whole batch failed for that backend (timeout, crash, HTTP error).
 *
 * Why English merge at the end: unresolved slots keep the source text. That is the
 * documented final fallback, never a bug.
 *
 * Output guards (applied per slot before a candidate is accepted, see `guard.ts`):
 *  - non-empty, plausible length, no punctuation-only strings (quality)
 *  - no `<` / `>` characters (security: blocks markup/script injection, notably
 *    into the JSON-LD <script> sink)
 *  - identical output accepted only for short whitespace-free tokens (brands)
 *
 * Circuit breaker: 3 consecutive batch failures open a backend for 60 s (half-open
 * single probe afterwards). It counts one outcome per backend call, never per string.
 * A batch in which every string is rejected/skipped counts as a failure too, so a
 * silently-dead backend opens instead of being retried forever.
 *
 * Everything here runs on the MAIN thread: Chrome's Translator API is not exposed in
 * Web Workers, and the remote endpoints are plain fetches. bergamot stays inside its
 * dedicated worker; the adapter in `backends/bergamot.ts` proxies it via comlink.
 *
 * Availability is cached per (backend, language): positives for the session, negatives
 * for 60 s, rejected probes not at all. `init()` calls are serialized — concurrent
 * warmups for two languages cannot double-download a model in one session.
 */

import { isAcceptableTranslation } from './guard'
import { createChromeBackend } from './backends/chrome'
import { getBergamotService } from './backends/bergamot'
import { createRemoteBackends } from './backends/remote'

export interface ChainProgress {
  status: 'download' | 'ready'
  loaded?: number
  total?: number
  /** 0-100 */
  progress?: number
}

export interface TranslationBackend {
  /** Stable id for breaker + logs: 'chrome' | 'bergamot' | 'remote-google' | … */
  readonly id: string
  /** Cheap capability probe. Must resolve, never throw. Cached per session by the chain. */
  isAvailable(targetLang: string): Promise<boolean>
  /** Same length as `texts`, same order; `null` = leave this slot to the next link. */
  translate(texts: readonly string[], targetLang: string): Promise<(string | null)[]>
  /** Optional one-time preparation (model download, session creation). */
  warmup?(targetLang: string, onProgress?: (fraction: number) => void): Promise<void>
  /** Optional teardown (destroy sessions, stop workers). */
  dispose?(): Promise<void>
}

const BACKEND_TIMEOUT_MS = 20_000
const AVAILABILITY_CACHE_LIMIT = 64
const NEGATIVE_AVAILABILITY_TTL_MS = 60_000
const BREAKER_THRESHOLD = 3
const BREAKER_COOLDOWN_MS = 60_000

export class TranslationChainService {
  private readonly instances: TranslationBackend[]
  private readonly availability = new Map<string, { promise: Promise<boolean>; expires: number }>()
  private readonly breakers = new Map<
    string,
    { failures: number; openedAt: number | null; probing: boolean }
  >()
  private readonly now: () => number
  private initQueue: Promise<void> = Promise.resolve()
  private currentLang: string | null = null
  /** Ids of backends that produced at least one accepted string in the last run. */
  private providers: string[] = []

  /** Backend ids that contributed to the last `translate()` run (e.g. ['bergamot']). */
  get lastProviders(): readonly string[] {
    return this.providers
  }

  constructor(backends?: TranslationBackend[], options?: { now?: () => number }) {
    this.instances =
      backends ?? [createChromeBackend(), getBergamotService(), ...createRemoteBackends()]
    this.now = options?.now ?? Date.now
  }

  /**
   * Prepares the first warmable backend for `lang` (chrome session or bergamot model).
   * Serialized across calls; a failure of one backend never blocks the next — remote
   * tiers need no preparation and can always serve.
   */
  init(lang: string, onProgress?: (p: ChainProgress) => void): Promise<void> {
    const run = this.initQueue.then(() => this.initInner(lang, onProgress))
    // Keep the queue alive across failures without changing `run`'s outcome.
    this.initQueue = run.catch(() => undefined)
    return run
  }

  private async initInner(lang: string, onProgress?: (p: ChainProgress) => void): Promise<void> {
    this.currentLang = lang
    for (const backend of this.instances) {
      if (!backend.warmup) continue
      if (!(await this.available(backend, lang))) continue
      try {
        await backend.warmup(lang, (fraction) => {
          onProgress?.({
            status: 'download',
            loaded: Math.round(fraction * 1000),
            total: 1000,
            progress: fraction * 100,
          })
        })
        onProgress?.({ status: 'ready', loaded: 1, total: 1, progress: 100 })
        return
      } catch {
        // Warmup failed (e.g. Translator NotAllowedError without a gesture) —
        // transparently continue to the next backend.
        onProgress?.({ status: 'download', progress: 0 })
      }
    }
    // No warmup needed or none possible: remotes can still serve the translation.
    onProgress?.({ status: 'ready', loaded: 1, total: 1, progress: 100 })
  }

  async translate(texts: string[]): Promise<string[]> {
    const targetLang = this.currentLang ?? 'en'
    this.providers = []
    if (texts.length === 0) return []

    const results: (string | null)[] = new Array(texts.length).fill(null)
    let pending = texts.map((_, i) => i)
    const failures: string[] = []

    for (const backend of this.instances) {
      if (pending.length === 0) break
      if (this.isOfflineRemote(backend)) {
        failures.push(backend.id)
        continue
      }
      if (!(await this.available(backend, targetLang))) {
        failures.push(backend.id)
        continue
      }
      if (!this.breakerAllow(backend.id)) {
        failures.push(backend.id)
        continue
      }
      try {
        const got = await this.withTimeout(
          backend.translate(pending.map((i) => texts[i]!), targetLang),
          BACKEND_TIMEOUT_MS,
        )
        if (got.length !== pending.length) {
          throw new Error(`length mismatch: ${got.length} !== ${pending.length}`)
        }
        const rest: number[] = []
        pending.forEach((index, offset) => {
          const candidate = got[offset]
          if (typeof candidate === 'string' && isAcceptableTranslation(candidate, texts[index]!)) {
            results[index] = candidate
          } else {
            rest.push(index)
          }
        })
        const accepted = pending.length - rest.length
        if (accepted > 0) this.providers.push(backend.id)
        if (accepted === 0) {
          // A backend that produced nothing usable counts as failed — the
          // breaker must open even if nothing threw.
          this.breakerFail(backend.id)
        } else {
          this.breakerSucceed(backend.id)
        }
        pending = rest
      } catch {
        this.breakerFail(backend.id)
        failures.push(backend.id)
      }
    }

    if (pending.length > 0) {
      console.warn(
        `[translation] ${pending.length} string(s) served in English (declined/failed: ${failures.join(', ') || 'none'})`,
      )
    }
    return results.map((value, i) => value ?? texts[i]!)
  }

  async dispose(): Promise<void> {
    this.currentLang = null
    await Promise.allSettled(this.instances.map((backend) => backend.dispose?.()))
  }

  private isOfflineRemote(backend: TranslationBackend): boolean {
    // Remote tiers send the site's copy to a third party; never burn them (or
    // trip their breakers) when the browser reports no network.
    return (
      backend.id.startsWith('remote-') &&
      typeof navigator !== 'undefined' &&
      navigator.onLine === false
    )
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error(`backend timeout after ${ms}ms`)), ms)
    })
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
  }

  private available(backend: TranslationBackend, targetLang: string): Promise<boolean> {
    const key = `${backend.id}:${targetLang}`
    const cached = this.availability.get(key)
    if (cached && cached.expires > this.now()) return cached.promise

    const promise = backend.isAvailable(targetLang)
      .catch(() => false)
      .then((value) => {
        if (this.availability.size >= AVAILABILITY_CACHE_LIMIT) this.availability.clear()
        this.availability.set(key, {
          promise: Promise.resolve(value),
          // Positive verdicts hold for the session; negatives and rejected
          // probes may be transient (e.g. before a user gesture) — retry soon.
          expires: value ? Number.MAX_SAFE_INTEGER : this.now() + NEGATIVE_AVAILABILITY_TTL_MS,
        })
        return value
      })
    this.availability.set(key, {
      promise,
      expires: this.now() + NEGATIVE_AVAILABILITY_TTL_MS,
    })
    return promise
  }

  private breakerAllow(id: string): boolean {
    const state = this.breakers.get(id)
    if (!state || state.failures < BREAKER_THRESHOLD) return true
    if (state.probing) return false // half-open: a single probe is in flight
    // 60 s cooldown, half-open probe afterwards.
    if (state.openedAt !== null && this.now() - state.openedAt < BREAKER_COOLDOWN_MS) return false
    state.probing = true
    return true
  }

  private breakerSucceed(id: string): void {
    this.breakers.set(id, { failures: 0, openedAt: null, probing: false })
  }

  private breakerFail(id: string): void {
    const state = this.breakers.get(id) ?? { failures: 0, openedAt: null, probing: false }
    state.failures += 1
    if (state.failures >= BREAKER_THRESHOLD) state.openedAt = this.now()
    state.probing = false
    this.breakers.set(id, state)
  }
}

let singleton: TranslationChainService | null = null

/** Composition root — lazy singleton, created on first non-English selection. */
export function getTranslationChain(): TranslationChainService {
  if (!singleton) singleton = new TranslationChainService()
  return singleton
}

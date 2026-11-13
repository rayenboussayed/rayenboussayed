/**
 * Chrome (≥138) / Edge (≥148) built-in Translator backend — desktop only,
 * window only (the API is not exposed in Web Workers, which is why the chain
 * lives on the main thread).
 *
 * Facts the implementation depends on (verified against the spec & MDN):
 *  - Feature detect with `'Translator' in self`, never `window.ai.translator`.
 *  - `Translator.availability()` resolves 'available' | 'downloadable' |
 *    'downloading' | 'unavailable' (or `null` when it cannot tell). The pair
 *    may report `downloadable` even when already installed — the status is
 *    intentionally per-site and opaque; only `unavailable`/`null` is a hard no.
 *  - `Translator.create()` requires transient user activation for
 *    `downloadable` pairs. Auto-detect (no gesture) may therefore fail with
 *    `NotAllowedError`; `init()` in the chain treats any warmup failure as
 *    "this backend can't serve" and transparently tries the next one.
 *  - `downloadprogress` events carry `loaded` as a 0..1 fraction (`total === 1`).
 *  - Typings: the API is not in TypeScript's DOM lib, so a local structural
 *    interface is used instead of a new dependency.
 */

import type { TranslationBackend } from '../chain'

interface DownloadMonitor {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: { loaded: number }) => void,
  ): void
}

interface ChromeTranslatorSession {
  translate(text: string): Promise<string>
  destroy(): void
}

interface ChromeTranslatorStatic {
  availability(options: {
    sourceLanguage: string
    targetLanguage: string
  }): Promise<string | null>
  create(options: {
    sourceLanguage: string
    targetLanguage: string
    monitor?: (monitor: DownloadMonitor) => void
  }): Promise<ChromeTranslatorSession>
}

function api(): ChromeTranslatorStatic | null {
  // In browsers `Translator` is a class (typeof 'function'); tests may stub a plain object.
  const candidate = (globalThis as { Translator?: unknown }).Translator
  return typeof candidate === 'function' || (typeof candidate === 'object' && candidate !== null)
    ? (candidate as ChromeTranslatorStatic)
    : null
}

class ChromeBackend implements TranslationBackend {
  readonly id = 'chrome'
  private readonly sessions = new Map<string, Promise<ChromeTranslatorSession>>()

  async isAvailable(targetLang: string): Promise<boolean> {
    const translator = api()
    if (!translator) return false
    try {
      const state = await translator.availability({
        sourceLanguage: 'en',
        targetLanguage: targetLang,
      })
      return state === 'available' || state === 'downloading' || state === 'downloadable'
    } catch {
      return false
    }
  }

  warmup(targetLang: string, onProgress?: (fraction: number) => void): Promise<void> {
    return this.session(targetLang, onProgress).then(() => undefined)
  }

  async translate(
    texts: readonly string[],
    targetLang: string,
  ): Promise<(string | null)[]> {
    const session = await this.session(targetLang)
    // Sequenced deliberately: Chromium processes translate() calls one at a time.
    const results: (string | null)[] = new Array(texts.length).fill(null)
    for (let i = 0; i < texts.length; i += 1) {
      try {
        results[i] = await session.translate(texts[i]!)
      } catch {
        results[i] = null // one bad string must not sink the other 47
      }
    }
    return results
  }

  async dispose(): Promise<void> {
    const sessions = [...this.sessions.values()]
    this.sessions.clear()
    await Promise.allSettled(
      sessions.map(async (pending) => {
        const session = await pending
        session.destroy()
      }),
    )
  }

  private session(
    targetLang: string,
    onProgress?: (fraction: number) => void,
  ): Promise<ChromeTranslatorSession> {
    let pending = this.sessions.get(targetLang)
    if (!pending) {
      // Keep at most one session: each holds model state, and the page only
      // ever targets one language at a time.
      for (const [lang, old] of this.sessions) {
        if (lang !== targetLang) {
          this.sessions.delete(lang)
          old.then((s) => s.destroy()).catch(() => undefined)
        }
      }
      const translator = api()
      if (!translator) return Promise.reject(new Error('Translator API not present'))
      pending = translator.create({
        sourceLanguage: 'en',
        targetLanguage: targetLang,
        monitor: onProgress
          ? (monitor) => {
              monitor.addEventListener('downloadprogress', (event) => {
                onProgress(Math.min(1, Math.max(0, event.loaded)))
              })
            }
          : undefined,
      })
      this.sessions.set(targetLang, pending)
      // A failed creation must not poison future attempts (e.g. activation-less
      // auto-detect followed by an explicit user click).
      pending.catch(() => this.sessions.delete(targetLang))
    }
    return pending
  }
}

let singleton: ChromeBackend | null = null

export function createChromeBackend(): TranslationBackend {
  if (!singleton) singleton = new ChromeBackend()
  return singleton
}

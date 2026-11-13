/**
 * Bergamot (Mozilla Firefox Translations) backend: an adapter from the
 * chain's `TranslationBackend` contract to the existing comlink worker
 * (`translation.worker.ts`). The engine, WASM, integrity checks, and model
 * catalog are untouched — this file only adapts shapes.
 *
 * Behaviour notes:
 *  - Availability is static (catalog membership) — the model *download* happens
 *    lazily in `translate()` / on `warmup()`.
 *  - `translate()` re-initializes the worker once on failure before giving up,
 *    which covers the case where this backend was never warmed (e.g. Chrome
 *    warmed successfully in `init` but later fell over mid-run).
 */

import { proxy } from 'comlink'
import { BERGAMOT_PAIRS } from '../bergamot-catalog'
import { getTranslationService } from '../client'
import type { TranslationBackend } from '../chain'

class BergamotBackend implements TranslationBackend {
  readonly id = 'bergamot'

  async isAvailable(targetLang: string): Promise<boolean> {
    return BERGAMOT_PAIRS.some((pair) => pair.lang === targetLang)
  }

  async warmup(
    targetLang: string,
    onProgress?: (fraction: number) => void,
  ): Promise<void> {
    const service = getTranslationService()
    await service.init(
      targetLang,
      proxy((p: { status: string; progress?: number }) => {
        if (typeof p.progress === 'number') onProgress?.(p.progress / 100)
      }),
    )
  }

  async translate(
    texts: readonly string[],
    targetLang: string,
  ): Promise<(string | null)[]> {
    const service = getTranslationService()
    try {
      return await service.translate([...texts])
    } catch {
      // Recover once — e.g. the worker was never warmed for this language.
      await service.init(targetLang)
      return service.translate([...texts])
    }
  }

  async dispose(): Promise<void> {
    await getTranslationService().dispose()
  }
}

let singleton: BergamotBackend | null = null

export function getBergamotService(): TranslationBackend {
  if (!singleton) singleton = new BergamotBackend()
  return singleton
}

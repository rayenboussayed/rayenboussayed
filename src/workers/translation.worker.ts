import { expose } from 'comlink'
import type { BergamotTranslator } from '../lib/translation/bergamot'

export interface ProgressInfo {
  status: string
  file?: string
  progress?: number
  loaded?: number
  total?: number
}

/**
 * On-device en → X translation service backed by Mozilla's bergamot engine
 * (@mkljczk/bergamot-translator — the maintained fork of @browsermt).
 * The model for the requested target language is fetched lazily (one set of
 * model files per language, ~25 MB) the first time a user asks for it; the
 * decode runs off the main thread in a dedicated classic Worker.
 */
export class TranslationService {
  private engine: BergamotTranslator | null = null
  private currentLang: string | null = null

  /**
   * The bergamot package decides WHICH Worker implementation to use at module
   * evaluation by checking `typeof window !== 'undefined' && window.Worker`.
   * A module Web Worker has no `window`, so we alias it to `self` *before*
   * dynamically importing the engine. (Inside a classic worker the global
   * scope is `self` and native `Worker` exists — exactly what the package
   * expects in the browser.)
   */
  private async getEngine(): Promise<BergamotTranslator> {
    if (!this.engine) {
      (globalThis as { window?: unknown }).window ??= (globalThis as unknown)
      const mod = await import('../lib/translation/bergamot')
      this.engine = mod.getBergamotTranslator()
    }
    return this.engine
  }

  async init(lang: string, progressCallback?: (p: ProgressInfo) => void): Promise<void> {
    if (this.currentLang !== lang) await this.dispose()
    this.currentLang = lang
    const engine = await this.getEngine()
    await engine.warmup(lang, ({ loaded, total }) => {
      progressCallback?.({
        status: 'download',
        loaded,
        total,
        progress: total > 0 ? (loaded / total) * 100 : 0,
      })
    })
    progressCallback?.({ status: 'ready', loaded: 1, total: 1, progress: 100 })
  }

  async translate(texts: string[]): Promise<(string | null)[]> {
    if (!this.currentLang) throw new Error('Translation model not initialized')
    const engine = await this.getEngine()
    return engine.translate(texts, this.currentLang)
  }

  async dispose(): Promise<void> {
    if (this.engine) {
      await this.engine.dispose()
      this.engine = null
    }
    this.currentLang = null
  }
}

expose(new TranslationService())

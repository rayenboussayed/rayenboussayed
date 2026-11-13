/**
 * Universal en → X machine translation on-device, powered by Mozilla's
 * bergamot (Firefox Translations) engine via @browsermt/bergamot-translator
 * (MPL-2.0). Models are fetched lazily, per language, from a mirror of the
 * Mozilla production models on Hugging Face (byte-identical to the official
 * `mozilla/firefox-translations-models` repo, verified via LFS sha256).
 *
 * One code path covers every supported language — the registry is a static
 * catalog of models, not of translations. No per-language static copy exists
 * (requirement: "from en → any language, no static language translation").
 *
 * Models are .gz archives served over HTTPS with content hashes; integrity is
 * verified via crypto.subtle (when available) after download, and the WASM is
 * shared with Firefox's own in-browser translation feature.
 */

import { BatchTranslator, TranslatorBacking } from '@mkljczk/bergamot-translator/translator.js'
import { BERGAMOT_PAIRS, type BergamotFile, type BergamotPair } from './bergamot-catalog'

function findBergamotPair(lang: string): BergamotPair | undefined {
  return BERGAMOT_PAIRS.find((p) => p.lang === lang)
}

function logicalOf(file: BergamotFile): string {
  return file.logical.split('.')[0]
}

async function fetchAndVerify(
  file: BergamotFile,
  onBytes?: (bytes: number) => void,
): Promise<ArrayBuffer> {
  const res = await fetch(file.url, { credentials: 'omit' })
  if (!res.ok) throw new Error(`Failed to download ${file.name} (HTTP ${res.status})`)
  const gz = new Uint8Array(await res.arrayBuffer())
  onBytes?.(gz.byteLength)
  if (file.sha256) {
    // Fail closed: never accept unverified model bytes.
    if (!globalThis.crypto?.subtle) {
      throw new Error('SubtleCrypto unavailable — refusing to skip model integrity verification')
    }
    const digest = await crypto.subtle.digest('SHA-256', gz)
    const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
    if (hex !== file.sha256) {
      throw new Error(`Integrity check failed for ${file.name}`)
    }
  }
  return new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
}

const BERGAMOT_WORKER_URL = `${(import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'}bergamot/translator-worker.js`

class BergamotBacking extends TranslatorBacking {
  private _onProgress?: (loaded: number, total: number) => void

  constructor(onProgress?: (loaded: number, total: number) => void) {
    // The fork constructs the Worker inside loadWorker() using the backing's
    // workerUrl — the one passed to BatchTranslator is ignored when a backing
    // is supplied. The default path only resolves inside Vite's dep
    // optimizer, so pin it explicitly.
    super({ pivotLanguage: undefined, workerUrl: BERGAMOT_WORKER_URL })
    this._onProgress = onProgress
  }

  async loadModelRegistry() {
    // The parent class filters entries by from/to. A static full catalog is
    // used because the subclass constructor runs DURING super() — instance
    // fields are not yet initialized at that point.
    return BERGAMOT_PAIRS.map((pair) => ({
      from: 'en',
      to: pair.lang,
      files: Object.fromEntries(
        pair.files.map((f) => [
          logicalOf(f),
          { name: f.name, size: f.size, expectedSha256Hash: f.sha256 },
        ]),
      ),
    }))
  }

  async loadTranslationModel({ to }: { from: string; to: string }) {
    const pair =
      BERGAMOT_PAIRS.find((p) => p.lang === to) ??
      (() => {
        throw new Error(`Language '${to}' is not supported by the bergamot engine`)
      })()
    const total = pair.files.reduce((sum, f) => sum + f.size, 0)
    let loaded = 0
    const onBytes = (n: number) => {
      loaded += n
      this._onProgress?.(loaded, total)
    }
    const get = (logical: string) =>
      pair.files.find((f) => logicalOf(f) === logical) ??
      (() => {
        throw new Error(`Missing ${logical} file for ${pair.pair}`)
      })()

    const model = await fetchAndVerify(get('model'), onBytes)
    const shortlist = await fetchAndVerify(get('lex'), onBytes)

    const srcVocab = pair.files.find((f) => logicalOf(f) === 'srcvocab')
    const trgVocab = pair.files.find((f) => logicalOf(f) === 'trgvocab')
    const vocabs = srcVocab && trgVocab
      ? [await fetchAndVerify(srcVocab, onBytes), await fetchAndVerify(trgVocab, onBytes)]
      : [await fetchAndVerify(get('vocab'), onBytes)]

    return { model, shortlist, vocabs, config: {} }
  }
}

interface BergamotProgress {
  loaded: number
  total: number
}

export class BergamotTranslator {
  private translator: BatchTranslator | null = null
  private currentLang: string | null = null
  /** Downloads and initializes the model for `lang` if needed; reports byte progress of the model download. */
  async warmup(lang: string, onDownload?: (p: BergamotProgress) => void): Promise<void> {
    await this.ensure(lang, onDownload)
  }

  /** Creates (or reuses) the translator for `lang`, downloading the model on first use. */
  private async ensure(lang: string, onProgress?: (p: BergamotProgress) => void): Promise<BatchTranslator> {
    if (this.translator && this.currentLang === lang) return this.translator
    await this.dispose()
    const pair = findBergamotPair(lang)
    if (!pair) throw new Error(`Language '${lang}' is not supported by the bergamot engine`)

    const backing = new BergamotBacking((loaded, total) => onProgress?.({ loaded, total }))
    this.translator = new BatchTranslator(
      {
        pivotLanguage: undefined,
        workers: 1,
        batchSize: 16,
        cacheSize: 0,
        downloadTimeout: 0,
      },
      backing,
    )
    this.currentLang = lang
    return this.translator
  }

  async translate(
    texts: string[],
    lang: string,
    onProgress?: (done: number, total: number) => void,
  ): Promise<(string | null)[]> {
    if (texts.length === 0) return []
    const translator = await this.ensure(lang)
    const results: (string | null)[] = new Array(texts.length).fill(null)
    const BATCH = 16
    for (let i = 0; i < texts.length; i += BATCH) {
      const slice = texts.slice(i, i + BATCH)
      const translated = await Promise.all(
        slice.map(async (text) => {
          try {
            const out = await translator.translate({ from: 'en', to: lang, text, html: false })
            const candidate = out?.target?.text
            // `null`, not the English source: the chain must be able to try
            // the next tier (remote/English-merge) instead of accepting an echo.
            return typeof candidate === 'string' && candidate.length > 0 ? candidate : null
          } catch (e) {
            console.warn('[bergamot] translate failed for', lang, e)
            return null
          }
        }),
      )
      translated.forEach((value, j) => {
        results[i + j] = value
      })
      onProgress?.(Math.min(i + BATCH, texts.length), texts.length)
    }
    return results
  }

  async dispose(): Promise<void> {
    if (this.translator) {
      try {
        this.translator.delete()
      } catch {
        // ignore
      }
    }
    this.translator = null
    this.currentLang = null
  }
}

let engine: BergamotTranslator | null = null

export function getBergamotTranslator(): BergamotTranslator {
  if (!engine) engine = new BergamotTranslator()
  return engine
}

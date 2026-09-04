/**
 * translate.worker.ts — Web Worker for live on-device AI translation (REQUIREMENTS v7 §3).
 * - Single `pipe` per worker (NLLB 600M); switching target (e.g. FR→AR)
 *   re-inits the model. Main-thread `translationCache` avoids re-translate,
 *   not re-download.
 * - Lazy-loaded only after language pick (dynamic import of this worker).
 * - WebGPU fp16 (behind `navigator.gpu`) → WASM q4 → q8 → fp32
 *   (q4 first: q8 has Missing scale bug).
 * - progress_callback surfaces real download % (Cache API caching automatic).
 *
 * Protocol:
 *   main → worker: { type:'init', floresTgt, device? }
 *   worker → main: { type:'progress', progress, file, loaded, total }
 *   main → worker: { type:'translate', id, texts:[], src:'eng_Latn', tgt:'fra_Latn' }
 *   worker → main: { type:'result', id, translations:[] } | { type:'error', id, error }
 */

import { pipeline, env } from '@huggingface/transformers'

// Keep Cache API enabled (default) — don't disable
env.allowRemoteModels = true
env.allowLocalModels = false

// Use browser cache (Cache API) — default in transformers.js, don't override

type InitMsg = { type: 'init'; tgt: string; deviceHint?: 'webgpu' | 'wasm' }
type TranslateMsg = { type: 'translate'; id: number; texts: string[]; src: string; tgt: string }
type InMsg = InitMsg | TranslateMsg

let pipe: Awaited<ReturnType<typeof pipeline>> | null = null
let currentModel = 'Xenova/nllb-200-distilled-600M'
let currentTgt: string | null = null
let currentDevice: string = 'wasm'

async function ensurePipeline(tgt: string, _deviceHint?: string) {
  if (pipe && currentTgt === tgt) return pipe
  // Prefer WebGPU fp16 (if available) → q4 (smaller, compatible) → q8 → fp32.
  // Xenova/nllb ships: quantized (q8), q4, fp16, fp32 — q8 has Missing scale bug, so try q4 first.
  const candidates: Array<{ device: string; dtype: string }> = []
  // Progressive enhancement: WebGPU ~70% supported, only behind feature check
  // Worker has access to navigator.gpu in modern browsers; fallback to WASM if not.
  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in (navigator as unknown as Record<string, unknown>)
  if (hasWebGPU) {
    candidates.push({ device: 'webgpu', dtype: 'fp16' })
  }
  candidates.push({ device: 'wasm', dtype: 'q4' })
  candidates.push({ device: 'wasm', dtype: 'q8' })
  candidates.push({ device: 'wasm', dtype: 'fp32' })
  let lastErr: unknown = null
  for (const { device, dtype } of candidates) {
    currentDevice = device
    const progress_callback = (info: Record<string, unknown>) => {
      // @ts-ignore
      self.postMessage({ type: 'progress', ...info, device, dtype })
    }
    try {
      // @ts-ignore
      pipe = (await pipeline('translation', currentModel, {
        // @ts-ignore
        device,
        // @ts-ignore
        dtype,
        progress_callback,
      } as never)) as unknown as typeof pipe
      currentTgt = tgt
      return pipe
    } catch (e) {
      lastErr = e
      console.warn(`[worker] pipeline ${dtype} failed, trying next`, e)
      continue
    }
  }
  throw lastErr
}

self.onmessage = async (e: MessageEvent<InMsg>) => {
  const msg = e.data
  try {
    if (msg.type === 'init') {
      await ensurePipeline(msg.tgt)
      // @ts-ignore
      self.postMessage({ type: 'ready', tgt: msg.tgt, device: currentDevice })
      return
    }
    if (msg.type === 'translate') {
      const p = await ensurePipeline(msg.tgt)
      const results: string[] = []
      for (const text of msg.texts) {
        if (!text?.trim()) { results.push(text); continue }
        // @ts-ignore — translator call signature: translator(text, { src_lang, tgt_lang })
        const out = await (p as unknown as (t: string, o: Record<string, string>) => Promise<Array<{ translation_text: string }>>)(text, {
          src_lang: msg.src,
          tgt_lang: msg.tgt,
        })
        const translated = (out as unknown as Array<{ translation_text: string }>)?.[0]?.translation_text ?? text
        // Explicit test per REQUIREMENTS v7 §3: never return placeholder
        if (translated.includes(`[${msg.tgt}]`)) throw new Error(`Placeholder leak: ${translated}`)
        results.push(translated)
      }
      // @ts-ignore
      self.postMessage({ type: 'result', id: msg.id, translations: results })
      return
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // @ts-ignore
    self.postMessage({ type: 'error', id: (msg as TranslateMsg).id ?? 0, error: message })
  }
}

// signal worker loaded (main thread can show "worker ready, waiting for model download")
self.postMessage({ type: 'worker-ready' })

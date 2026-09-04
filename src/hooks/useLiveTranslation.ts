import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useLiveTranslation — live on-device NLLB translation via Web Worker (REQUIREMENTS v7 §2/§3).
 * - Worker is **never created on page load**; only after language pick (lazy dynamic import)
 * - Singleton pipeline inside worker, WebGPU fp16 → WASM q4 → q8 → fp32
 * - Real progress via pipeline progress_callback → postMessage (weighted aggregate)
 * - Cache API caching automatic (transformers.js default, not disabled)
 * - Respects saveData / deviceMemory guard in trigger (caller warns, still allows choice)
 *
 * Usage:
 *   const { status, progress, isLive, start, translateBatch, reset } = useLiveTranslation()
 *   // on language select:
 *   // if (navigator.connection?.saveData) // warn per spec, still allow
 *   // await start('fra_Latn')
 *   // const out = await translateBatch(['Hello'], 'eng_Latn', 'fra_Latn')
 */

type Status = 'idle' | 'loading-model' | 'ready' | 'translating' | 'error'

type ProgressInfo = {
  status?: string
  file?: string
  progress?: number
  loaded?: number
  total?: number
  device?: string
  dtype?: string
}

/**
 * Slice budget per worker message: at most `CHUNK_SIZE` texts and
 * `CHUNK_CHAR_BUDGET` characters — small enough that single-thread WASM
 * inference stays inside the per-chunk guard. One long About paragraph costs
 * minutes, so a fixed count alone can still exceed it; over-budget texts
 * travel solo and remain guard-bound (error, never silent).
 */
const CHUNK_SIZE = 6
const CHUNK_CHAR_BUDGET = 2000
/** Per-chunk guard (600s): surfaces error, no fallback. */
const CHUNK_TIMEOUT_MS = 600_000

export function useLiveTranslation() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<number, { resolve: (v: string[]) => void; reject: (e: string) => void }>>(new Map())
  const idRef = useRef(0)
  // Aggregate progress across files: file -> { loaded, total } for weighted %.
  const progressMapRef = useRef<Map<string, { loaded: number; total: number }>>(new Map())
  /** True while a multi-chunk `translateBatch` is in flight (suppresses mid-batch 'ready'). */
  const batchActiveRef = useRef(false)

  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState<number>(0)
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tgtFlores, setTgtFlores] = useState<string | null>(null)

  // lazy init — only on explicit start, never on mount
  const start = useCallback(async (floresTgt: string) => {
    // guard: data-saver / low-memory — still allow manual but warn (v7 §6)
    // @ts-ignore — navigator.connection/deviceMemory are non-standard
    const nav = navigator as unknown as { connection?: { saveData?: boolean }; deviceMemory?: number }
    const saveData = nav?.connection?.saveData
    const deviceMemory = nav?.deviceMemory
    if (saveData) {
      console.warn('[live-translate] saveData is on — model download may use significant data.')
    }
    if (deviceMemory != null && deviceMemory < 4) {
      console.warn(`[live-translate] low deviceMemory (${deviceMemory}GB) — NLLB 600M may be heavy.`)
    }
    if (workerRef.current) {
      setTgtFlores(floresTgt)
      setIsLive(true)
      return
    }
    setStatus('loading-model')
    setProgress(0)
    setError(null)
    try {
      // dynamic import so worker chunk is excluded from initial bundle (v7 §7)
      const mod = await import('../workers/translate.worker.ts?worker')
      const WorkerCtor = (mod as unknown as { default: new () => Worker }).default
      const w = new WorkerCtor()
      workerRef.current = w
      w.onmessage = (e: MessageEvent<Record<string, unknown>>) => {
        const d = e.data as Record<string, unknown>
        if (d.type === 'progress') {
          // Weighted aggregate: track per-file loaded/total so overall % doesn't jump backward.
          const file = (d.file as string) ?? 'unknown'
          const loaded = typeof d.loaded === 'number' ? (d.loaded as number) : 0
          const total = typeof d.total === 'number' ? (d.total as number) : 0
          if (file && total > 0) {
            progressMapRef.current.set(file, { loaded, total })
            let sumLoaded = 0
            let sumTotal = 0
            for (const v of progressMapRef.current.values()) {
              sumLoaded += v.loaded
              sumTotal += v.total
            }
            const overall = sumTotal > 0 ? Math.round((sumLoaded / sumTotal) * 100) : Math.round((d.progress as number) ?? 0)
            setProgress(Math.min(100, overall))
          } else {
            const p = typeof d.progress === 'number' ? (d.progress as number) : 0
            setProgress(Math.round(p))
          }
          setProgressInfo(d as ProgressInfo)
        } else if (d.type === 'ready') {
          setStatus('ready')
          setProgress(100)
          setIsLive(true)
          setTgtFlores(floresTgt)
        } else if (d.type === 'worker-ready') {
          // worker script loaded, now request model
          w.postMessage({ type: 'init', tgt: floresTgt })
        } else if (d.type === 'result') {
          const id = d.id as number
          const entry = pendingRef.current.get(id)
          if (entry) {
            pendingRef.current.delete(id)
            entry.resolve(d.translations as string[])
            // Mid-batch chunks must not flip status: the batch loop re-sets
            // 'translating' per chunk; only the batch end sets 'ready'.
            if (!batchActiveRef.current) setStatus('ready')
          }
        } else if (d.type === 'error') {
          const id = d.id as number
          const entry = pendingRef.current.get(id)
          const msg = (d.error as string) ?? 'Unknown worker error'
          if (entry) {
            pendingRef.current.delete(id)
            entry.reject(msg)
          }
          setError(msg)
          setStatus('error')
        }
      }
      w.onerror = (ev) => {
        setError(ev.message || 'Worker error')
        setStatus('error')
      }
      // worker will post worker-ready then we init model; no direct post yet — wait for worker-ready
      setTgtFlores(floresTgt)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      setStatus('error')
    }
  }, [])

    /** One worker round-trip for a small slice of texts, with its own timeout guard. */
  const sendChunk = useCallback(
    (w: Worker, chunk: string[], srcFlores: string, tgtFloresArg: string): Promise<string[]> => {
      setStatus('translating')
      const id = ++idRef.current
      return new Promise<string[]>((resolve, reject) => {
        pendingRef.current.set(id, { resolve, reject })
        w.postMessage({ type: 'translate', id, texts: chunk, src: srcFlores, tgt: tgtFloresArg })
        setTimeout(() => {
          if (pendingRef.current.has(id)) {
            pendingRef.current.delete(id)
            const msg = `Translation timeout — chunk of ${chunk.length} texts exceeded ${CHUNK_TIMEOUT_MS / 60000} min`
            setError(msg)
            reject(msg)
            setStatus('error')
          }
        }, CHUNK_TIMEOUT_MS)
      })
    },
    [],
  )

  const translateBatch = useCallback(    async (texts: string[], srcFlores: string, tgtFloresArg: string): Promise<string[]> => {
      const w = workerRef.current
      if (!w) throw new Error('Worker not started — call start() via user gesture first')
      // Chunked transport: WASM inference of one long text can take minutes on
      // CPU, so a single message for ~40 texts always outruns any sane timeout
      // and discards all progress. Sequential small slices (count AND char
      // budget) keep every await comfortably inside the per-chunk guard.
      // UI stays all-or-nothing.
      batchActiveRef.current = true
      try {
        const out: string[] = []
        let start = 0
        while (start < texts.length) {
          let end = start
          let chars = 0
          while (end < texts.length && end - start < CHUNK_SIZE && chars + texts[end]!.length <= CHUNK_CHAR_BUDGET) {
            chars += texts[end]!.length
            end++
          }
          // A single over-budget text travels solo (still guard-bound).
          if (end === start) end = start + 1
          // eslint-disable-next-line no-await-in-loop -- sequential by design (single worker pipe)
          out.push(...(await sendChunk(w, texts.slice(start, end), srcFlores, tgtFloresArg)))
          start = end
        }
        setStatus('ready')
        return out
      } finally {
        batchActiveRef.current = false
      }
    },
    [sendChunk],
  )

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    pendingRef.current.clear()
    progressMapRef.current.clear()
    setStatus('idle')
    setProgress(0)
    setProgressInfo(null)
    setIsLive(false)
    setError(null)
    setTgtFlores(null)
  }, [])

  // cleanup on unmount: dispose worker (spec: avoid leaks)
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  return {
    status,
    progress,
    progressInfo,
    isLive,
    error,
    tgtFlores,
    start,
    translateBatch,
    reset,
    /** whether live feature should be suggested (spec: skip if saveData or low deviceMemory) */
    canSuggestLive: (() => {
      if (typeof navigator === 'undefined') return true
      // @ts-ignore — non-standard
      const nav = navigator as unknown as { connection?: { saveData?: boolean }; deviceMemory?: number }
      const saveData = nav?.connection?.saveData ?? false
      const deviceMemory = nav?.deviceMemory
      if (saveData) return false
      if (deviceMemory != null && deviceMemory < 4) return false
      return true
    })(),
  }
}

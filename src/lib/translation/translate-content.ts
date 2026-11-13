import { shouldTranslateKey, shouldTranslateString } from './translatable'
import { isAcceptableTranslation } from './guard'

function walkStrings(obj: unknown, cb: (key: string, value: string) => void): void {
  if (obj === null || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    for (const item of obj) walkStrings(item, cb)
    return
  }
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key]
    if (typeof val === 'string') {
      if (shouldTranslateKey(key) && shouldTranslateString(val)) cb(key, val)
    } else if (val && typeof val === 'object') {
      walkStrings(val, cb)
    }
  }
}

function applyTranslations(obj: unknown, map: Map<string, string>): unknown {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string' && map.has(obj)) return map.get(obj)
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => applyTranslations(item, map))
  }
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key]
    if (typeof val === 'string') {
      if (shouldTranslateKey(key) && shouldTranslateString(val) && map.has(val)) {
        out[key] = map.get(val)
      } else {
        out[key] = val
      }
    } else if (val && typeof val === 'object') {
      out[key] = applyTranslations(val, map)
    } else {
      out[key] = val
    }
  }
  return out
}

export interface TranslateContentResult<T> {
  content: T
  /** Strings that fell back to English (rejected/degenerate MT output). */
  degraded: number
}

export async function translateContent<T>(
  source: T,
  translate: (texts: string[]) => Promise<(string | null)[]>,
  onProgress?: (done: number, total: number) => void,
): Promise<TranslateContentResult<T>> {
  const unique: string[] = []
  const seen = new Set<string>()
  walkStrings(source, (_key, value) => {
    if (!seen.has(value)) {
      seen.add(value)
      unique.push(value)
    }
  })

  if (unique.length === 0) return { content: source, degraded: 0 }

  const map = new Map<string, string>()
  let degraded = 0
  const CHUNK = 16
  let done = 0
  for (let i = 0; i < unique.length; i += CHUNK) {
    const chunk = unique.slice(i, i + CHUNK)
    const translated = await translate(chunk)
    chunk.forEach((orig, idx) => {
      const candidate = typeof translated[idx] === 'string' ? translated[idx] : null
      if (candidate !== null && isAcceptableTranslation(candidate, orig)) {
        map.set(orig, candidate)
      } else {
        map.set(orig, orig) // English fallback — counted for cache honesty
        degraded += 1
      }
    })
    done += chunk.length
    if (onProgress) onProgress(done, unique.length)
  }

  return { content: applyTranslations(source, map) as T, degraded }
}

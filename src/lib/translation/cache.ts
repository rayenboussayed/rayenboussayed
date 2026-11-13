import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'rynbsd-translation'
const DB_VERSION = 1
const STORE = 'translations'
// Bump when the translation pipeline changes (decoder options, output guard,
// content schema) so stale cached payloads are never reused.
const CACHE_VERSION = 5

interface CachedTranslation {
  key: string
  lang: string
  hash: string
  data: unknown
  timestamp: number
  /** Provenance from the run that produced this entry (diagnostics only). */
  providers?: string[]
  /** Strings that fell back to English in the producing run (0 preferred). */
  degraded?: number
}

let dbPromise: Promise<IDBPDatabase> | null = null
let purgeStarted = false

// Keys embed the schema version; keys from older schema generations are dead
// weight (and may contain poisoned all-English payloads from before the
// cache-honesty gate). Delete them once per page lifetime, best effort.
async function purgeStaleKeys(db: IDBPDatabase): Promise<void> {
  const marker = `:v${CACHE_VERSION}:`
  try {
    const keys = await db.getAllKeys(STORE)
    await Promise.all(
      keys.filter((key) => !String(key).includes(marker)).map((key) => db.delete(STORE, key)),
    )
  } catch {
    // best effort — stale entries are harmless leftovers
  }
}

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'key' })
        }
      },
    }).then((db) => {
      if (!purgeStarted) {
        purgeStarted = true
        void purgeStaleKeys(db)
      }
      return db
    })
  }
  return dbPromise
}

export async function getCachedTranslation(lang: string, hash: string): Promise<unknown | null> {
  try {
    const db = await getDb()
    const entry = (await db.get(STORE, `${lang}:v${CACHE_VERSION}:${hash}`)) as CachedTranslation | undefined
    if (entry && entry.lang === lang && entry.hash === hash) return entry.data
    return null
  } catch {
    return null
  }
}

export async function setCachedTranslation(
  lang: string,
  hash: string,
  data: unknown,
  meta?: { providers?: readonly string[]; degraded?: number },
): Promise<void> {
  try {
    const db = await getDb()
    const entry: CachedTranslation = {
      key: `${lang}:v${CACHE_VERSION}:${hash}`,
      lang,
      hash,
      data,
      timestamp: Date.now(),
      ...(meta?.providers ? { providers: [...meta.providers] } : {}),
      ...(typeof meta?.degraded === 'number' ? { degraded: meta.degraded } : {}),
    }
    await db.put(STORE, entry)
  } catch {
    // ignore cache errors
  }
}

export function hashContent(content: unknown): string {
  const str = JSON.stringify(content)
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

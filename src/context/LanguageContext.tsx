import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { i18nSchema, uiSchema } from '../types/content'
import i18nRaw from '../data/i18n.json'
import uiRaw from '../data/ui.json'

/**
 * LanguageContext — minimal, typed i18n detection + persistence.
 * - Init: localStorage('lang') → navigator.language/languages via bcp47ToCode → i18n.defaultLang
 * - Persists explicit choice in localStorage, updates document.documentElement.lang/dir
 * - Announces changes via aria-live region (accessibility)
 * - Consumers use useLanguage() and useContent() (src/lib/content.ts) for translated CMS
 */
const i18n = i18nSchema.parse(i18nRaw)
let _uiCommon: { languageChangedTo: string } = { languageChangedTo: 'Language changed to' }
try {
  const parsed = uiSchema.parse(uiRaw as unknown)
  _uiCommon = parsed.common
} catch {}

const STORAGE_KEY = 'lang'

function detectInitialLang(): string {
  if (typeof window === 'undefined') return i18n.defaultLang
  // 1) explicit user choice wins
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && i18n.supported.some((s) => s.code === stored)) return stored
  } catch { /* ignore */ }
  // 2) browser suggestion — walk navigator.languages preference order
  const candidates: string[] = []
  try {
    const langs = navigator.languages?.length ? [...navigator.languages] : []
    if (navigator.language) langs.unshift(navigator.language)
    for (const tag of langs) {
      if (!tag) continue
      // direct map first
      const mapped = i18n.bcp47ToCode[tag] ?? i18n.bcp47ToCode[tag.toLowerCase()]
      if (mapped) candidates.push(mapped)
      // fallback: base language (fr-FR → fr)
      const base = tag.split('-')[0]?.toLowerCase()
      if (base && i18n.bcp47ToCode[base]) candidates.push(i18n.bcp47ToCode[base])
      // fallback: code itself if supported
      if (i18n.supported.some((s) => s.code === tag)) candidates.push(tag)
      if (base && i18n.supported.some((s) => s.code === base)) candidates.push(base)
    }
  } catch { /* ignore */ }
  for (const c of candidates) if (i18n.supported.some((s) => s.code === c)) return c
  return i18n.defaultLang
}

function dirFor(code: string): 'ltr' | 'rtl' {
  const entry = i18n.supported.find((s) => s.code === code)
  return entry?.dir === 'rtl' ? 'rtl' : 'ltr'
}

type LanguageContextValue = {
  /** active BCP47 code (e.g. 'en', 'fr', 'ar') */
  lang: string
  /** text direction for active lang */
  dir: 'ltr' | 'rtl'
  /** native label for announcement / UI */
  nativeLabel: string
  /** all supported langs from CMS */
  supported: typeof i18n.supported
  /** explicitly set lang (persists) */
  setLang: (code: string) => void
}

const Ctx = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => detectInitialLang())
  const [announce, setAnnounce] = useState('')

  const setLang = useCallback((code: string) => {
    if (!i18n.supported.some((s) => s.code === code)) return
    setLangState(code)
    try { window.localStorage.setItem(STORAGE_KEY, code) } catch { /* ignore */ }
    const native = i18n.supported.find((s) => s.code === code)?.nativeLabel ?? code
    setAnnounce(`${_uiCommon.languageChangedTo} ${native}`)
    // clear announcement after a moment so it re-fires on next change
    window.setTimeout(() => setAnnounce(''), 1500)
  }, [])

  // side-effect: keep DOM lang/dir in sync (SEO + a11y, spec §2)
  useEffect(() => {
    const dir = dirFor(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang])

  const value = useMemo<LanguageContextValue>(() => {
    const native = i18n.supported.find((s) => s.code === lang)?.nativeLabel ?? lang
    return { lang, dir: dirFor(lang), nativeLabel: native, supported: i18n.supported, setLang }
  }, [lang, setLang])

  return (
    <Ctx.Provider value={value}>
      {children}
      {/* visually hidden aria-live for screen readers, spec §2 */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announce}
      </div>
    </Ctx.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLanguage must be used within <LanguageProvider>')
  return v
}

// re-export CMS for convenience + for content loader
export const i18nConfig = i18n
export { detectInitialLang, dirFor }

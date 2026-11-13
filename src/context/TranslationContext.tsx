/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { profile, skills, experience, projects, about, seo, ui } from '../lib/content'
import { SUPPORTED_LANGUAGES, findLanguage, isSupportedLanguage } from '../lib/translation/languages'
import { detectUserLanguage } from '../lib/translation/detect'
import { translateContent } from '../lib/translation/translate-content'
import { getCachedTranslation, setCachedTranslation, hashContent } from '../lib/translation/cache'
import { getTranslationChain, type ChainProgress } from '../lib/translation/chain'
import type { SiteContent } from '../lib/translation/types'
// oxlint-disable react(only-export-components)

export type TranslationStatus = 'idle' | 'detecting' | 'downloading' | 'translating' | 'ready' | 'error'

export interface TranslationContextValue {
  preference: string
  effectiveLang: string
  content: SiteContent
  status: TranslationStatus
  progress: { loaded: number; total: number; file?: string; percent?: number } | null
  supportedLanguages: typeof SUPPORTED_LANGUAGES
  setPreference: (pref: string) => void
}

const EnglishContent: SiteContent = { profile, skills, experience, projects, about, seo, ui }

const TranslationContext = createContext<TranslationContextValue | null>(null)

const STORAGE_KEY = 'site-lang'

function readPreference(): string {
  if (typeof localStorage === 'undefined') return 'auto'
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || 'auto'
    // Normalize stale/unsupported stored values (e.g. languages removed from
    // the verified set) to auto instead of rendering an unmatched option.
    if (stored !== 'auto' && stored !== 'en' && !isSupportedLanguage(stored)) return 'auto'
    return stored
  } catch {
    return 'auto'
  }
}

function writePreference(pref: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, pref)
  } catch {
    // ignore
  }
}

function resolveTargetLang(preference: string): string {
  if (preference === 'auto') return detectUserLanguage()
  if (preference === 'en') return 'en'
  return isSupportedLanguage(preference) ? preference : 'en'
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<string>(() => readPreference())
  const [effectiveLang, setEffectiveLang] = useState<string>('en')
  const [content, setContent] = useState<SiteContent>(EnglishContent)
  const [status, setStatus] = useState<TranslationStatus>('idle')
  const [progress, setProgress] = useState<TranslationContextValue['progress']>(null)
  const runIdRef = useRef(0)

  const setPreference = useCallback((pref: string) => {
    writePreference(pref)
    setPreferenceState(pref)
  }, [])

  const runTranslation = useCallback(async (targetLang: string) => {
    const runId = ++runIdRef.current
    setProgress(null)

    if (targetLang === 'en' || !findLanguage(targetLang)) {
      if (runId !== runIdRef.current) return
      setEffectiveLang('en')
      setContent(EnglishContent)
      setStatus('ready')
      return
    }

    const lang = findLanguage(targetLang)!
    const contentHash = hashContent(EnglishContent)

    // Check cache first
    setStatus('detecting')
    const cached = await getCachedTranslation(targetLang, contentHash)
    if (runId !== runIdRef.current) return
    if (cached) {
      setEffectiveLang(targetLang)
      setContent(cached as SiteContent)
      setStatus('ready')
      return
    }

    // Need to translate
    try {
      setStatus('downloading')
      const chain = getTranslationChain()
      await chain.init(lang.code, (p: ChainProgress) => {
        if (runId !== runIdRef.current) return
        setProgress({
          loaded: p.loaded ?? 0,
          total: p.total ?? 0,
          percent: p.progress,
        })
        if (p.status === 'ready') {
          setStatus('translating')
        }
      })
      if (runId !== runIdRef.current) return
      setStatus('translating')
      setProgress(null)

      const { content: translated, degraded } = await translateContent(EnglishContent, async (texts) => {
        if (runId !== runIdRef.current) return texts.map(() => null) // superseded — stay out of the way
        return chain.translate(texts)
      }, (done, total) => {
        if (runId !== runIdRef.current) return
        setProgress({ loaded: done, total, percent: (done / total) * 100 })
      })

      if (runId !== runIdRef.current) return
      // Cache honesty: never persist a largely-untranslated (all-English) run —
      // it would replay forever as a poisoned "translation".
      if (degraded <= 2) {
        await setCachedTranslation(targetLang, contentHash, translated, {
          providers: chain.lastProviders,
          degraded,
        })
      }
      setEffectiveLang(targetLang)
      setContent(translated)
      setStatus('ready')
      setProgress(null)
    } catch (e) {
      if (runId !== runIdRef.current) return
      console.error('Translation failed', e)
      setEffectiveLang('en')
      setContent(EnglishContent)
      setStatus('error')
      setProgress(null)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    runTranslation(resolveTargetLang(preference))
    return () => {
      // A pending run for the old preference must not apply its results.
      runIdRef.current += 1
    }
  }, [preference, runTranslation])

  // Apply lang attribute + direction to document
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = effectiveLang
    const lang = findLanguage(effectiveLang)
    document.documentElement.dir = lang?.rtl ? 'rtl' : 'ltr'
  }, [effectiveLang])

  const value = useMemo<TranslationContextValue>(() => ({
    preference,
    effectiveLang,
    content,
    status,
    progress,
    supportedLanguages: SUPPORTED_LANGUAGES,
    setPreference,
  }), [preference, effectiveLang, content, status, progress, setPreference])

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

const FALLBACK_VALUE: TranslationContextValue = {
  preference: 'en',
  effectiveLang: 'en',
  content: EnglishContent,
  status: 'ready',
  progress: null,
  supportedLanguages: SUPPORTED_LANGUAGES,
  setPreference: () => {},
}

export function useTranslation(): TranslationContextValue {
  const ctx = useContext(TranslationContext)
  if (!ctx) return FALLBACK_VALUE
  return ctx
}

export function useContent(): SiteContent {
  return useTranslation().content
}

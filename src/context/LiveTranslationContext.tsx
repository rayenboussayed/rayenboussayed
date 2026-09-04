import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLanguage, i18nConfig } from './LanguageContext'
import { useLiveTranslation } from '../hooks/useLiveTranslation'
import { profile as enProfile, ui as enUi, skills as enSkills, experience as enExperience, about as enAbout, projects as enProjects, seo as enSeo, themeConfig as enTheme, i18n as enI18n } from '../lib/content'
import type { Profile, Ui, About } from '../types/content'

/**
 * LiveTranslationContext — automatic on-device AI translation (REQUIREMENTS v7 §2/§3/§6).
 * - English JSON is the only shipped content; `fr`/`ar`/`es` are NLLB live output.
 * - Worker never loads on boot; lazy `import('?worker')` only inside `startLive()`.
 * - Selecting non-English calls `setLang(code)` (instant `lang`/`dir`) + `startLive(code)`.
 * - English/`Original` calls `resetLive()` and terminates the worker.
 * - Failure surfaces `status:'error'` + message, never silent English-as-translated.
 * - Bounded give-up (`START_LIVE_GIVE_UP_MS`): a stalled model load or batch
 *   terminates the worker and surfaces error for `role="alert"` + `Original`.
 * - Main-thread `translationCache` avoids re-translating on re-select.
 */

type LiveStatus = 'idle' | 'loading-model' | 'ready' | 'translating' | 'error'

type LiveState = {
  isLive: boolean
  isTranslating: boolean
  targetCode: string | null
  targetFlores: string | null
  status: LiveStatus
  progress: number
  error: string | null
  canSuggestLive: boolean
  liveProfile: Profile | null
  liveUi: Ui | null
  liveAbout: About | null
  liveSkills: typeof enSkills | null
  liveExperience: typeof enExperience | null
  liveProjects: typeof enProjects | null
  startLive: (targetCode: string) => Promise<void>
  resetLive: () => void
}

/** Main-thread cache: `${flores}|${source}` → translated (REQUIREMENTS v7 §6). */
const translationCache = new Map<string, string>()

/**
 * Bounded give-up for one `startLive` run: model download + all chunks
 * (REQUIREMENTS v9: still open in v8). Fires `status:'error'` + message so the
 * existing `role="alert"` + `Original` UI takes over — never a stuck spinner.
 */
const START_LIVE_GIVE_UP_MS = 30 * 60_000

/** Human display for the give-up bound ("30 min", "20 sec" — never 0.333… min). Exported for unit tests (REQUIREMENTS v13). */
export function formatGiveUp(ms: number): string {
  return ms >= 60_000 ? `${Math.round(ms / 60_000)} min` : `${Math.round(ms / 1000)} sec`
}

/** Exported for unit tests (REQUIREMENTS v13). */
export function cacheKey(flores: string, source: string): string {
  return `${flores}|${source}`
}

function collectTextsForLive() {
  const texts: string[] = []
  const map: Array<{ kind: string; idx?: number; field?: string; blockIdx?: number }> = []

  texts.push(enProfile.role); map.push({ kind: 'profile', field: 'role' })
  texts.push(enProfile.tagline); map.push({ kind: 'profile', field: 'tagline' })
  if (enProfile.availability) { texts.push(enProfile.availability); map.push({ kind: 'profile', field: 'availability' }) }
  texts.push(enProfile.ctaLabels.resume); map.push({ kind: 'profile', field: 'ctaLabels.resume' })
  texts.push(enProfile.ctaLabels.certifications); map.push({ kind: 'profile', field: 'ctaLabels.certifications' })
  texts.push(enProfile.contact.heading); map.push({ kind: 'profile', field: 'contact.heading' })
  texts.push(enProfile.contact.blurb); map.push({ kind: 'profile', field: 'contact.blurb' })

  enUi.navItems.forEach((n, i) => { texts.push(n.label); map.push({ kind: 'ui.nav', idx: i }) })
  texts.push(enUi.sections.skills.heading); map.push({ kind: 'ui.skills.heading' })
  texts.push(enUi.sections.skills.subheading); map.push({ kind: 'ui.skills.subheading' })
  texts.push(enUi.sections.experience.heading); map.push({ kind: 'ui.exp.heading' })
  texts.push(enUi.sections.projects.heading); map.push({ kind: 'ui.proj.heading' })
  texts.push(enUi.sections.projects.subheading); map.push({ kind: 'ui.proj.subheading' })
  texts.push(enUi.sections.projects.ctaLabel); map.push({ kind: 'ui.proj.cta' })

  enAbout.blocks.forEach((b, i) => { texts.push(b.text); map.push({ kind: 'about', blockIdx: i }) })

  enExperience.forEach((e, i) => {
    texts.push(e.role); map.push({ kind: 'exp', idx: i, field: 'role' })
    texts.push(e.org); map.push({ kind: 'exp', idx: i, field: 'org' })
    texts.push(e.description); map.push({ kind: 'exp', idx: i, field: 'description' })
  })

  enProjects.forEach((p, i) => {
    texts.push(p.title); map.push({ kind: 'proj', idx: i, field: 'title' })
    texts.push(p.description); map.push({ kind: 'proj', idx: i, field: 'description' })
  })

  return { texts, map }
}

const Ctx = createContext<LiveState | null>(null)

export function LiveTranslationProvider({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLanguage()
  const live = useLiveTranslation()
  const [liveProfile, setLiveProfile] = useState<Profile | null>(null)
  const [liveUi, setLiveUi] = useState<Ui | null>(null)
  const [liveAbout, setLiveAbout] = useState<About | null>(null)
  const [liveSkills, setLiveSkills] = useState<typeof enSkills | null>(null)
  const [liveExperience, setLiveExperience] = useState<typeof enExperience | null>(null)
  const [liveProjects, setLiveProjects] = useState<typeof enProjects | null>(null)
  const [targetCode, setTargetCode] = useState<string | null>(null)
  const [targetFlores, setTargetFlores] = useState<string | null>(null)
  /** Set only when the overall give-up fires (hook errors surface via `live.error`). */
  const [giveUpError, setGiveUpError] = useState<string | null>(null)
  const autoStartedRef = useRef(false)

  const startLive = useCallback(async (code: string) => {
    const entry = i18nConfig.supported.find((s) => s.code === code)
    if (!entry) throw new Error(`Unsupported lang ${code}`)
    const flores = entry.flores
    setTargetCode(code)
    setTargetFlores(flores)
    setGiveUpError(null)
    // Instant lang/dir for screen readers + RTL, before model finishes (§2).
    setLang(code)

    // @ts-ignore — non-standard
    const nav = navigator as unknown as { connection?: { saveData?: boolean }; deviceMemory?: number }
    if (nav?.connection?.saveData) console.warn('[live] saveData on — model download is large; proceeding because user picked a language.')
    if (nav?.deviceMemory != null && nav.deviceMemory < 4) console.warn(`[live] low deviceMemory (${nav.deviceMemory}GB) — proceeding on explicit choice.`)

    const { texts, map } = collectTextsForLive()
    // Race the whole run (model load has no per-step guard of its own)
    // against the bounded give-up; the timer is always cleared below.
    let giveUpTimer: number | undefined
    let gaveUp = false
    const run = (async () => {
      await live.start(flores)

      // Split cached vs fresh to avoid re-translating on re-select (§6).
      const out: string[] = new Array(texts.length)
      const freshTexts: string[] = []
      const freshIdx: number[] = []
      texts.forEach((t, i) => {
        const hit = translationCache.get(cacheKey(flores, t))
        if (hit !== undefined) out[i] = hit
        else { freshIdx.push(i); freshTexts.push(t) }
      })
      if (freshTexts.length > 0) {
        const fresh = await live.translateBatch(freshTexts, 'eng_Latn', flores)
        fresh.forEach((t, k) => {
          const i = freshIdx[k]!
          translationCache.set(cacheKey(flores, freshTexts[k]!), t)
          out[i] = t
        })
      }

      const newProfile: Profile = JSON.parse(JSON.stringify(enProfile))
      const newUi: Ui = JSON.parse(JSON.stringify(enUi))
      const newAbout: About = JSON.parse(JSON.stringify(enAbout))
      const newExp = JSON.parse(JSON.stringify(enExperience)) as typeof enExperience
      const newProj = JSON.parse(JSON.stringify(enProjects)) as typeof enProjects

      out.forEach((t, i) => {
        const m = map[i]
        if (!m) return
        if (m.kind === 'profile') {
          if (m.field === 'role') newProfile.role = t
          else if (m.field === 'tagline') newProfile.tagline = t
          else if (m.field === 'availability') newProfile.availability = t
          else if (m.field === 'ctaLabels.resume') newProfile.ctaLabels.resume = t
          else if (m.field === 'ctaLabels.certifications') newProfile.ctaLabels.certifications = t
          else if (m.field === 'contact.heading') newProfile.contact.heading = t
          else if (m.field === 'contact.blurb') newProfile.contact.blurb = t
        } else if (m.kind === 'ui.nav') {
          const idx = m.idx ?? 0
          if (newUi.navItems[idx]) newUi.navItems[idx]!.label = t
        } else if (m.kind === 'ui.skills.heading') newUi.sections.skills.heading = t
        else if (m.kind === 'ui.skills.subheading') newUi.sections.skills.subheading = t
        else if (m.kind === 'ui.exp.heading') newUi.sections.experience.heading = t
        else if (m.kind === 'ui.proj.heading') newUi.sections.projects.heading = t
        else if (m.kind === 'ui.proj.subheading') newUi.sections.projects.subheading = t
        else if (m.kind === 'ui.proj.cta') newUi.sections.projects.ctaLabel = t
        else if (m.kind === 'about') newAbout.blocks[m.blockIdx!]!.text = t
        else if (m.kind === 'exp') {
          if (m.field === 'role') newExp[m.idx!]!.role = t
          else if (m.field === 'org') newExp[m.idx!]!.org = t
          else if (m.field === 'description') newExp[m.idx!]!.description = t
        } else if (m.kind === 'proj') {
          if (m.field === 'title') newProj[m.idx!]!.title = t
          else if (m.field === 'description') newProj[m.idx!]!.description = t
        }
      })

      setLiveProfile(newProfile)
      setLiveUi(newUi)
      setLiveAbout(newAbout)
      setLiveSkills(enSkills) // skill names stay as code terms (§3)
      setLiveExperience(newExp)
      setLiveProjects(newProj)
    })()
    try {
      await Promise.race([
        run,
        new Promise<never>((_, reject) => {
          giveUpTimer = window.setTimeout(() => {
            gaveUp = true
            reject(new Error(`Live translation gave up after ${formatGiveUp(START_LIVE_GIVE_UP_MS)} without completing`))
          }, START_LIVE_GIVE_UP_MS)
        }),
      ])
    } catch (e) {
      if (gaveUp) {
        // Bounded give-up: terminate the worker so nothing keeps downloading
        // or inferring in the background; surface error for role="alert".
        live.reset()
        const msg = e instanceof Error ? e.message : String(e)
        setGiveUpError(msg)
        console.warn('[live] startLive gave up', e)
      } else {
        // No static fallback: surface error, keep English + lang/dir (§3).
        console.warn('[live] on-device translation failed', e)
      }
    } finally {
      if (giveUpTimer !== undefined) window.clearTimeout(giveUpTimer)
    }
  }, [live, setLang])

  const resetLive = useCallback(() => {
    live.reset()
    setGiveUpError(null)
    setLiveProfile(null)
    setLiveUi(null)
    setLiveAbout(null)
    setLiveSkills(null)
    setLiveExperience(null)
    setLiveProjects(null)
    setTargetCode(null)
    setTargetFlores(null)
    setLang('en')
    try { window.localStorage.setItem('lang', 'en') } catch { /* ignore */ }
  }, [live, setLang])

  // Auto-start when reload restores a non-English choice (§2: prior opt-in persists).
  useEffect(() => {
    if (autoStartedRef.current) return
    if (lang !== 'en' && live.status === 'idle' && !targetCode) {
      autoStartedRef.current = true
      startLive(lang).catch((e) => console.error(e))
    }
  }, [lang, live.status, targetCode, startLive])

  const value = useMemo<LiveState>(() => {
    const ready = !!liveProfile
    const error = ready ? null : (giveUpError ?? live.error)
    const status: LiveStatus = ready ? 'ready' : error ? 'error' : (live.status as LiveStatus)
    return {
      isLive: ready,
      isTranslating: status === 'loading-model' || status === 'translating',
      targetCode,
      targetFlores,
      status,
      progress: ready ? 100 : live.progress,
      error,
      canSuggestLive: live.canSuggestLive,
      liveProfile,
      liveUi,
      liveAbout,
      liveSkills,
      liveExperience,
      liveProjects,
      startLive,
      resetLive,
    }
  }, [live.status, live.progress, live.error, live.canSuggestLive, liveProfile, liveUi, liveAbout, liveSkills, liveExperience, liveProjects, targetCode, targetFlores, startLive, resetLive, giveUpError])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLiveTranslationContext() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLiveTranslationContext must be inside <LiveTranslationProvider>')
  return v
}

/** Components read live overlay or English; SEO stays English (never live). */
export function useContentWithLive() {
  const { lang } = useLanguage()
  const live = useContext(Ctx)
  if (live?.isLive && live.liveProfile && live.liveUi) {
    return {
      profile: live.liveProfile,
      ui: live.liveUi,
      about: live.liveAbout ?? enAbout,
      skills: live.liveSkills ?? enSkills,
      experience: live.liveExperience ?? enExperience,
      projects: live.liveProjects ?? enProjects,
      seo: enSeo,
      themeConfig: enTheme,
      i18n: enI18n,
      lang: live.targetCode ?? lang,
      isLive: true,
      isTranslating: false,
      liveStatus: live.status,
      liveProgress: live.progress,
    }
  }
  return {
    profile: enProfile,
    ui: enUi,
    about: enAbout,
    skills: enSkills,
    experience: enExperience,
    projects: enProjects,
    seo: enSeo,
    themeConfig: enTheme,
    i18n: enI18n,
    lang,
    isLive: false,
    isTranslating: (live?.status === 'loading-model' || live?.status === 'translating') ?? false,
    liveStatus: live?.status ?? ('idle' as const),
    liveProgress: live?.progress ?? 0,
  }
}

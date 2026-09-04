import {
  aboutSchema,
  experienceSchema,
  i18nSchema,
  profileSchema,
  projectsSchema,
  seoSchema,
  skillsSchema,
  themeConfigSchema,
  uiSchema,
} from '../types/content'

import aboutRaw from '../data/about.json'
import experienceRaw from '../data/experience.json'
import i18nRaw from '../data/i18n.json'
import profileRaw from '../data/profile.json'
import projectsRaw from '../data/projects.json'
import seoRaw from '../data/seo.json'
import skillsRaw from '../data/skills.json'
import themeRaw from '../data/theme.json'
import uiRaw from '../data/ui.json'

/**
 * Validated, typed content — English-only single source of truth (REQUIREMENTS v7 §1).
 * Components must import from here, never directly from `../data/*.json`.
 * `fr`/`ar`/`es` are produced live via `LiveTranslationContext` (NLLB worker),
 * never shipped as static `src/data/locales/**`.
 */

// English (default) — validated once at load
export const profile = profileSchema.parse(profileRaw)
export const skills = skillsSchema.parse(skillsRaw)
export const experience = experienceSchema.parse(experienceRaw)
export const projects = projectsSchema.parse(projectsRaw)
export const about = aboutSchema.parse(aboutRaw)
export const seo = seoSchema.parse(seoRaw)
export const themeConfig = themeConfigSchema.parse(themeRaw)
export const ui = uiSchema.parse(uiRaw)
export const i18n = i18nSchema.parse(i18nRaw)

/**
 * Hook: English content + active lang code (for `lang`/`dir` sync only).
 * Translated text comes from `useContentWithLive()`, never from here.
 */
import { useLanguage } from '../context/LanguageContext'
export function useContent() {
  const { lang } = useLanguage()
  return { profile, skills, experience, projects, about, seo, ui, themeConfig, i18n, lang }
}

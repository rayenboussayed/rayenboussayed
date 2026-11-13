import { isSupportedLanguage } from './languages'

function normalizeLanguageTag(tag: string): string {
  if (!tag) return 'en'
  const primary = tag.toLowerCase().split('-')[0]
  return primary
}

export function detectUserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en'
  const candidates: string[] = []
  if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages)
  if (navigator.language) candidates.push(navigator.language)
  for (const tag of candidates) {
    const code = normalizeLanguageTag(tag)
    if (code === 'en') return 'en'
    if (isSupportedLanguage(code)) return code
  }
  for (const tag of candidates) {
    const code = normalizeLanguageTag(tag)
    if (isSupportedLanguage(code)) return code
  }
  return 'en'
}

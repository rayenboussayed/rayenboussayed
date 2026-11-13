export interface Language {
  code: string
  name: string
  nativeName: string
  rtl?: boolean
}

/**
 * Languages served by the on-device bergamot engine (Mozilla Firefox
 * Translations models). Every entry is resolved lazily at runtime — one
 * universal engine, no per-language static copy of the site's content.
 *
 * Models: base-memory = current Firefox production students (~31.5MB,
 * plen/ar ~23-33MB); tiny = smaller students where only they exist.
 * Arabic reverses direction en→ar (RTL).
 *
 * Afrikaans is intentionally absent: no on-device model exists for it.
 * Models verified on Node/through Firefox's own usage; FLEURS/COMET figures
 * live in the Firefox Translations models README.
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
]

const LANGUAGE_BY_CODE: Record<string, Language> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, l]),
)

export function isSupportedLanguage(code: string): boolean {
  return code in LANGUAGE_BY_CODE
}

export function findLanguage(code: string): Language | undefined {
  return LANGUAGE_BY_CODE[code]
}

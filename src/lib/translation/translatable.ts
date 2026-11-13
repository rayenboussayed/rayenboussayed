/**
 * Keys whose string values must NOT be translated.
 */
const SKIP_KEYS = new Set<string>([
  'id',
  'icon',
  'href',
  'url',
  'email',
  'image',
  'src',
  'avatar',
  'canonical',
  'ogImage',
  'resumeUrl',
  'certificationsUrl',
  'route',
  'type',
  'category',
  'tags',
  'keywords',
  'period',
  'updatedAt',
  // Proper names and brand/tech terms — must never be machine-translated.
  'name',
  'displayName',
])

const SKIP_PATTERNS: RegExp[] = [
  /^https?:\/\//i,
  /^[\w.+-]+@[\w.-]+\.\w{2,}$/i,
  /^\/[^\s]*$/,
  /^\d{4}-\d{2}-\d{2}$/,
  /^[A-Z0-9_\-./]+$/,
]

export function shouldTranslateKey(key: string): boolean {
  return !SKIP_KEYS.has(key)
}

export function shouldTranslateString(value: string): boolean {
  if (!value || value.trim().length < 2) return false
  const v = value.trim()
  if (SKIP_PATTERNS.some((p) => p.test(v))) return false
  return true
}

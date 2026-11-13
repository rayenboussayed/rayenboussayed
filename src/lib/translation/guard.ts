/**
 * Detects degenerate machine-translation output so callers can fall back to
 * the source string for that entry instead of rendering garbage.
 *
 * MT models can degenerate on very short inputs (single words like nav
 * labels): runaway repetition, empty strings, or punctuation-only output.
 * Fluent translations never trip these checks.
 */
export function looksDegenerate(output: string, source: string): boolean {
  const out = output.trim()
  if (!out) return true
  // Punctuation/symbol-only output carries no meaning.
  if (!/[\p{L}\p{N}]/u.test(out)) return true
  // Wildly longer than the source (runaway generation).
  const srcLen = source.trim().length
  if (out.length > srcLen * 3 + 40) return true
  // Implausibly short for the source (e.g. 'Skills' -> 'م'). Legitimate
  // translations are at least ~20% of the source length.
  if (srcLen > 3 && out.length < Math.max(1, srcLen * 0.2)) return true
  // One token dominating the output (e.g. "م م م م م م م م").
  const tokens = out.split(/\s+/).filter(Boolean)
  if (tokens.length >= 6) {
    const counts = new Map<string, number>()
    let max = 0
    for (const token of tokens) {
      const count = (counts.get(token) ?? 0) + 1
      counts.set(token, count)
      if (count > max) max = count
    }
    if (max / tokens.length > 0.5) return true
  }
  // Unspaced scripts (CJK): one token per sentence defeats token counting.
  // One character dominating, or far too few unique characters, means collapse.
  const visible = out.replace(/\s+/g, '')
  if (visible.length >= 24) {
    const freq = new Map<string, number>()
    let max = 0
    for (const ch of visible) {
      const count = (freq.get(ch) ?? 0) + 1
      freq.set(ch, count)
      if (count > max) max = count
    }
    if (max / visible.length > 0.5) return true
    if (freq.size / visible.length < 0.05) return true
  }
  return false
}

/**
 * One output rule for quality and injection-safety, shared by the chain and
 * the content walker. Rejects empty, punctuation-only, degenerate, and
 * markup-bearing candidates. Identical output is accepted only for plausibly
 * untranslatable strings (single whitespace-free tokens ≤ 24 chars — brands
 * like "RYNBSD"); a backend that echoes a long sentence is treated as failed,
 * not as a successful translation.
 */
export function isAcceptableTranslation(candidate: string, source: string): boolean {
  if (candidate.length === 0) return false
  if (candidate.includes('<') || candidate.includes('>')) return false
  if (candidate.trim() === source.trim()) {
    const trimmed = source.trim()
    return trimmed.length <= 24 && !/\s/.test(trimmed)
  }
  return !looksDegenerate(candidate, source)
}

import { useTranslation } from '../context/TranslationContext'

/**
 * Language selector — auto-detect + manual override.
 * Shows progress while translating.
 */
export function LanguageSelector() {
  const { preference, effectiveLang, status, progress, supportedLanguages, setPreference } = useTranslation()

  const isTranslating = status === 'downloading' || status === 'translating' || status === 'detecting'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {isTranslating && (
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }} aria-live="polite">
          Translating…
          {progress?.percent != null ? ` ${Math.round(progress.percent)}%` : ''}
        </span>
      )}
      <select
        value={preference}
        onChange={(e) => setPreference(e.target.value)}
        aria-label="Language"
        style={{
          fontSize: 12,
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: 8,
          border: '2px solid var(--color-border)',
          background: 'var(--color-background-surface)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        }}
      >
        <option value="auto">Auto ({effectiveLang})</option>
        <option value="en">English</option>
        {supportedLanguages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
          </option>
        ))}
      </select>
    </span>
  )
}

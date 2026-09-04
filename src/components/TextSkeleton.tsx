import { useReducedMotion } from 'motion/react'

/**
 * TextSkeleton — shimmer placeholder for translated text (REQUIREMENTS v7 §4).
 * - Replaces stale English while `loading-model`/`translating`, never blank.
 * - Static blocks when `prefers-reduced-motion`; pulse otherwise.
 * - Parent sets `aria-busy="true"`; this exposes `role="status"` + live label.
 */
export function TextSkeleton({ lines = 3, label = 'Translating…' }: { lines?: number; label?: string }) {
  const reduce = useReducedMotion()
  const rows = Array.from({ length: Math.max(1, lines) }, (_, i) => i)
  return (
    <div role="status" aria-label={label} style={{ display: 'grid', gap: 10, padding: '8px 0' }}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {rows.map((i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            height: i === 0 ? 22 : 14,
            width: `${92 - ((i * 17) % 30)}%`,
            borderRadius: 8,
            background: 'var(--color-skeleton, #AEA9B7)',
            opacity: reduce ? 0.6 : undefined,
            animation: reduce ? undefined : 'soft-pop-shimmer 1.2s ease-in-out infinite alternate',
          }}
        />
      ))}
      {!reduce && (
        <style>{`@keyframes soft-pop-shimmer { from { opacity: 0.45 } to { opacity: 0.85 } }`}</style>
      )}
    </div>
  )
}

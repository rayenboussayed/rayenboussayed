import { lazy, Suspense } from 'react'

const Wrapper = lazy(() => import('./CanvasWrapper').then((m) => ({ default: m.GlowBubblesWrapper })))

/**
 * Lazy GlowBubbles — code-split so three.js chunk never blocks LCP.
 */
export function GlowBubbles() {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(40% 40% at 20% 30%, #FF6B9D33 0%, transparent 60%), radial-gradient(35% 35% at 80% 70%, #7B61FF33 0%, transparent 60%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
          }}
        />
      }
    >
      <Wrapper />
    </Suspense>
  )
}

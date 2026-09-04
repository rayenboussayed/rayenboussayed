import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bubble } from './Bubble'
import { themeConfig } from '../../lib/content'

function Cleanup() {
  const { gl } = useThree()
  // Runs only on true unmount (wrapper stays mounted for page lifetime, so
  // this fires ~never — no per-scroll context destroy; v9 §9.2).
  useEffect(() => {
    return () => {
      try {
        gl.dispose()
        const glAny = gl as unknown as { forceContextLoss?: () => void; getContext?: () => WebGLRenderingContext | null }
        glAny.forceContextLoss?.()
        const ctx = glAny.getContext?.() as unknown as { getExtension?: (s:string)=> unknown } | null
        const lose = ctx?.getExtension?.('WEBGL_lose_context') as { loseContext?: () => void } | null
        lose?.loseContext?.()
      } catch {}
    }
  }, [gl])
  return null
}

// Spread wider so spheres read as distinct orbs from camera [0,0,5] fov45
// x ±3, y ±1.4, z depth -1.5..-0.4 gives parallax without heavy overlap
const bubbles: Array<{ pos: [number, number, number]; scale: number; colorA: string; colorB: string }> = [
  { pos: [-2.8, 0.6, -1.2], scale: 1.2, colorA: '#FF6B9D', colorB: '#7B61FF' },
  { pos: [2.6, 0.9, -0.8], scale: 1.45, colorA: '#4FD1C5', colorB: '#7B61FF' },
  { pos: [0.0, -1.1, -1.5], scale: 1.0, colorA: '#FBBF24', colorB: '#FF6B9D' },
  { pos: [-1.2, 1.4, -0.9], scale: 0.95, colorA: '#7B61FF', colorB: '#4FD1C5' },
  { pos: [3.0, -0.7, -1.0], scale: 1.15, colorA: '#FBBF24', colorB: '#4FD1C5' },
  { pos: [-1.8, -1.0, -0.5], scale: 0.88, colorA: '#FF6B9D', colorB: '#FBBF24' },
]

/**
 * GlowCanvas — REQUIREMENTS v9 §9.
 * - Mounted once, never unmounted on scroll: the GL context is created once,
 *   so repeated hero exits can't exhaust contexts (§9.2).
 * - `active` flips `frameloop` between `'always'` (hero on screen + tab
 *   visible) and `'never'` (off-screen/hidden) instead of unmounting — orbs
 *   animate while visible and cost nothing while not.
 * - No remote HDR: bubbles use a custom ShaderMaterial that ignores
 *   scene.environment, so `<Environment preset="city">` only added a CDN
 *   fetch that could suspend the canvas blank (§9.3). Local lights only.
 */
export function GlowCanvas({ active }: { active: boolean }) {
  const palette = themeConfig.bubblePalette.length >= 2 ? themeConfig.bubblePalette : ['#FF6B9D', '#7B61FF']
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.15} />
      <pointLight position={[5, 5, 5]} intensity={2} distance={18} decay={2} />
      {bubbles.map((b, i) => (
        <Bubble key={i} position={b.pos} scale={b.scale} colorA={palette[i % palette.length] ?? b.colorA} colorB={palette[(i + 1) % palette.length] ?? b.colorB} />
      ))}
      <Cleanup />
    </Canvas>
  )
}

export function GlowBubblesWrapper() {
  const ref = useRef<HTMLDivElement>(null)
  // Active = hero intersecting AND tab visible. Latest intersection lives in a
  // ref so tab-return restores correctly (§9.1: the old updater closed over
  // stale `v` and stayed false forever after any tab switch).
  const [active, setActive] = useState(true)
  const intersectingRef = useRef(true)
  // Only respect explicit user preference; do not guess via hardwareConcurrency
  // (headless CI and many real devices report ≤4, which would incorrectly disable 3D)
  const [canRender] = useState(() => {
    if (typeof window === 'undefined') return true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return true
  })

  useEffect(() => {
    if (!canRender) return
    const sync = () => setActive(intersectingRef.current && !document.hidden)
    const el = ref.current
    const io =
      typeof IntersectionObserver !== 'undefined' && el
        ? new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                intersectingRef.current = e.isIntersecting
                sync()
              }),
            { threshold: 0.1 },
          )
        : null
    if (io && el) io.observe(el)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io?.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [canRender])

  if (!canRender) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(40% 40% at 20% 30%, #FF6B9D55 0%, transparent 60%), radial-gradient(35% 35% at 80% 70%, #7B61FF55 0%, transparent 60%), radial-gradient(30% 30% at 50% 10%, #4FD1C555 0%, transparent 60%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
    )
  }

  return (
    <div ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <GlowCanvas active={active} />
    </div>
  )
}

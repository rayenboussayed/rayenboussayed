import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Bubble } from './Bubble'
import { themeConfig } from '../../lib/content'

function Cleanup() {
  const { gl } = useThree()
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

const bubbles: Array<{ pos: [number, number, number]; scale: number; colorA: string; colorB: string }> = [
  { pos: [-2.0, 0.55, -0.4], scale: 1.45, colorA: '#FF6B9D', colorB: '#7B61FF' },
  { pos: [1.9, 0.75, -0.2], scale: 1.7, colorA: '#4FD1C5', colorB: '#7B61FF' },
  { pos: [0.15, -0.65, -0.6], scale: 1.25, colorA: '#FBBF24', colorB: '#FF6B9D' },
  { pos: [-0.85, 1.05, -0.35], scale: 1.15, colorA: '#7B61FF', colorB: '#4FD1C5' },
  { pos: [2.35, -0.45, -0.5], scale: 1.35, colorA: '#FBBF24', colorB: '#4FD1C5' },
  { pos: [-1.35, -0.85, -0.3], scale: 1.05, colorA: '#FF6B9D', colorB: '#FBBF24' },
]

export function GlowCanvas({ visible }: { visible: boolean }) {
  const palette = themeConfig.bubblePalette.length >= 2 ? themeConfig.bubblePalette : ['#FF6B9D', '#7B61FF']
  if (!visible) return null
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.15} />
      <pointLight position={[5, 5, 5]} intensity={2} distance={18} decay={2} />
      <Environment preset="city" />
      {bubbles.map((b, i) => (
        <Bubble key={i} position={b.pos} scale={b.scale} colorA={palette[i % palette.length] ?? b.colorA} colorB={palette[(i + 1) % palette.length] ?? b.colorB} />
      ))}
      <Cleanup />
    </Canvas>
  )
}

export function GlowBubblesWrapper() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [canRender] = useState(() => {
    if (typeof window === 'undefined') return true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const hw = (navigator as unknown as { hardwareConcurrency?: number }).hardwareConcurrency
    if (typeof hw === 'number' && hw <= 4) return false
    return true
  })

  useEffect(() => {
    if (!canRender) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { threshold: 0.1 },
    )
    io.observe(el)
    const onVis = () => setVisible((v) => (document.hidden ? false : v))
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
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
      <GlowCanvas visible={visible} />
    </div>
  )
}

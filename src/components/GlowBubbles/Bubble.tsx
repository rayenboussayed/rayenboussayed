import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sphere } from '@react-three/drei'
import { Color, DoubleSide, type ShaderMaterial } from 'three'
import { bubbleFragmentShader, bubbleVertexShader } from './shaders'

/** Props for a single glowing bubble. */
type BubbleProps = {
  position: [number, number, number]
  scale: number
  colorA: string
  colorB: string
}

/**
 * Single glowing bubble — low-poly sphere + custom shader + Float.
 * Uniforms are memoized so new {@link Color} instances are only allocated
 * when the palette changes (not on every parent render).
 */
export function Bubble({ position, scale, colorA, colorB }: BubbleProps) {
  const matRef = useRef<ShaderMaterial>(null!)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new Color(colorA) },
      uColorB: { value: new Color(colorB) },
      uGlow: { value: 0.9 },
    }),
    [colorA, colorB],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
      // toned down glow: 0.40±0.15 so rim stays colorful, not white-wash
      matRef.current.uniforms.uGlow.value = 0.4 + Math.sin(t * 0.5) * 0.15
    }
  })

  return (
    <Float speed={1.15} rotationIntensity={0.55} floatIntensity={0.9} floatingRange={[-0.22, 0.22]}>
      <Sphere args={[1, 32, 32]} position={position} scale={scale}>
        <shaderMaterial
          ref={matRef}
          vertexShader={bubbleVertexShader}
          fragmentShader={bubbleFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest
          side={DoubleSide}
        />
      </Sphere>
    </Float>
  )
}

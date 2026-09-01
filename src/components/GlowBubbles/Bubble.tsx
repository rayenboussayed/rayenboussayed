import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { bubbleFragmentShader, bubbleVertexShader } from './shaders'

type BubbleProps = {
  position: [number, number, number]
  scale: number
  colorA: string
  colorB: string
}

/**
 * Single glowing bubble — low-poly sphere + custom shader + Float.
 */
export function Bubble({ position, scale, colorA, colorB }: BubbleProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
      matRef.current.uniforms.uGlow.value = 0.75 + Math.sin(t * 0.5) * 0.28
    }
  })

  return (
    <Float speed={1.15} rotationIntensity={0.55} floatIntensity={0.9} floatingRange={[-0.22, 0.22]}>
      <Sphere args={[1, 48, 48]} position={position} scale={scale}>
        <shaderMaterial
          ref={matRef}
          vertexShader={bubbleVertexShader}
          fragmentShader={bubbleFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uColorA: { value: new THREE.Color(colorA) },
            uColorB: { value: new THREE.Color(colorB) },
            uGlow: { value: 0.9 },
          }}
          transparent
          depthWrite={false}
          depthTest
          side={THREE.DoubleSide}
        />
      </Sphere>
    </Float>
  )
}

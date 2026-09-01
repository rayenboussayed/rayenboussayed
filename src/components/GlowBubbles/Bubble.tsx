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
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.8} floatingRange={[-0.2, 0.2]}>
      <Sphere args={[1, 32, 32]} position={position} scale={scale}>
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
        />
      </Sphere>
    </Float>
  )
}

import type { MotionValue } from 'motion/react'
import type * as THREE from 'three'

import {
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  RoundedBox,
} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

/**
 *
 * @param root0
 * @param root0.color Cube color
 * @param root0.position Position in 3D space
 * @param root0.scrollProgress Scroll progress value
 * @param root0.speed Rotation speed multiplier
 */
function FloatingCube({
  color,
  position,
  scrollProgress,
  speed,
}: {
  readonly color: string
  readonly position: [number, number, number]
  readonly scrollProgress: MotionValue<number>
  readonly speed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const progress = scrollProgress.get()
    meshRef.current.rotation.x = progress * Math.PI * speed
    meshRef.current.rotation.z = progress * Math.PI * speed * 0.5
  })

  return (
    <Float floatIntensity={1} rotationIntensity={0.2} speed={speed * 0.8}>
      <RoundedBox
        args={[1.2, 1.2, 1.2]}
        position={position}
        radius={0.15}
        ref={meshRef}
        smoothness={4}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          opacity={0.6}
          roughness={0.3}
          transparent
        />
      </RoundedBox>
    </Float>
  )
}

/**
 *
 * @param root0
 * @param root0.color Octahedron color
 * @param root0.position Position in 3D space
 * @param root0.scrollProgress Scroll progress value
 * @param root0.speed Rotation speed multiplier
 */
function FloatingOctahedron({
  color,
  position,
  scrollProgress,
  speed,
}: {
  readonly color: string
  readonly position: [number, number, number]
  readonly scrollProgress: MotionValue<number>
  readonly speed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const progress = scrollProgress.get()
    meshRef.current.rotation.x = progress * Math.PI * speed * 0.7
    meshRef.current.rotation.y = progress * Math.PI * speed * 0.4
  })

  return (
    <Float floatIntensity={1.8} rotationIntensity={0.35} speed={speed * 0.7}>
      <mesh position={position} ref={meshRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color={color}
          metalness={0.85}
          opacity={0.7}
          roughness={0.15}
          transparent
        />
      </mesh>
    </Float>
  )
}

/**
 *
 * @param root0
 * @param root0.color Sphere color
 * @param root0.distort Distortion intensity
 * @param root0.position Position in 3D space
 * @param root0.scrollProgress Scroll progress value
 * @param root0.speed Rotation speed multiplier
 */
function FloatingSphere({
  color,
  distort,
  position,
  scrollProgress,
  speed,
}: {
  readonly color: string
  readonly distort: number
  readonly position: [number, number, number]
  readonly scrollProgress: MotionValue<number>
  readonly speed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const progress = scrollProgress.get()
    meshRef.current.rotation.x = progress * Math.PI * 0.5
    meshRef.current.rotation.y = progress * Math.PI * speed
  })

  return (
    <Float floatIntensity={1.5} rotationIntensity={0.3} speed={speed}>
      <mesh position={position} ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          metalness={0.8}
          roughness={0.2}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

/**
 *
 * @param root0
 * @param root0.color Torus color
 * @param root0.position Position in 3D space
 * @param root0.scrollProgress Scroll progress value
 * @param root0.speed Rotation speed multiplier
 */
function FloatingTorus({
  color,
  position,
  scrollProgress,
  speed,
}: {
  readonly color: string
  readonly position: [number, number, number]
  readonly scrollProgress: MotionValue<number>
  readonly speed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const progress = scrollProgress.get()
    meshRef.current.rotation.x = progress * Math.PI * speed * 0.3
    meshRef.current.rotation.y = progress * Math.PI * speed
  })

  return (
    <Float floatIntensity={2} rotationIntensity={0.4} speed={speed * 0.6}>
      <mesh position={position} ref={meshRef}>
        <torusGeometry args={[0.8, 0.3, 32, 64]} />
        <MeshTransmissionMaterial
          anisotropy={0.2}
          backside
          chromaticAberration={0.06}
          color={color}
          distortion={0.1}
          distortionScale={0.2}
          ior={1.5}
          roughness={0.1}
          temporalDistortion={0.1}
          thickness={0.3}
          transmission={0.9}
        />
      </mesh>
    </Float>
  )
}

export { FloatingCube, FloatingOctahedron, FloatingSphere, FloatingTorus }

import type { MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

import { Canvas, useThree } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing'
import { useReducedMotion, useScroll } from 'motion/react'
import { BlendFunction } from 'postprocessing'
import { Suspense } from 'react'
import * as THREE from 'three'

import { FloatingObjects } from './floating-meshes'

/**
 * Fixed background 3D scene with floating geometric shapes linked to scroll.
 */
export default function Scroll3DScene() {
  const prefersReducedMotion = useReducedMotion()
  const noMotion = prefersReducedMotion !== null && prefersReducedMotion
  const { scrollYProgress } = useScroll()

  if (noMotion) {
    return null
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <Canvas
          camera={{ fov: 50, position: [0, 0, 8] }}
          dpr={[1, 1.5]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
          style={{ background: 'transparent' }}
        >
          <Scene scrollProgress={scrollYProgress} />
        </Canvas>
      </div>
    </Suspense>
  )
}

/**
 * Placeholder shown while the 3D scene loads.
 */
function LoadingFallback(): ReactNode {
  return <div className="pointer-events-none fixed inset-0 z-0" />
}

/**
 * Post-processing effects stack.
 */
function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.4}
        luminanceSmoothing={0.9}
        luminanceThreshold={0.15}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        modulationOffset={0.2}
        offset={new THREE.Vector2(0.0004, 0.0004)}
        radialModulation={true}
      />
      <Vignette
        blendFunction={BlendFunction.NORMAL}
        darkness={0.3}
        offset={0.4}
      />
    </EffectComposer>
  )
}

/**
 * Inner scene with lights, floating objects, and post-processing.
 * @param root0
 * @param root0.scrollProgress Scroll progress from motion
 */
function Scene({
  scrollProgress,
}: {
  readonly scrollProgress: MotionValue<number>
}) {
  const { viewport } = useThree()

  const bluePrimary = '#2563EB'
  const goldAccent = '#F59E0B'
  const blueLight = '#3B82F6'
  const goldLight = '#FBBF24'

  const scale = Math.min(viewport.width / 12, 1)

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight intensity={0.8} position={[10, 10, 5]} />
      <pointLight
        color={bluePrimary}
        intensity={0.4}
        position={[-10, -10, -5]}
      />
      <pointLight color={goldAccent} intensity={0.3} position={[10, 10, 5]} />

      <FloatingObjects
        blueLight={blueLight}
        bluePrimary={bluePrimary}
        goldAccent={goldAccent}
        goldLight={goldLight}
        scale={scale}
        scrollProgress={scrollProgress}
      />

      <PostProcessing />
    </>
  )
}

import type { MotionValue } from 'motion/react'

import {
  FloatingCube,
  FloatingOctahedron,
  FloatingSphere,
  FloatingTorus,
} from './floating-geometries'

type FloatingObjectsProps = {
  readonly blueLight: string
  readonly bluePrimary: string
  readonly goldAccent: string
  readonly goldLight: string
  readonly scale: number
  readonly scrollProgress: MotionValue<number>
}

/**
 *
 * @param root0
 * @param root0.blueLight
 * @param root0.bluePrimary
 * @param root0.goldAccent
 * @param root0.goldLight
 * @param root0.scale
 * @param root0.scrollProgress
 */
export function FloatingObjects({
  blueLight,
  bluePrimary,
  goldAccent,
  goldLight,
  scale,
  scrollProgress,
}: FloatingObjectsProps) {
  return (
    <group scale={scale}>
      <FloatingSpheres
        bluePrimary={bluePrimary}
        goldAccent={goldAccent}
        scrollProgress={scrollProgress}
      />
      <FloatingShapes
        blueLight={blueLight}
        bluePrimary={bluePrimary}
        goldAccent={goldAccent}
        goldLight={goldLight}
        scrollProgress={scrollProgress}
      />
    </group>
  )
}

/**
 *
 * @param root0
 * @param root0.blueLight
 * @param root0.bluePrimary
 * @param root0.goldAccent
 * @param root0.goldLight
 * @param root0.scrollProgress
 */
function FloatingShapes({
  blueLight,
  bluePrimary,
  goldAccent,
  goldLight,
  scrollProgress,
}: {
  readonly blueLight: string
  readonly bluePrimary: string
  readonly goldAccent: string
  readonly goldLight: string
  readonly scrollProgress: MotionValue<number>
}) {
  return (
    <>
      <FloatingCube
        color={blueLight}
        position={[3, 3, -5]}
        scrollProgress={scrollProgress}
        speed={0.6}
      />
      <FloatingCube
        color={goldLight}
        position={[-3, -2, -3]}
        scrollProgress={scrollProgress}
        speed={0.9}
      />
      <FloatingTorus
        color={bluePrimary}
        position={[0, 0, -6]}
        scrollProgress={scrollProgress}
        speed={1}
      />
      <FloatingOctahedron
        color={goldAccent}
        position={[-5, 1, -4]}
        scrollProgress={scrollProgress}
        speed={0.7}
      />
      <FloatingOctahedron
        color={blueLight}
        position={[5, -3, -5]}
        scrollProgress={scrollProgress}
        speed={1.1}
      />
    </>
  )
}

/**
 *
 * @param root0
 * @param root0.bluePrimary
 * @param root0.goldAccent
 * @param root0.scrollProgress
 */
function FloatingSpheres({
  bluePrimary,
  goldAccent,
  scrollProgress,
}: {
  readonly bluePrimary: string
  readonly goldAccent: string
  readonly scrollProgress: MotionValue<number>
}) {
  return (
    <>
      <FloatingSphere
        color={bluePrimary}
        distort={0.4}
        position={[-4, 2, -3]}
        scrollProgress={scrollProgress}
        speed={0.8}
      />
      <FloatingSphere
        color={goldAccent}
        distort={0.3}
        position={[4, -1, -4]}
        scrollProgress={scrollProgress}
        speed={1.2}
      />
    </>
  )
}

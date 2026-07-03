import type { ReactNode } from 'react'

import { motion, useReducedMotion } from 'motion/react'

type AnimationVariant = 'blur' | 'dramatic' | 'glide' | 'pop' | 'slide'
type Direction = 'down' | 'fade' | 'left' | 'right' | 'scale' | 'up'

interface RevealProperties {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
  readonly direction?: Direction
  readonly variant?: AnimationVariant
}

const VARIANT_CONFIG = {
  blur: {
    initial: { filter: 'blur(8px)', opacity: 0, y: 20 },
    whileInView: { filter: 'blur(0px)', opacity: 1, y: 0 },
  },
  dramatic: {
    initial: { opacity: 0, rotateX: -15, scale: 0.95, y: 40 },
    whileInView: { opacity: 1, rotateX: 0, scale: 1, y: 0 },
  },
  glide: {
    initial: { opacity: 0, x: -60, y: 10 },
    whileInView: { opacity: 1, x: 0, y: 0 },
  },
  pop: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
  },
  slide: {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
  },
} as const

const DIRECTION_OFFSET = {
  down: { x: 0, y: -40 },
  fade: { x: 0, y: 0 },
  left: { x: 50, y: 0 },
  right: { x: -50, y: 0 },
  scale: { x: 0, y: 0 },
  up: { x: 0, y: 40 },
} as const

/**
 *
 * @param root0
 * @param root0.children
 * @param root0.className
 * @param root0.delay
 * @param root0.direction
 * @param root0.variant
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  variant = 'slide',
}: RevealProperties) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const offset = DIRECTION_OFFSET[direction]
  const v = VARIANT_CONFIG[variant]

  const initial = {
    ...v.initial,
    x: offset.x,
    y: offset.y,
  }

  const whileInView = {
    ...v.whileInView,
    x: 0,
    y: 0,
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      style={{
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        WebkitBackfaceVisibility: 'hidden',
      }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      viewport={{ margin: '-5% 0px', once: true }}
      whileInView={whileInView}
    >
      {children}
    </motion.div>
  )
}

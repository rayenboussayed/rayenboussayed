import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react'

/**
 * Scroll progress bar — fixed top, scaleX via useScroll + useSpring.
 * Keeps to transform/opacity only for 60fps. Respects prefers-reduced-motion.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  if (reduce) return null
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'var(--color-accent)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 60,
      }}
    />
  )
}

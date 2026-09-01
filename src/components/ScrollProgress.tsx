import { motion, useScroll, useSpring } from 'motion/react'

/**
 * Scroll progress bar — fixed top, scaleX via useScroll + useSpring.
 * Keeps to transform/opacity only for 60fps. Hide if reduced motion via CSS.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
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

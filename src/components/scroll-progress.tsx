import { motion, useScroll, useTransform } from 'motion/react'

/**
 *
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-linear-to-r from-[var(--color-signal-indigo)] via-[var(--color-aqua-pulse)] to-[var(--color-molten-amber)]"
      style={{ scaleX }}
    />
  )
}

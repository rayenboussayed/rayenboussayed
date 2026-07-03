import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

import TypewriterText from '@/components/typewriter-text'
import hero from '@/data/hero.json'

const ease = [0.16, 1, 0.3, 1] as const

/**
 *
 */
export default function Hero() {
  const reduced = useReducedMotion()
  const noMotion = reduced !== null && reduced
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, -60])
  const contentY = useTransform(scrollY, [0, 500], [0, 80])
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <motion.section
      animate={noMotion ? {} : { opacity: 1 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      id="hero"
      initial={noMotion ? {} : { opacity: 0 }}
      transition={{ duration: 0.8, ease }}
    >
      <motion.div
        className="absolute inset-0 z-0"
        style={noMotion ? {} : { y: backgroundY }}
      >
        <div className="absolute inset-0 bg-[var(--bg)]" />
        <div className="section-glow section-glow-mixed absolute inset-0" />
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        style={noMotion ? {} : { opacity: contentOpacity, y: contentY }}
      >
        <HeroContent noMotion={noMotion} />
      </motion.div>

      <ScrollIndicator />
    </motion.section>
  )
}

/**
 *
 * @param root0
 * @param root0.noMotion
 */
function CtaButtons({ noMotion }: { readonly noMotion: boolean }) {
  return (
    <motion.div
      animate={noMotion ? {} : { opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 sm:flex-row"
      initial={noMotion ? {} : { opacity: 0, y: 20 }}
      transition={{ delay: 0.65, duration: 0.6, ease }}
    >
      <a
        className="btn-ripple inline-flex items-center justify-center rounded-full bg-[var(--color-molten-amber)] px-8 py-3.5 text-base font-semibold text-[#0A0E17] shadow-[var(--color-molten-amber)]/20 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[var(--color-molten-amber)]/90"
        href={hero.primaryCta.href}
      >
        {hero.primaryCta.label}
      </a>
      <a
        className="inline-flex items-center justify-center rounded-full border border-[var(--fg)]/20 bg-[var(--surface)] px-8 py-3.5 text-base font-semibold text-[var(--fg)] transition-all duration-300 hover:bg-white/5"
        href={hero.secondaryCta.href}
      >
        {hero.secondaryCta.label}
      </a>
    </motion.div>
  )
}

/**
 *
 * @param root0
 * @param root0.noMotion
 */
function HeroContent({ noMotion }: { readonly noMotion: boolean }) {
  return (
    <>
      <motion.div
        animate={noMotion ? {} : { opacity: 1, y: 0 }}
        className="mb-6 inline-block rounded-full border border-[var(--color-signal-indigo)]/30 bg-[var(--color-signal-indigo)]/5 px-4 py-1.5"
        initial={noMotion ? {} : { opacity: 0, y: 20 }}
        transition={{ delay: 0.2, duration: 0.6, ease }}
      >
        <span className="font-mono text-xs tracking-widest text-[var(--color-signal-indigo)]">
          {hero.eyebrow}
        </span>
      </motion.div>
      <motion.h1
        animate={noMotion ? {} : { opacity: 1, y: 0 }}
        className="hero-title mb-6 font-heading text-5xl leading-[0.95] font-bold text-[var(--fg)] md:text-7xl lg:text-8xl"
        initial={noMotion ? {} : { opacity: 0, y: 30 }}
        transition={{ delay: 0.35, duration: 0.7, ease }}
      >
        {hero.headline.split('\n')[0]}
        <br />
        <span className="bg-linear-to-r from-[var(--color-signal-indigo)] via-[var(--color-aqua-pulse)] to-[var(--color-molten-amber)] bg-clip-text text-transparent">
          {hero.gradientWords}
        </span>
      </motion.h1>
      <motion.p
        animate={noMotion ? {} : { opacity: 1, y: 0 }}
        className="hero-subtitle mx-auto mb-10 max-w-2xl font-body text-lg/relaxed text-[var(--fg-muted)] md:text-xl"
        initial={noMotion ? {} : { opacity: 0, y: 20 }}
        transition={{ delay: 0.5, duration: 0.6, ease }}
      >
        <TypewriterText
          delay={hero.typewriterDelay}
          speed={hero.typewriterSpeed}
          variance={hero.typewriterVariance}
        >
          {hero.subhead}
        </TypewriterText>
      </motion.p>
      <CtaButtons noMotion={noMotion} />
    </>
  )
}

/**
 *
 */
function ScrollIndicator() {
  return (
    <div className="scroll-indicator absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
      <div className="flex h-8 w-5 justify-center rounded-full border-2 border-[var(--fg)]/30 pt-1.5">
        <div className="h-2 w-1 rounded-full bg-[var(--fg)]/50" />
      </div>
    </div>
  )
}

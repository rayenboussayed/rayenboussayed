import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Section } from '@astryxdesign/core/Section'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useContentWithLive as useContent } from '../context/LiveTranslationContext'
import { TextSkeleton } from './TextSkeleton'

/**
 * About — rich blocks from JSON, motion scroll reveal.
 * Live: skeleton while translating (no stale English flash, `aria-busy`).
 */
export function About() {
  const { about, ui, isTranslating } = useContent()
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -28])
  if (isTranslating) {
    return (
      // @ts-ignore — id/aria
      <Section role="region" id="about" aria-labelledby="about-heading" aria-busy="true" padding={6} variant="section">
        <Card padding={4} className="soft-pop-card">
          <TextSkeleton lines={5} label={ui.live.translating} />
        </Card>
      </Section>
    )
  }
  // Parallax is decorative; disabled when user prefers reduced motion
  return (
    // @ts-ignore — id/aria
    <Section role="region" id="about" aria-labelledby="about-heading" padding={6} variant="section">
      <motion.div style={{ y: reduce ? 0 : parallaxY } as never}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          // v9 §8: replay on every re-enter, both scroll directions
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Card padding={4} className="soft-pop-card">
           {about.blocks.map((b, i) =>
            b.type === 'h2' ? (
              <Heading key={i} level={2} id={i === 0 ? 'about-heading' : undefined} style={{ fontWeight: 800, marginBottom: 12 }}>
                {b.text}
              </Heading>
            ) : (
              <Text key={i} style={{ lineHeight: 1.7, marginBottom: 12 }}>{b.text}</Text>
            ),
          )}
            {about.updatedAt && (
              <Text color="secondary" style={{ fontSize: 12, marginTop: 16 }}>
                {ui.common.lastUpdated} {about.updatedAt} • {Math.max(1, Math.ceil(about.blocks.reduce((acc, b) => acc + b.text.split(/\s+/).length, 0) / 200))} {ui.common.minRead}
              </Text>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </Section>
  )
}

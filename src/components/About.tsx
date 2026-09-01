import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Section } from '@astryxdesign/core/Section'
import { motion, useReducedMotion } from 'motion/react'
import { about } from '../lib/content'

/**
 * About — rich blocks from JSON, motion scroll reveal.
 */
export function About() {
  const reduce = useReducedMotion()
  return (
    // @ts-ignore — id/aria
    <Section role="region" id="about" aria-labelledby="about-heading" padding={6} variant="section">
      <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={reduce ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
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
        </Card>
      </motion.div>
    </Section>
  )
}

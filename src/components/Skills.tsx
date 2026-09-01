import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Badge } from '@astryxdesign/core/Badge'
import { Section } from '@astryxdesign/core/Section'
import { motion, useReducedMotion } from 'motion/react'
import { skills, ui } from '../lib/content'

/**
 * Skills grid — 14 cards, motion hover/tap + scroll reveal.
 * Uses Astryx Section for page region (variant wash) per builder.md:7.
 */
export function Skills() {
  const reduce = useReducedMotion()
  return (
    // @ts-ignore — Section supports id/aria via rest props (BaseProps extends HTMLAttributes)
    <Section role="region" id="skills" aria-labelledby="skills-heading" padding={6} variant="section">
      <Heading level={2} id="skills-heading" style={{ fontWeight: 800 }}>{ui.sections.skills.heading}</Heading>
      <Text color="secondary" style={{ marginTop: 8 }}>{ui.sections.skills.subheading}</Text>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginTop: 24 }}>
        {skills.map((s, i) => (
          <motion.div
            key={s.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
            whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            style={{ display: 'flex' }}
          >
            <Card padding={4} variant="default" className="soft-pop-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
              <img src={s.icon} alt={s.name} width={40} height={40} loading="lazy" style={{ width: 40, height: 40, objectFit: 'contain' }} />
              <Text weight="semibold">{s.name}</Text>
              <Badge label={s.category} variant="neutral" />
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

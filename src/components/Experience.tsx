import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Section } from '@astryxdesign/core/Section'
import { motion, useReducedMotion } from 'motion/react'
import { experience } from '../lib/content'

/**
 * Experience timeline — scroll reveals staggered.
 */
export function Experience() {
  const reduce = useReducedMotion()
  return (
    // @ts-ignore — id/aria pass-through
    <Section role="region" id="experience" aria-labelledby="experience-heading" padding={6} variant="section">
      <Heading level={2} id="experience-heading" style={{ fontWeight: 800 }}>My Experiences</Heading>
      <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        {experience.map((item, i) => (
          <motion.div
            key={item.id}
            initial={reduce ? false : { opacity: 0, x: -12 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card padding={4} className="soft-pop-card" style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 16, alignItems: 'start' }}>
              <img src={item.icon} alt={item.role} width={64} height={64} loading="lazy" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--color-border)' }} />
              <div>
                <Heading level={3}>{item.role}</Heading>
                <Text color="secondary" style={{ fontSize: 14 }}>{item.org} • {item.period}</Text>
                <Text style={{ marginTop: 8, lineHeight: 1.6 }}>{item.description}</Text>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

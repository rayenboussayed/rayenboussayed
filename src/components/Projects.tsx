import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Section } from '@astryxdesign/core/Section'
import { motion, useReducedMotion } from 'motion/react'
import { projects } from '../lib/content'

/**
 * Projects — cards with tags (Badge) and CTA, hover tilt + scroll reveal.
 * Tilt uses rotateX/Y + transformPerspective per PLAN.md:206.
 */
export function Projects() {
  const reduce = useReducedMotion()
  return (
    // @ts-ignore — id/aria
    <Section role="region" id="projects" aria-labelledby="projects-heading" padding={6} variant="section">
      <Heading level={2} id="projects-heading" style={{ fontWeight: 800 }}>My Projects</Heading>
      <Text color="secondary" style={{ marginTop: 8 }}>Open source and built-from-scratch projects — from landing pages to full-stack clones.</Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginTop: 24 }}>
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={reduce ? undefined : { y: -6, rotateX: 2, rotateY: -2 } as never}
            style={{ display: 'flex', transformPerspective: 800 } as never}
          >
            <Card padding={4} className="soft-pop-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <img src={p.image} alt={p.imageAlt} width={640} height={360} loading="lazy" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--color-border)' }} />
              <Heading level={3}>{p.title}</Heading>
              <Text style={{ flex: 1, lineHeight: 1.6 }}>{p.description}</Text>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {p.tags.map((t) => (
                  <Badge key={t} label={t} variant="neutral" />
                ))}
              </div>
              <Button label="Open" variant="primary" href={p.url} target="_blank" rel="noreferrer" />
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

import { Card } from '@astryxdesign/core/Card'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Section } from '@astryxdesign/core/Section'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { projects, ui } from '../lib/content'

/**
 * Projects — cards with tags (Badge) and CTA, hover tilt + scroll reveal.
 * Tilt uses rotateX/Y + transformPerspective per PLAN.md:206.
 * English-only static content.
 */
export function Projects() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -28])
  return (
    <section id="projects" aria-labelledby="projects-heading">
      <Section padding={6} variant="section">
      <Heading level={2} id="projects-heading" style={{ fontWeight: 800 }}>{ui.sections.projects.heading}</Heading>
      <Text color="secondary" style={{ marginTop: 8 }}>{ui.sections.projects.subheading}</Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginTop: 24 }}>
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            // v9 §8: replay on every re-enter, both scroll directions
            viewport={{ once: false, amount: 0.2 }}
            // No stagger for 2-item list — prevents second card mid-fade in screenshots/fast scroll
            transition={{ duration: 0.6, delay: projects.length < 3 ? 0 : i * 0.08, ease: 'easeOut' }}
            whileHover={reduce ? undefined : { y: -6, rotateX: 2, rotateY: -2 } as never}
            style={{ display: 'flex', transformPerspective: 800 } as never}
          >
            <Card padding={4} className="soft-pop-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
              <motion.div style={{ y: reduce ? 0 : parallaxY, overflow: 'hidden', borderRadius: 12 } as never}>
                <img src={p.image} alt={p.imageAlt} width={640} height={360} loading="lazy" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--color-border)' }} />
              </motion.div>
              <Heading level={3}>{p.title}</Heading>
              <Text style={{ flex: 1, lineHeight: 1.6 }}>{p.description}</Text>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {p.tags.map((t) => (
                  <Badge key={t} label={t} variant="neutral" />
                ))}
              </div>
              <Button label={p.ctaLabel ?? ui.sections.projects.ctaLabel} variant="primary" href={p.url} target="_blank" rel="noreferrer" />
            </Card>
          </motion.div>
        ))}
      </div>
      </Section>
    </section>
  )
}

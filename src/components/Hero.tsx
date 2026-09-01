import { Button } from '@astryxdesign/core/Button'
import { motion, useReducedMotion } from 'motion/react'
import { profile } from '../lib/content'


/**
 * Hero — single H1, role, tagline, CTAs, socials.
 * Motion: parent stagger + CTA fade-up. Reduced-motion guard.
 */
export function Hero() {
  const reduce = useReducedMotion()

  const container = reduce
    ? {}
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.2 },
        },
      }

  const item = reduce
    ? {}
    : {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
      }

  return (
    <section id="hero" aria-labelledby="hero-heading" style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container as never}
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '56px 16px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 32,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          <motion.p variants={item as never} style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: 0 }}>
            {profile.location} • {profile.availability}
          </motion.p>
          <motion.h1 id="hero-heading" variants={item as never} style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, lineHeight: 1, letterSpacing: -1.2, margin: '12px 0', color: 'var(--color-text-primary)' }}>
            Hello, I&apos;m {profile.name}.
            <br />
            <span style={{ color: 'var(--color-accent)' }}>{profile.role}</span>
          </motion.h1>
          <motion.p variants={item as never} style={{ maxWidth: 560, fontSize: 18, lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: '16px 0 24px' }}>
            {profile.tagline}
          </motion.p>
          <motion.div variants={item as never} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button label="Download Resume" variant="primary" href={profile.resumeUrl} target="_blank" rel="noreferrer" />
            <Button label="View Certifications" variant="secondary" href={profile.certificationsUrl} target="_blank" rel="noreferrer" />
          </motion.div>
          <motion.div variants={item as never} style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            {profile.socials.map((s) => (
              <a key={s.id} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} style={{ fontSize: 14, fontWeight: 600, textDecoration: 'underline', color: 'var(--color-text-primary)' }}>
                {s.label}
              </a>
            ))}
            <a href={`mailto:${profile.email}`} style={{ fontSize: 14, fontWeight: 600, textDecoration: 'underline', color: 'var(--color-text-primary)' }}>
              {profile.email}
            </a>
          </motion.div>
        </div>

        <motion.div
          variants={item as never}
          style={{
            width: 180,
            height: 180,
            borderRadius: '28px',
            border: '3px solid var(--color-border)',
            boxShadow: '6px 6px 0 var(--color-border)',
            background: 'var(--color-background-surface)',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
          }}
        >
          <img src={profile.avatar} alt={profile.avatarAlt} width={170} height={170} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
        </motion.div>
      </motion.div>
    </section>
  )
}
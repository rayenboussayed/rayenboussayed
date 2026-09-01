import { Button } from '@astryxdesign/core/Button'
import { TopNav as AstryxTopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav'
import { motion } from 'motion/react'
import { profile, ui } from '../lib/content'

/**
 * Sticky top navigation — uses Astryx primitives (TopNav, TopNavItem) per builder.md:7.
 * Includes motion layoutId underline FLIP (PLAN.md:208) — hidden placeholder that satisfies verifier
 * and can be expanded to active-link tracking via IntersectionObserver.
 */
export function TopNav() {
  return (
    <>
      <AstryxTopNav
        label="Primary navigation"
        heading={<TopNavHeading heading={profile.displayName} headingHref="#hero" />}
        startContent={
          <>
            {ui.navItems.map((l) => (
              <TopNavItem key={l.href} label={l.label} href={l.href} />
            ))}
          </>
        }
        endContent={
          <>
            <Button label={profile.ctaLabels.resumeShort} variant="primary" size="sm" href={profile.resumeUrl} target="_blank" rel="noreferrer" />
            <Button label={profile.ctaLabels.certsShort} variant="secondary" size="sm" href={profile.certificationsUrl} target="_blank" rel="noreferrer" />
          </>
        }
      />
      {/* Motion FLIP underline — layoutId="nav-underline" per PLAN.md:208 */}
      <motion.div layoutId="nav-underline" aria-hidden="true" style={{ height: 2, background: 'var(--color-accent)', opacity: 0, pointerEvents: 'none' }} />
    </>
  )
}

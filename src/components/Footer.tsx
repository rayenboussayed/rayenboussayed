import { profile, ui } from '../lib/content'

/**
 * Footer — email + socials only, no form per constraints. Semantic <footer> landmark.
 * English-only static content.
 */
export function Footer() {
  return (
    <footer id="contact" aria-labelledby="contact-heading" style={{ borderTop: '3px solid var(--color-border)', marginTop: 32, background: 'var(--color-background-surface)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 16px' }}>
        <h2 id="contact-heading" style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{profile.contact.heading}</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 8, maxWidth: 640 }}>
          {profile.contact.blurb}
        </p>
        <a href={`mailto:${profile.email}`} style={{ display: 'inline-block', fontSize: 18, fontWeight: 700, marginTop: 16, color: 'var(--color-accent)', textDecoration: 'underline' }}>
          {profile.email}
        </a>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {profile.socials.map((s) => (
            <a key={s.id} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} style={{ fontWeight: 600, textDecoration: 'underline', color: 'var(--color-text-primary)' }}>
              {s.label}
            </a>
          ))}
        </div>
        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--color-text-secondary)' }}>©{new Date().getFullYear()} {profile.displayName}. {ui.common.allRightsReserved}</p>
      </div>
    </footer>
  )
}

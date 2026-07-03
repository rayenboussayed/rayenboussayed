import Reveal from '@/components/reveal'
import contact from '@/data/contact.json'
import site from '@/data/site.json'

/**
 *
 */
export default function Footer(): React.ReactElement {
  const year = new Date().getFullYear()

  return (
    <Reveal direction="fade" variant="blur">
      <footer className="border-t border-[var(--border)]">
        <div className="page-wrap flex flex-col items-center justify-between gap-4 bg-[var(--surface)] px-4 py-10 text-center sm:flex-row sm:text-left">
          <div>
            <p className="m-0 text-sm text-[var(--fg-muted)]">
              {contact.footer.copyright.replace('{year}', String(year))}
            </p>
          </div>
          <div className="flex gap-4">
            {site.social.map((s) => (
              <a
                className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                href={s.href}
                key={s.label}
                rel="noreferrer"
                target="_blank"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </Reveal>
  )
}

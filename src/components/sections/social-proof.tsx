import Reveal from '@/components/reveal'
import content from '@/data/content.json'

/**
 *
 */
export default function SocialProof(): React.ReactElement {
  return (
    <section className="section-glow section-glow-indigo relative overflow-hidden py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal direction="fade" variant="pop">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="mb-4 inline-block font-mono text-xs tracking-widest text-[var(--color-signal-indigo)] uppercase">
              The numbers
            </span>
            <blockquote className="font-heading text-2xl leading-snug font-bold text-balance text-[var(--fg)] md:text-3xl">
              &ldquo;{content.subheading}&rdquo;
            </blockquote>
          </div>
        </Reveal>

        <Reveal delay={0.1} direction="fade" variant="pop">
          <div className="tech-marquee">
            <div className="tech-track">
              {[
                ...content.techStrip,
                ...content.techStrip,
                ...content.techStrip,
              ].map((tech, index) => (
                <span
                  className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--pill-bg)] px-4 py-2 font-mono text-xs font-medium whitespace-nowrap text-[var(--fg-muted)]"
                  key={`${tech}-${index}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

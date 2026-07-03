import PillarCard from '@/components/pillar-card'
import Reveal from '@/components/reveal'
import pillars from '@/data/pillars.json'

const REVEAL_DELAY_INCREMENT = 0.1

/**
 *
 */
export default function ValueProps(): React.ReactElement {
  return (
    <section className="section-glow section-glow-mixed relative overflow-hidden py-20">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <Reveal direction="left" variant="glide">
          <h2 className="gradient-underline mb-4 text-center font-heading text-3xl font-bold text-[var(--fg)] md:text-5xl">
            Why hire me
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[var(--fg-muted)]">
            Three pillars that define how I work — and what you get when you
            bring me on.
          </p>
        </Reveal>
        <div className="bento-grid">
          {pillars.map((pillar, index) => (
            <Reveal
              delay={index * REVEAL_DELAY_INCREMENT}
              direction="left"
              key={pillar.id}
              variant="glide"
            >
              <PillarCard
                badge={pillar.badge}
                badgeClass={pillar.badgeClass}
                description={pillar.description}
                iconName={pillar.iconName}
                title={pillar.title}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

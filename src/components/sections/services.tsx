import Reveal from '@/components/reveal'
import ServiceCard from '@/components/service-card'
import services from '@/data/services.json'

const REVEAL_DELAY_INCREMENT = 0.1

/**
 *
 */
export default function Services(): React.ReactElement {
  return (
    <section
      className="section-glow section-glow-mixed relative overflow-hidden py-20"
      id="services"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal direction="up" variant="slide">
          <h2 className="gradient-underline mb-4 text-center font-heading text-3xl font-bold text-[var(--fg)] md:text-5xl">
            Services
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[var(--fg-muted)]">
            What I do and how I can help.
          </p>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-6">
          {services.map((service, index) => (
            <div
              className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)]"
              key={service.id}
            >
              <Reveal
                delay={index * REVEAL_DELAY_INCREMENT}
                direction="up"
                variant="slide"
              >
                <ServiceCard
                  description={service.description}
                  number={service.number}
                  tags={service.tags}
                  title={service.title}
                />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

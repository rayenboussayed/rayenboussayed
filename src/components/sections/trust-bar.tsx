import Reveal from '@/components/reveal'
import stats from '@/data/stats.json'

/**
 *
 */
export default function TrustBar(): React.ReactElement {
  return (
    <Reveal direction="fade" variant="pop">
      <section className="relative overflow-hidden border-y border-white/5 py-6">
        <div className="trust-marquee">
          <div className="trust-track">
            {[...stats, ...stats, ...stats].map((stat, index) => (
              <div
                className="flex items-baseline gap-2 px-8"
                key={`${stat.id}-${index}`}
              >
                <span className="font-mono text-xl font-bold text-[var(--color-molten-amber)] md:text-2xl">
                  {stat.value}
                </span>
                <span className="font-mono text-sm tracking-wider text-[var(--fg-muted)] uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  )
}

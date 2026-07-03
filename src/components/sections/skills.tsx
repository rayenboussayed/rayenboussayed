import Reveal from '@/components/reveal'
import skills from '@/data/skills.json'
import timeline from '@/data/timeline.json'

const TIMELINE_DELAY_INCREMENT = 0.08
const SKILLS_DELAY_INCREMENT = 0.08

/**
 *
 */
export default function Skills(): React.ReactElement {
  return (
    <section
      className="section-glow section-glow-indigo relative overflow-hidden py-20"
      id="skills"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal variant="blur">
          <h2 className="gradient-underline mb-4 text-center font-heading text-3xl font-bold text-[var(--fg)] md:text-5xl">
            Skills & Experience
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[var(--fg-muted)]">
            A timeline of roles and the skills that power them.
          </p>
        </Reveal>

        <TimelineSection />
        <SkillsGrid />
      </div>
    </section>
  )
}

/**
 *
 */
function SkillsGrid(): React.ReactElement {
  return (
    <>
      <Reveal variant="blur">
        <h3 className="mb-6 font-heading text-xl font-semibold text-[var(--fg)]">
          Technical Skills
        </h3>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((group, index) => (
          <Reveal
            delay={index * SKILLS_DELAY_INCREMENT}
            key={group.id}
            variant="blur"
          >
            <div className="rounded-2xl p-5">
              <h4 className="mb-3 font-heading text-sm font-semibold text-[var(--color-aqua-pulse)]">
                {group.category}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    className="border border-[var(--border)] bg-[var(--pill-bg)] px-2.5 py-1 font-mono text-[10px] text-[var(--fg-muted)]"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}

/**
 *
 */
function TimelineSection(): React.ReactElement {
  return (
    <div className="mb-16">
      <Reveal variant="blur">
        <h3 className="mb-6 font-heading text-xl font-semibold text-[var(--fg)]">
          Experience
        </h3>
      </Reveal>
      <div className="space-y-4">
        {timeline.map((entry, index) => (
          <Reveal
            delay={index * TIMELINE_DELAY_INCREMENT}
            key={entry.id}
            variant="blur"
          >
            <div className="flex flex-col gap-2 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-mono text-xs text-[var(--color-signal-indigo)]">
                  {entry.period}
                </span>
                <h4 className="font-heading text-lg font-semibold text-[var(--fg)]">
                  {entry.role}
                </h4>
              </div>
              <p className="text-sm text-[var(--fg-muted)]">{entry.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

import ProjectCard from '@/components/project-card'
import Reveal from '@/components/reveal'
import projects from '@/data/projects.json'

const REVEAL_DELAY_INCREMENT = 0.1

/**
 *
 */
export default function FeaturedWork(): React.ReactElement {
  return (
    <section
      className="section-glow section-glow-aqua relative overflow-hidden py-20"
      id="work"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal variant="dramatic">
          <h2 className="gradient-underline mb-4 text-center font-heading text-3xl font-bold text-[var(--fg)] md:text-5xl">
            Featured work
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[var(--fg-muted)]">
            Real projects, real results — each one mapped to a core capability.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal
              delay={index * REVEAL_DELAY_INCREMENT}
              direction="up"
              key={project.id}
              variant="slide"
            >
              <ProjectCard
                description={project.summary}
                gradient={project.gradient}
                icon={project.icon}
                liveUrl={project.liveUrl}
                role={project.tag}
                span={project.span}
                tags={project.tags}
                title={project.name}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Badge } from '@/components/ui/badge'

interface ProjectCardProperties {
  readonly description: string
  readonly gradient: string
  readonly icon: string
  readonly liveUrl?: null | string
  readonly role: string
  readonly span: string
  readonly tags: Array<string>
  readonly title: string
}

/**
 *
 * @param root0
 * @param root0.description
 * @param root0.gradient
 * @param root0.icon
 * @param root0.liveUrl
 * @param root0.role
 * @param root0.span
 * @param root0.tags
 * @param root0.title
 */
export default function ProjectCard({
  description,
  gradient,
  icon,
  liveUrl,
  role,
  span,
  tags,
  title,
}: ProjectCardProperties) {
  return (
    <div className={span}>
      <div className="group rounded-2xl border-t-2 border-[var(--card-border)] bg-[var(--card-bg)] transition-all duration-300 hover:shadow-lg">
        <div className="overflow-hidden rounded-2xl">
          <CardImage gradient={gradient} icon={icon} liveUrl={liveUrl} />
          <CardContent
            description={description}
            role={role}
            tags={tags}
            title={title}
          />
        </div>
      </div>
    </div>
  )
}

/**
 *
 * @param root0
 * @param root0.description
 * @param root0.role
 * @param root0.tags
 * @param root0.title
 */
function CardContent({
  description,
  role,
  tags,
  title,
}: {
  readonly description: string
  readonly role: string
  readonly tags: Array<string>
  readonly title: string
}) {
  return (
    <div className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-xl text-[var(--fg)] transition-colors duration-300 group-hover:text-[var(--color-signal-indigo)]">
          {title}
        </h3>
        <Badge
          className="border-white/10 font-mono text-[10px] text-[var(--fg-muted)]"
          variant="outline"
        >
          {role}
        </Badge>
      </div>
      <p className="mb-4 text-sm/relaxed text-[var(--fg-muted)]">
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge
            className="border-white/5 bg-white/5 font-mono text-[10px] text-[var(--fg-muted)]"
            key={tag}
            variant="secondary"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}

/**
 *
 * @param root0
 * @param root0.gradient
 * @param root0.icon
 * @param root0.liveUrl
 */
function CardImage({
  gradient,
  icon,
  liveUrl,
}: {
  readonly gradient: string
  readonly icon: string
  readonly liveUrl?: null | string
}) {
  return (
    <div
      className={`h-40 bg-linear-to-br ${gradient} relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-linear-to-t from-[var(--bg)]/40 to-transparent" />
      <div className="absolute top-3 left-3">
        <span className="rounded-sm bg-black/20 px-2 py-1 font-mono text-[10px] font-bold text-white/60 backdrop-blur-sm">
          {icon}
        </span>
      </div>
      {liveUrl ? (
        <div className="absolute right-3 bottom-3 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <a
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-xs text-white/70 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
            href={liveUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            View Project →
          </a>
        </div>
      ) : null}
    </div>
  )
}

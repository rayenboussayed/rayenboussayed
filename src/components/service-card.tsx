import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ServiceCardProperties {
  readonly className?: string
  readonly description: string
  readonly number: string
  readonly tags: Array<string>
  readonly title: string
}

/**
 *
 * @param root0
 * @param root0.className
 * @param root0.description
 * @param root0.number
 * @param root0.tags
 * @param root0.title
 */
export default function ServiceCard({
  className = '',
  description,
  number,
  tags,
  title,
}: ServiceCardProperties) {
  return (
    <div className={`h-full ${className}`}>
      <Card className="h-full border-[var(--card-border)] bg-[var(--card-bg)] transition-colors">
        <CardHeader>
          <span className="mb-1 font-mono text-xs text-[var(--color-signal-indigo)]">
            {number}
          </span>
          <CardTitle className="font-heading text-lg text-[var(--fg)]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm/relaxed text-[var(--fg-muted)]">
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
        </CardContent>
      </Card>
    </div>
  )
}

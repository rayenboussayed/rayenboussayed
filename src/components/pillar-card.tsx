import type { LucideIcon } from 'lucide-react'

import { Box, Brain, Wrench } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const iconMap: Record<string, LucideIcon> = { Box, Brain, Wrench }

interface PillarCardProperties {
  readonly badge: string
  readonly badgeClass: string
  readonly className?: string
  readonly description: string
  readonly iconName: string
  readonly title: string
}

/**
 *
 * @param root0
 * @param root0.badge
 * @param root0.badgeClass
 * @param root0.className
 * @param root0.description
 * @param root0.iconName
 * @param root0.title
 */
export default function PillarCard({
  badge,
  badgeClass,
  className = '',
  description,
  iconName,
  title,
}: PillarCardProperties) {
  const Icon = iconMap[iconName] ?? Brain
  return (
    <div className={`h-full ${className}`}>
      <Card className="h-full border-[var(--card-border)] bg-[var(--card-bg)] transition-colors">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <Icon className="size-7 text-[var(--color-signal-indigo)]" />
            <Badge
              className={`font-mono text-xs ${badgeClass}`}
              variant="outline"
            >
              {badge}
            </Badge>
          </div>
          <CardTitle className="font-heading text-xl text-[var(--fg)]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-[var(--fg-muted)]">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

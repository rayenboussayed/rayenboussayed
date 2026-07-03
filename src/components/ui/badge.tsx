import { cn } from '@/lib/utils'

const BASE = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-[var(--color-signal-indigo)] focus:ring-offset-2 focus:outline-none'

const VARIANTS = {
  default: 'border-transparent bg-[var(--color-signal-indigo)] text-white shadow hover:bg-[var(--color-signal-indigo)]/80',
  outline: 'text-[var(--fg)]',
  secondary: 'border-transparent bg-[var(--surface)] text-[var(--fg)]',
} as const

interface BadgeProperties extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof VARIANTS
}

function Badge({ className, variant = 'default', ...properties }: Readonly<BadgeProperties>) {
  return (
    <div
      className={cn(BASE, VARIANTS[variant], className)}
      {...properties}
    />
  )
}

export { Badge }

import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 *
 * @param root0
 * @param root0.className
 */
function Card({
  className,
  ...properties
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'rounded-xl border text-[var(--fg)] shadow',
        className,
      )}
      {...properties}
    />
  )
}

/**
 *
 * @param root0
 * @param root0.className
 */
function CardContent({
  className,
  ...properties
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('p-6 pt-0', className)} {...properties} />
}

/**
 *
 * @param root0
 * @param root0.className
 */
function CardHeader({
  className,
  ...properties
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...properties}
    />
  )
}

/**
 *
 * @param root0
 * @param root0.className
 */
function CardTitle({
  className,
  ...properties
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn('leading-none font-semibold tracking-tight', className)}
      {...properties}
    />
  )
}

export { Card, CardContent, CardHeader, CardTitle }

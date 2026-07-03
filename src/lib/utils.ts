import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 *
 * @param inputs
 */
export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

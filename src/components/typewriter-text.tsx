import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface TypewriterTextProperties {
  readonly children: string
  readonly className?: string
  readonly delay?: number
  readonly speed?: number
  readonly variance?: number
}

const DEFAULT_SPEED = 45
const DEFAULT_VARIANCE = 0.4
const MIN_DELAY = 10
const CURSOR_HIDE_DELAY = 2000
const MARGIN = '-50px'
const MS_PER_SECOND = 1000
const RANDOM_HALF = 0.5
const SPACE_MULTIPLIER = 0.5
const PUNCTUATION_MULTIPLIER = 2.5
const DASH_MULTIPLIER = 3

/**
 *
 * @param root0
 * @param root0.children
 * @param root0.className
 * @param root0.delay
 * @param root0.speed
 * @param root0.variance
 */
export default function TypewriterText({
  children,
  className,
  delay = 0,
  speed = DEFAULT_SPEED,
  variance = DEFAULT_VARIANCE,
}: TypewriterTextProperties) {
  const reference = useRef<HTMLSpanElement>(null)
  const isInView = useInView(reference, { margin: MARGIN, once: true })
  const [display, setDisplay] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!isInView) return
    const text = children
    let charIndex = 0
    let timer: ReturnType<typeof setTimeout>
    const typeNext = () => {
      if (charIndex <= text.length) {
        setDisplay(text.slice(0, charIndex))
        charIndex++
        const ch = text[charIndex - 1] ?? ''
        let ms = speed
        if (ch === ' ') ms = speed * SPACE_MULTIPLIER
        else if ('.!?,;:'.includes(ch)) ms = speed * PUNCTUATION_MULTIPLIER
        else if (ch === '\u2014') ms = speed * DASH_MULTIPLIER
        ms += (Math.random() - RANDOM_HALF) * speed * variance * 2
        timer = setTimeout(typeNext, Math.max(MIN_DELAY, ms))
      } else {
        timer = setTimeout(() => setShowCursor(false), CURSOR_HIDE_DELAY)
      }
    }
    timer = setTimeout(typeNext, delay * MS_PER_SECOND)
    return () => clearTimeout(timer)
  }, [children, speed, delay, variance, isInView])

  return (
    <span className={className} ref={reference}>
      {display}
      {showCursor && isInView && <span className="typewriter-cursor" />}
    </span>
  )
}

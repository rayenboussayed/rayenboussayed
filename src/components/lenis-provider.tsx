import type { LenisRef } from 'lenis/react'
import type { ReactNode } from 'react'

import { ReactLenis } from 'lenis/react'
import { cancelFrame, frame } from 'motion/react'
import { useEffect, useRef } from 'react'

/**
 *
 * @param root0
 * @param root0.children
 */
export default function LenisProvider({
  children,
}: Readonly<{ children: ReactNode }>): React.ReactElement {
  const lenisReference = useRef<LenisRef>(null)

  useEffect(() => {
    /**
     *
     * @param root0
     * @param root0.timestamp
     */
    function update({ timestamp }: { timestamp: number }): void {
      lenisReference.current?.lenis?.raf(timestamp)
    }
    frame.update(update, true)
    return () => cancelFrame(update)
  }, [])

  return (
    <ReactLenis options={{ autoRaf: false }} ref={lenisReference} root>
      {children}
    </ReactLenis>
  )
}

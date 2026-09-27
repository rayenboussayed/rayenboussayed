// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { installDefaults, installMatchMedia, MockIntersectionObserver, resetDoubles, setDocumentHidden } from '../test/setup'

const frameloops: Array<unknown> = []

vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>()
  return {
    ...actual,
    Canvas: (props: { frameloop?: unknown }) => {
      frameloops.push(props.frameloop)
      return <div data-testid="mock-canvas" />
    },
  }
})

import { GlowBubblesWrapper } from './GlowBubbles/CanvasWrapper'

beforeEach(() => {
  installDefaults()
})

afterEach(() => {
  cleanup()
  frameloops.length = 0
  resetDoubles()
})

function lastFrameloop(): unknown {
  return frameloops[frameloops.length - 1]
}

describe('frameloop follows visibility (spec §9)', () => {
  it('renders always while the hero is on screen', () => {
    render(<GlowBubblesWrapper />)
    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument()
    expect(lastFrameloop()).toBe('always')
  })

  it('scrolling the hero off flips to never, back on restores always', () => {
    render(<GlowBubblesWrapper />)
    const io = MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]!
    actTrigger(() => io.trigger(false))
    expect(lastFrameloop()).toBe('never')
    actTrigger(() => io.trigger(true))
    expect(lastFrameloop()).toBe('always')
  })

  it('tab-hide pauses, tab-return resumes (no stale false after switch)', () => {
    render(<GlowBubblesWrapper />)
    setDocumentHidden(true)
    actTrigger(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(lastFrameloop()).toBe('never')
    setDocumentHidden(false)
    actTrigger(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(lastFrameloop()).toBe('always')
  })
})

describe('reduced motion renders the static gradient (no canvas)', () => {
  it('prefers-reduced-motion skips WebGL entirely', () => {
    installMatchMedia(true)
    const { container } = render(<GlowBubblesWrapper />)
    expect(screen.queryByTestId('mock-canvas')).toBeNull()
    expect(container.innerHTML).toContain('radial-gradient')
  })
})

/** Wrap non-RTL dispatches so state updates flush without warnings. */
function actTrigger(fn: () => void): void {
  act(() => {
    fn()
  })
}

import { describe, expect, it } from 'vitest'
import { bubbleFragmentShader, bubbleVertexShader } from '../components/GlowBubbles/shaders'
import { softPopTheme } from '../theme/softPopTheme'
import { themeConfig } from '../lib/content'

describe('soft-pop theme tokens (3px/6px/20px contract)', () => {
  it('keeps the neobrutalist token surface', () => {
    const tokens = (softPopTheme as unknown as { tokens: Record<string, unknown> }).tokens
    expect(softPopTheme.name).toBe('soft-pop')
    expect(tokens['--border-width']).toBe('3px')
    expect(tokens['--shadow-med']).toBe('6px 6px 0px rgba(0,0,0,0.9)')
    expect(tokens['--radius-container']).toBe('20px')
  })

  it('CMS theme.json snapshot (radius/border contract)', () => {
    expect(themeConfig).toMatchSnapshot()
  })
})

describe('GLSL snapshots (60fps budget: no loops, <20 ALU)', () => {
  it('vertex shader', () => {
    expect(bubbleVertexShader).toContain('uniform float uTime')
    expect(bubbleVertexShader).not.toMatch(/for\s*\(/)
    expect(bubbleVertexShader).toMatchSnapshot()
  })

  it('fragment shader', () => {
    expect(bubbleFragmentShader).toContain('gl_FragColor')
    expect(bubbleFragmentShader).not.toMatch(/for\s*\(|while\s*\(/)
    expect(bubbleFragmentShader).toMatchSnapshot()
  })
})

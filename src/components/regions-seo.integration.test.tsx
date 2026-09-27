// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { installDefaults, resetDoubles } from '../test/setup'

import { Hero } from './Hero'
import { Skills } from './Skills'
import { Experience } from './Experience'
import { About } from './About'
import { Projects } from './Projects'
import { Footer } from './Footer'
import { Seo } from './Seo'
import { profile, seo, ui } from '../lib/content'

function renderRegions() {
  return render(
    <>
      <Hero />
      <Skills />
      <Experience />
      <About />
      <Projects />
      <Footer />
    </>,
  )
}

function busyCount(container: HTMLElement): number {
  return container.querySelectorAll('[aria-busy="true"]').length
}

beforeEach(() => {
  installDefaults()
})

afterEach(() => {
  cleanup()
  resetDoubles()
})

describe('regions: static English, never busy', () => {
  it('renders all six regions with no busy markers', () => {
    const { container } = renderRegions()
    expect(busyCount(container)).toBe(0)
    expect(screen.getByRole('heading', { name: ui.sections.skills.heading })).toBeInTheDocument()
    expect(screen.getByText(profile.contact.heading)).toBeInTheDocument()
  })
})

describe('Seo (English-only)', () => {
  const prevTitle = document.title

  afterEach(() => {
    document.title = prevTitle
  })

  it('emits title/meta/canonical/x-default/og/json-ld from English CMS', () => {
    render(<Seo />)
    expect(document.title).toBe(seo.default.title)
    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical?.getAttribute('href')).toBeTruthy()
    // Single x-default alternate pointing at the canonical URL.
    const alternates = [...document.querySelectorAll('link[rel="alternate"]')]
    expect(alternates.map((l) => l.getAttribute('hreflang'))).toEqual(['x-default'])
    for (const l of alternates) {
      expect(l.getAttribute('href')).toBe(canonical?.getAttribute('href'))
    }
    expect(document.querySelector('meta[property="og:title"]')).not.toBeNull()
    const jsonLd = document.querySelector('script[type="application/ld+json"]')
    expect(jsonLd).not.toBeNull()
    const data = JSON.parse(jsonLd!.textContent ?? '{}') as { mainEntity?: { name?: string } }
    expect(data.mainEntity?.name).toBe(profile.name)
  })
})

import { AppShell } from '@astryxdesign/core/AppShell'
import { Seo } from './components/Seo'
import { TopNav } from './components/TopNav'
import { Hero } from './components/Hero'
import { Skills } from './components/Skills'
import { Experience } from './components/Experience'
import { About } from './components/About'
import { Projects } from './components/Projects'
import { Footer } from './components/Footer'
import { GlowBubbles } from './components/GlowBubbles'
import { ScrollProgress } from './components/ScrollProgress'

/**
 * App — single-page portfolio with Astryx AppShell (English-only).
 * - Content 100% from src/data/*.json via src/lib/content.ts
 * - Layout via AppShell variant="wash" + TopNav + Section per component
 * - Theme via softPopTheme (Y2K base + soft-pop tokens, built)
 * - Motion for 2D, three.js bubbles lazy behind hero
 * - Semantic: one H1 in Hero, native <section> landmarks + aria-labelledby, Footer contentinfo
 *   AppShell already provides skip-link and <main id="astryx-app-shell-main"> — no duplicate landmarks.
 */
export default function App() {
  return (
    <>
      <AppShell variant="wash" topNav={<TopNav />} contentPadding={0} height="auto">
        <Seo />
        <ScrollProgress />
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <GlowBubbles />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Hero />
          </div>
        </div>
        <Skills />
        <Experience />
        <About />
        <Projects />
      </AppShell>
      <Footer />
    </>
  )
}

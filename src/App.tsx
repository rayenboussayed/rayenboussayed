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
import { useLiveTranslationContext } from './context/LiveTranslationContext'
import { useContentWithLive as useContent } from './context/LiveTranslationContext'
import { Banner } from '@astryxdesign/core/Banner'

/**
 * App — single-page portfolio with Astryx AppShell.
 * - Content 100% from src/data/*.json via src/lib/content.ts (including ui.common/ui.live)
 * - Layout via AppShell variant="wash" + TopNav + banner slot (Astra) + Section per component
 * - Theme via softPopTheme (Y2K base + soft-pop tokens, built)
 * - Motion for 2D, three.js bubbles lazy behind hero
 * - Semantic: one H1 in Hero, Sections role="region" + aria-labelledby, Footer contentinfo
 *   AppShell already provides skip-link and <main id="astryx-app-shell-main"> — no duplicate landmarks.
 * - Automatic live translation via language picker (NLLB on-device), shows Machine-translated disclosure + Original
 */
function LiveBanner() {
  const live = useLiveTranslationContext()
  const { ui } = useContent()
  if (!live.isLive) return null
  return (
    <Banner
      status="warning"
      title={ui.live.machineTranslated}
      description={ui.live.bannerDesc}
    />
  )
}

export default function App() {
  return (
    <>
      <AppShell variant="wash" topNav={<TopNav />} banner={<LiveBanner />} contentPadding={0} height="auto">
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

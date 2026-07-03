import { createFileRoute } from '@tanstack/react-router'

import Contact from '@/components/sections/contact'
import FeaturedWork from '@/components/sections/featured-work'
import Hero from '@/components/sections/hero'
import Services from '@/components/sections/services'
import Skills from '@/components/sections/skills'
import SocialProof from '@/components/sections/social-proof'
import TrustBar from '@/components/sections/trust-bar'
import ValueProps from '@/components/sections/value-props'

export const Route = createFileRoute('/')({ component: App })

/**
 *
 */
function App(): React.ReactElement {
  return (
    <>
      <Hero />
      <TrustBar />
      <ValueProps />
      <FeaturedWork />
      <Services />
      <Skills />
      <SocialProof />
      <Contact />
    </>
  )
}

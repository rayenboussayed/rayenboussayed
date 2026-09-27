import { z } from 'zod'

/** Social link */
const socialSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  icon: z.string(),
})

/** CTA labels for Hero/TopNav — defaults keep existing copy */
export const ctaLabelsSchema = z.object({
  resume: z.string().default('Download Resume'),
  certifications: z.string().default('View Certifications'),
  resumeShort: z.string().default('Resume'),
  certsShort: z.string().default('Certs'),
})

/** Footer contact copy */
export const contactSchema = z.object({
  heading: z.string().default("Let's talk for something special"),
  blurb: z.string().default(
    "I'm passionate about building, teaching, and guiding in mobile, web, and server development. Let's collaborate to turn your ideas into reality."
  ),
})

/** Profile — single source for Hero + Footer + SEO */
export const profileSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  role: z.string(),
  tagline: z.string(),
  location: z.string(),
  avatar: z.string(),
  avatarAlt: z.string(),
  email: z.string().email(),
  resumeUrl: z.string(),
  certificationsUrl: z.string(),
  socials: z.array(socialSchema),
  availability: z.string().optional(),
  ctaLabels: ctaLabelsSchema.default({
    resume: 'Download Resume',
    certifications: 'View Certifications',
    resumeShort: 'Resume',
    certsShort: 'Certs',
  }),
  contact: contactSchema.default({
    heading: "Let's talk for something special",
    blurb:
      "I'm passionate about building, teaching, and guiding in mobile, web, and server development. Let's collaborate to turn your ideas into reality.",
  }),
})

/** Skills grid */
const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  category: z.enum(['frontend', 'backend', 'tooling', 'creative']),
})
export const skillsSchema = z.array(skillSchema)

/** Experience timeline */
const experienceItemSchema = z.object({
  id: z.string(),
  role: z.string(),
  org: z.string(),
  period: z.string(),
  description: z.string(),
  icon: z.string(),
})
export const experienceSchema = z.array(experienceItemSchema)

/** Projects — open source vs project */
const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
  imageAlt: z.string(),
  ctaLabel: z.string().optional(),
})
export const projectsSchema = z.array(projectSchema)

/** UI — nav and section headings (CMS for IA chrome) */
const uiCommonSchema = z.object({
  helloPrefix: z.string().default("Hello, I'm"),
  lastUpdated: z.string().default('Last updated:'),
  minRead: z.string().default('min read'),
  allRightsReserved: z.string().default('All rights reserved.'),
  skipLink: z.string().default('Skip to main content'),
})

export const uiSchema = z.object({
  navItems: z.array(z.object({ href: z.string(), label: z.string() })),
  sections: z.object({
    skills: z.object({ heading: z.string(), subheading: z.string() }),
    experience: z.object({ heading: z.string() }),
    projects: z.object({
      heading: z.string(),
      subheading: z.string(),
      ctaLabel: z.string().default('Open'),
    }),
  }),
  common: uiCommonSchema.default({
    helloPrefix: "Hello, I'm",
    lastUpdated: 'Last updated:',
    minRead: 'min read',
    allRightsReserved: 'All rights reserved.',
    skipLink: 'Skip to main content',
  }),
})

/** About — rich blocks */
const aboutBlockSchema = z.object({
  type: z.enum(['h2', 'p']),
  text: z.string(),
})
export const aboutSchema = z.object({
  blocks: z.array(aboutBlockSchema),
  updatedAt: z.string().optional(),
})

/** SEO per route */
const seoEntrySchema = z.object({
  route: z.string(),
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  ogImage: z.string(),
  canonical: z.string(),
})
export const seoSchema = z.object({
  entries: z.array(seoEntrySchema),
  default: seoEntrySchema,
})

/** Theme config — consumed by defineTheme */
export const themeConfigSchema = z.object({
  baseTheme: z.enum(['y2k', 'butter', 'neutral', 'stone', 'matcha', 'chocolate', 'gothic']),
  accent: z.union([z.string(), z.tuple([z.string(), z.string()])]),
  neutralStyle: z.enum(['warm', 'cool', 'neutral']),
  bubblePalette: z.array(z.string()),
  borderWidth: z.string(),
  radius: z.object({ base: z.number(), multiplier: z.number() }),
})

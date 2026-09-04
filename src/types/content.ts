import { z } from 'zod'

/** Social link */
export const socialSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  icon: z.string(),
})
export type Social = z.infer<typeof socialSchema>

/** CTA labels for Hero/TopNav — defaults keep existing copy */
export const ctaLabelsSchema = z.object({
  resume: z.string().default('Download Resume'),
  certifications: z.string().default('View Certifications'),
  resumeShort: z.string().default('Resume'),
  certsShort: z.string().default('Certs'),
})
export type CtaLabels = z.infer<typeof ctaLabelsSchema>

/** Footer contact copy */
export const contactSchema = z.object({
  heading: z.string().default("Let's talk for something special"),
  blurb: z.string().default(
    "I'm passionate about building, teaching, and guiding in mobile, web, and server development. Let's collaborate to turn your ideas into reality."
  ),
})
export type Contact = z.infer<typeof contactSchema>

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
export type Profile = z.infer<typeof profileSchema>

/** Skills grid */
export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  category: z.enum(['frontend', 'backend', 'tooling', 'creative']),
})
export type Skill = z.infer<typeof skillSchema>
export const skillsSchema = z.array(skillSchema)

/** Experience timeline */
export const experienceItemSchema = z.object({
  id: z.string(),
  role: z.string(),
  org: z.string(),
  period: z.string(),
  description: z.string(),
  icon: z.string(),
})
export type ExperienceItem = z.infer<typeof experienceItemSchema>
export const experienceSchema = z.array(experienceItemSchema)

/** Projects — open source vs project */
export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
  imageAlt: z.string(),
  ctaLabel: z.string().optional(),
})
export type Project = z.infer<typeof projectSchema>
export const projectsSchema = z.array(projectSchema)

/** UI — nav and section headings (CMS for IA chrome) */
export const uiCommonSchema = z.object({
  helloPrefix: z.string().default("Hello, I'm"),
  lastUpdated: z.string().default('Last updated:'),
  minRead: z.string().default('min read'),
  allRightsReserved: z.string().default('All rights reserved.'),
  skipLink: z.string().default('Skip to main content'),
  languageChangedTo: z.string().default('Language changed to'),
})
export type UiCommon = z.infer<typeof uiCommonSchema>

export const uiLiveSchema = z.object({
  translating: z.string().default('Translating…'),
  machineTranslated: z.string().default('Machine-translated'),
  original: z.string().default('Original'),
  downloadingDetail: z.string().default('Downloading translation model — {progress}% (on-device AI, may take a moment — cached after first use)'),
  dataSaverBanner: z.string().default('Data-saver is on — model is several hundred MB, download starts because you picked a language'),
  errorPrefix: z.string().default('Live translation error:'),
  bannerDesc: z.string().default('This content was translated on-device with NLLB (q4/q8→fp32, WASM/WebGPU cached). Original English is kept for SEO. Switch language via picker or click Original.'),
  originalTooltip: z.string().default('Show original English'),
})
export type UiLive = z.infer<typeof uiLiveSchema>

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
    languageChangedTo: 'Language changed to',
  }),
  live: uiLiveSchema.default({
    translating: 'Translating…',
    machineTranslated: 'Machine-translated',
    original: 'Original',
    downloadingDetail: 'Downloading translation model — {progress}% (on-device AI, may take a moment — cached after first use)',
    dataSaverBanner: 'Data-saver is on — model is several hundred MB, download starts because you picked a language',
    errorPrefix: 'Live translation error:',
    bannerDesc: 'This content was translated on-device with NLLB (q4/q8→fp32, WASM/WebGPU cached). Original English is kept for SEO. Switch language via picker or click Original.',
    originalTooltip: 'Show original English',
  }),
})
export type Ui = z.infer<typeof uiSchema>

/** About — rich blocks */
export const aboutBlockSchema = z.object({
  type: z.enum(['h2', 'p']),
  text: z.string(),
})
export type AboutBlock = z.infer<typeof aboutBlockSchema>
export const aboutSchema = z.object({
  blocks: z.array(aboutBlockSchema),
  updatedAt: z.string().optional(),
})
export type About = z.infer<typeof aboutSchema>

/** SEO per route */
export const seoEntrySchema = z.object({
  route: z.string(),
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  ogImage: z.string(),
  canonical: z.string(),
})
export type SeoEntry = z.infer<typeof seoEntrySchema>
export const seoSchema = z.object({
  entries: z.array(seoEntrySchema),
  default: seoEntrySchema,
})
export type Seo = z.infer<typeof seoSchema>

/** i18n — supported languages + BCP47 mapping */
export const i18nLangSchema = z.object({
  code: z.string(),
  label: z.string(),
  nativeLabel: z.string(),
  flores: z.string(),
  dir: z.enum(['ltr', 'rtl']).optional(),
})
export type I18nLang = z.infer<typeof i18nLangSchema>
export const i18nSchema = z.object({
  defaultLang: z.string().default('en'),
  supported: z.array(i18nLangSchema),
  bcp47ToCode: z.record(z.string(), z.string()),
})
export type I18nConfig = z.infer<typeof i18nSchema>

/** Theme config — consumed by defineTheme */
export const themeConfigSchema = z.object({
  baseTheme: z.enum(['y2k', 'butter', 'neutral', 'stone', 'matcha', 'chocolate', 'gothic']),
  accent: z.union([z.string(), z.tuple([z.string(), z.string()])]),
  neutralStyle: z.enum(['warm', 'cool', 'neutral']),
  bubblePalette: z.array(z.string()),
  borderWidth: z.string(),
  radius: z.object({ base: z.number(), multiplier: z.number() }),
})
export type ThemeConfig = z.infer<typeof themeConfigSchema>

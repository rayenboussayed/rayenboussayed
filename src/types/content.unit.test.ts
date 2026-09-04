import { describe, expect, it } from 'vitest'
import {
  aboutSchema,
  contactSchema,
  ctaLabelsSchema,
  experienceSchema,
  i18nSchema,
  profileSchema,
  projectsSchema,
  seoSchema,
  skillsSchema,
  themeConfigSchema,
  uiLiveSchema,
  uiSchema,
} from '../types/content'
// Importing the loader executes every real parse — the core regression net:
// any CMS edit that breaks a schema fails here, not silently in the UI.
import {
  about,
  experience,
  i18n,
  profile,
  projects,
  seo,
  skills,
  themeConfig,
  ui,
} from '../lib/content'

describe('real data parses (src/data/*.json)', () => {
  it('parses all nine CMS files without throwing', () => {
    expect(profile.name).toBeTypeOf('string')
    expect(skills.length).toBeGreaterThan(0)
    expect(experience.length).toBeGreaterThan(0)
    expect(projects.length).toBeGreaterThan(0)
    expect(about.blocks.length).toBeGreaterThan(0)
    expect(seo.entries.length).toBeGreaterThan(0)
    expect(ui.navItems.length).toBeGreaterThan(0)
    expect(i18n.supported.length).toBe(4)
    expect(themeConfig.baseTheme).toBeTypeOf('string')
  })

  it('i18n: default en, four codes, ar is the only rtl', () => {
    expect(i18n.defaultLang).toBe('en')
    expect(i18n.supported.map((s) => s.code)).toEqual(['en', 'fr', 'ar', 'es'])
    expect(i18n.supported.find((s) => s.code === 'ar')?.dir).toBe('rtl')
    expect(i18n.supported.find((s) => s.code === 'fr')?.dir).toBeUndefined()
  })

  it('defaults fill omitted CMS chrome (cta/contact/ui-live)', () => {
    expect(ctaLabelsSchema.parse({}).resume).toBe('Download Resume')
    expect(contactSchema.parse({}).heading).toContain('talk')
    const live = uiLiveSchema.parse({})
    expect(live.original).toBe('Original')
    expect(live.errorPrefix).toBe('Live translation error:')
    expect(uiSchema.parse({ navItems: [], sections: ui.sections }).live.original).toBe('Original')
  })
})

describe('schema rejections (never silently accept bad CMS)', () => {
  it('profile requires name + valid email', () => {
    expect(() => profileSchema.parse({})).toThrow()
    expect(() => profileSchema.parse({ ...profile, email: 'not-an-email' })).toThrow()
  })

  it('skill category is a closed enum', () => {
    expect(() => skillsSchema.parse([{ ...skills[0], category: 'devops' }])).toThrow()
  })

  it('experience items require role/org/description', () => {
    expect(() => experienceSchema.parse([{ id: 'x' }])).toThrow()
  })

  it('projects require title/description/image', () => {
    expect(() => projectsSchema.parse([{ id: 'x' }])).toThrow()
  })

  it('about blocks are h2|p only', () => {
    expect(() => aboutSchema.parse({ blocks: [{ type: 'h3', text: 'x' }] })).toThrow()
  })

  it('seo entries require route/title/canonical', () => {
    expect(() => seoSchema.parse({ entries: [{ route: '/' }], default: seo.default })).toThrow()
  })

  it('theme baseTheme is a closed enum', () => {
    expect(() => themeConfigSchema.parse({ ...themeConfig, baseTheme: 'neon' })).toThrow()
  })

  it('i18n langs require code/flores', () => {
    expect(() => i18nSchema.parse({ defaultLang: 'en', supported: [{ code: 'fr' }], bcp47ToCode: {} })).toThrow()
  })
})

import { describe, expect, it } from 'vitest'
import {
  aboutSchema,
  contactSchema,
  ctaLabelsSchema,
  experienceSchema,
  profileSchema,
  projectsSchema,
  seoSchema,
  skillsSchema,
  themeConfigSchema,
  uiSchema,
} from '../types/content'
// Importing the loader executes every real parse — the core regression net:
// any CMS edit that breaks a schema fails here, not silently in the UI.
import {
  about,
  experience,
  profile,
  projects,
  seo,
  skills,
  themeConfig,
  ui,
} from '../lib/content'

describe('real data parses (src/data/*.json)', () => {
  it('parses all eight CMS files without throwing', () => {
    expect(profile.name).toBeTypeOf('string')
    expect(skills.length).toBeGreaterThan(0)
    expect(experience.length).toBeGreaterThan(0)
    expect(projects.length).toBeGreaterThan(0)
    expect(about.blocks.length).toBeGreaterThan(0)
    expect(seo.entries.length).toBeGreaterThan(0)
    expect(ui.navItems.length).toBeGreaterThan(0)
    expect(themeConfig.baseTheme).toBeTypeOf('string')
  })

  it('defaults fill omitted CMS chrome (cta/contact/ui-common)', () => {
    expect(ctaLabelsSchema.parse({}).resume).toBe('Download Resume')
    expect(contactSchema.parse({}).heading).toContain('talk')
    expect(uiSchema.parse({ navItems: [], sections: ui.sections }).common.skipLink).toBe('Skip to main content')
  })
})

describe('schema rejections (never silently accept bad CMS)', () => {
  it('profile requires name + valid email', () => {
    expect(() => profileSchema.parse({})).toThrow(/invalid/i)
    expect(() => profileSchema.parse({ ...profile, email: 'not-an-email' })).toThrow(/email/i)
  })

  it('skill category is a closed enum', () => {
    expect(() => skillsSchema.parse([{ ...skills[0], category: 'devops' }])).toThrow(/invalid option/i)
  })

  it('experience items require role/org/description', () => {
    expect(() => experienceSchema.parse([{ id: 'x' }])).toThrow(/invalid/i)
  })

  it('projects require title/description/image', () => {
    expect(() => projectsSchema.parse([{ id: 'x' }])).toThrow(/invalid/i)
  })

  it('about blocks are h2|p only', () => {
    expect(() => aboutSchema.parse({ blocks: [{ type: 'h3', text: 'x' }] })).toThrow(/invalid option/i)
  })

  it('seo entries require route/title/canonical', () => {
    expect(() => seoSchema.parse({ entries: [{ route: '/' }], default: seo.default })).toThrow(/invalid/i)
  })

  it('theme baseTheme is a closed enum', () => {
    expect(() => themeConfigSchema.parse({ ...themeConfig, baseTheme: 'neon' })).toThrow(/invalid option/i)
  })

})

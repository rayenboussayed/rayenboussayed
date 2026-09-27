import {
  aboutSchema,
  experienceSchema,
  profileSchema,
  projectsSchema,
  seoSchema,
  skillsSchema,
  themeConfigSchema,
  uiSchema,
} from '../types/content'

import aboutRaw from '../data/about.json'
import experienceRaw from '../data/experience.json'
import profileRaw from '../data/profile.json'
import projectsRaw from '../data/projects.json'
import seoRaw from '../data/seo.json'
import skillsRaw from '../data/skills.json'
import themeRaw from '../data/theme.json'
import uiRaw from '../data/ui.json'

/**
 * Validated, typed content — English-only single source of truth.
 * Components must import from here, never directly from `../data/*.json`.
 */

// English — validated once at load
export const profile = profileSchema.parse(profileRaw)
export const skills = skillsSchema.parse(skillsRaw)
export const experience = experienceSchema.parse(experienceRaw)
export const projects = projectsSchema.parse(projectsRaw)
export const about = aboutSchema.parse(aboutRaw)
export const seo = seoSchema.parse(seoRaw)
export const themeConfig = themeConfigSchema.parse(themeRaw)
export const ui = uiSchema.parse(uiRaw)

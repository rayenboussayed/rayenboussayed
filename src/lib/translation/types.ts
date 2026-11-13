import type { profile as ProfileType, skills as SkillsType, experience as ExperienceType, projects as ProjectsType, about as AboutType, seo as SeoType, ui as UiType } from '../content'

export interface SiteContent {
  profile: typeof ProfileType
  skills: typeof SkillsType
  experience: typeof ExperienceType
  projects: typeof ProjectsType
  about: typeof AboutType
  seo: typeof SeoType
  ui: typeof UiType
}

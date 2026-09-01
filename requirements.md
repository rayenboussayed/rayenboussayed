# Requirements — Remediation to Fit planner.md + builder.md (CMS-complete)

> Generated 2026-09-02 — full audit of current scaffold vs `planner.md:1-105`, `builder.md:1-106`, `PLAN.md:1-284`. Verified via `grep` hardcoded-string scans, `astryx_search` (AppShell/TopNav/Section/Layout/Theme), file reads `src/components/*:1-95`, `src/data/*:1-21`, `src/lib/content.ts:1-21`, `src/types/content.ts:1-100`. Step-by-step CMS completeness is the focus: every visible string must be editable via `src/data/` alone.

## 0. Context & Method

- **Git state**: `src/*`, `public/*`, `PLAN.md`, `BENCHMARKS.md` remain untracked scaffold; `README.md` modified. All changes are greenfield Vite 19 + Astryx rebuild.
- **Skills used**: `astryx_search` (AppShell, TopNav, Section, Layout, Theme, Button/Card/Badge) — verified primitives exist; `customize-opencode` evaluated — not applicable (no `.opencode/` edits). Searches cover components, theme tokens, layout.
- **Searches executed**: `grep` for hardcoded headings/CTAs (`My Skills|My Experiences|My Projects|Let's talk|Download Resume|Resume|Certs|Open`), `grep` for `import.*from.*data` (ensures only `src/lib/content.ts:3-9` imports JSON), `astryx_search` for CMS/layout primitives.
- **Baseline**: `BENCHMARKS.md:1-144` Lighthouse 100/100/100, LCP 1028ms, CLS 0, initial JS 192.66kB gzip — performance already meets `PLAN.md` G.

## 1. Non-negotiable rule (planner.md 1A + builder.md 0. Content)

> Every `src/data/*.json` must be single source of truth — zero copy hardcoded in `.tsx` except `aria-label` fallbacks and pure UI chrome like `"Menu"` (`planner.md:49`, `builder.md:9`, `PLAN.md:21`). Validation via `zod` `schema.parse()` in `src/lib/content.ts:15-21` and types `src/types/content.ts:1-100`.

**Current violation count**: 8 hardcoded user-visible strings outside CMS (see §2). Must be moved to `src/data/` so a non-dev can edit without touching components (goal of `src/data/README.md:1-21`).

## 2. CMS Audit — `src/data/` vs Components

### 2.1 `src/data/profile.json:1-19` — `src/types/content.ts:12-26` `profileSchema`
- **CMS today**: `name`, `displayName`, `role`, `tagline`, `location`, `avatar`, `avatarAlt`, `email`, `resumeUrl`, `certificationsUrl`, `socials[]`, `availability` — consumed correctly in `Hero.tsx:50-91`, `Footer.tsx:14-24`, `Seo.tsx:10-23`.
- **Hardcoded gap**:
  - `Hero.tsx:61` `label="Download Resume"` and `Hero.tsx:62` `label="View Certifications"` — CTA labels not in JSON.
  - `TopNav.tsx:34` `label="Resume"` and `TopNav.tsx:35` `label="Certs"` — same URLs, different short labels, also hardcoded.
  - `Footer.tsx:10` `h2 "Let's talk for something special"` and `Footer.tsx:11` `p "I'm passionate..."` — contact section copy hardcoded, not in profile.
- **Required change**: Extend `profileSchema` with optional `ctaLabels?: { resume:string, certifications:string, resumeShort:string, certsShort:string }` (defaults to current strings) and `contact?: { heading:string, blurb:string }`. Populate `profile.json` and replace components with `profile.ctaLabels.resume` etc. Update `src/data/README.md:7` row.

### 2.2 `src/data/skills.json:1-16` — `src/types/content.ts:29-37` `skillSchema`
- **CMS today**: array of `{id,name,icon,category}` — consumed in `Skills.tsx:22-36`.
- **Hardcoded gap**:
  - `Skills.tsx:18` `Heading "My Skills"` and `Skills.tsx:19` `Text "Tools I use to ship products end-to-end..."` — section heading/subheading not in data.
- **Required change**: Change shape from `Skill[]` to `{ heading:string, subheading:string, items:Skill[] }` with Zod `skillsFileSchema = z.object({heading:z.string(), subheading:z.string(), items:z.array(skillSchema)})` or keep array for backwards compat and add wrapper `src/data/ui.json` (preferred minimal — see §2.7). If wrapper chosen, add migration shim in `src/lib/content.ts:16` that handles both shapes. Update `Skills.tsx:18-19` to read `skills.heading` / `skills.subheading`.

### 2.3 `src/data/experience.json:1-18` — `src/types/content.ts:40-49`
- **Hardcoded gap**: `Experience.tsx:16` `Heading "My Experiences"` — not in data.
- **Required change**: Same pattern as Skills — add `heading` to file wrapper or `ui.json`. `Experience.tsx:16` must read from data.

### 2.4 `src/data/projects.json:1-20` — `src/types/content.ts:51-62`
- **CMS today**: `id,title,description,url,tags[],image,imageAlt` — consumed in `Projects.tsx:22-43`.
- **Hardcoded gap**:
  - `Projects.tsx:19` `Heading "My Projects"` and `Projects.tsx:20` `Text "Open source..."` — heading/subheading hardcoded.
  - `Projects.tsx:41` `Button label="Open"` — CTA label hardcoded (same for both cards, not per-project).
- **Required change**: Add `heading/subheading` wrapper (or `ui.json`) and optional `ctaLabel?:string` per project (default "Open") to `projectSchema`. Replace `Projects.tsx:19-20,41` with data.

### 2.5 `src/data/about.json:1-8` — `src/types/content.ts:64-73`
- **Status**: **PASS** — `About.tsx:12-30` renders `about.blocks[]` with no hardcoded copy. First block `h2 "About Me"` is already CMS. No change needed.

### 2.6 `src/data/seo.json:1-20` + `src/data/theme.json:1-8` + `Seo.tsx:7-47`
- **Status**: **PASS** — `Seo.tsx:28-42` hoists `title/meta/canonical/OG/Twitter` via React 19, `profile.json` JSON-LD `Seo.tsx:10-23`, `theme.json:1-8` drives `softPopTheme.ts:6-52` `bubblePalette` `CanvasWrapper.tsx:33`. `index.html:10-12` fallback comment already synced to `seo.json` (P0 fixed).

### 2.7 `TopNav.tsx:6-12` navigation CMS
- **Hardcoded gap**: `TopNav.tsx:6-12` `links[]` const `Home/Skills/Experience/About/Projects` with `href="#hero"` etc. — not editable via `src/data/`. `builder.md:53-62` requires anchor sections driven by IA; nav order should be CMS.
- **Required change**: Create `src/data/ui.json` (or `nav.json`) with `navItems: {href,label}[]` and `sections: {skills:{heading,subheading}, experience:{heading}, projects:{heading,subheading}}`. Define `uiSchema` in `src/types/content.ts:91-100` alongside `themeConfigSchema`, export `ui` from `src/lib/content.ts:1-21`, consume in `TopNav.tsx:7-12` and section headings. Alternative: reuse `seo.json:entries[].route` but keep explicit `ui.json` for labels. Document in `src/data/README.md:5-14`.

## 3. CMS Completeness Checklist (builder.md 10. Final polish)

- [ ] `grep -r "My Skills|My Experiences|My Projects|Let's talk|Download Resume|View Certifications|label=\"Resume\"|label=\"Certs\"|label=\"Open\""` returns 0 after fix — only `src/data/*.json` contains those strings.
- [ ] `grep -r "from.*data/" src/components` returns 0 — only `src/lib/content.ts:3-9` imports JSON (`builder.md:42`).
- [ ] Edit test: change `profile.json:name`, `skills.json:items[0].name`, `ui.json:sections.skills.heading`, `about.json:blocks[1].text`, `projects.json:items[0].title` → `npm run dev` reflects instantly, no `.tsx` touch.
- [ ] `src/data/README.md:1-21` updated to list every file/key → visible location table (add `ui.json` row, update skills/experience/projects rows to note heading/subheading/ctaLabel).

## 4. Other planner.md / builder.md Fit (already fixed vs remaining)

### Fixed since last requirements.md (mark DONE)
- [x] Astryx primitives: `AppShell variant="wash"` `src/App.tsx:24`, `TopNav` `TopNav.tsx:2` (`AstryxTopNav`/`TopNavItem`), `Section` `Skills.tsx:5`/`Experience.tsx:4`/`About.tsx:4`/`Projects.tsx:6`, `ScrollProgress` `src/components/ScrollProgress.tsx:1-26` `useScroll+useSpring`, `MotionConfig reducedMotion="user"` `src/main.tsx:12`, `useReducedMotion` guards `Hero.tsx:11` `Skills.tsx:14` `Experience.tsx:12` `About.tsx:12` `Projects.tsx:15`, tilt `rotateX/Y` `Projects.tsx:29`, `layoutId="nav-underline"` `TopNav.tsx:40`, `softPopTheme` `--shadow-med` `src/theme/softPopTheme.ts:21` + `src/index.css:28`, `index.html:10` fallback comment.

### Remaining P1 (non-CMS)
- [ ] Theme `softPopTheme.css/js` build artifact via `npx astryx theme build ./src/theme/soft-pop.ts` per `builder.md:33` — currently `src/main.tsx:5-6` imports `soft-pop` built files; ensure build is committed.
- [ ] `public/robots.txt:3` / `sitemap.xml:4-12` canonical sync to `seo.json:8` — documented but not auto-generated; keep manual sync note in `README.md`.
- [ ] `README.md:1-35` still Vite boilerplate — replace with project-specific (install, CMS guide, benchmarks link).
- [ ] `src/App.css:1` empty + unused `src/assets/vite.svg` — remove or document.

## 5. Concrete Schema & File Changes (minimal additive)

**`src/types/content.ts` add:**
```ts
export const ctaLabelsSchema = z.object({ resume:z.string().default("Download Resume"), certifications:z.string().default("View Certifications"), resumeShort:z.string().default("Resume"), certsShort:z.string().default("Certs") })
export const contactSchema = z.object({ heading:z.string().default("Let's talk for something special"), blurb:z.string().default("I'm passionate about building, teaching...") })
// extend profileSchema with ctaLabels?:ctaLabelsSchema, contact?:contactSchema
export const uiSchema = z.object({
  navItems: z.array(z.object({ href:z.string(), label:z.string() })),
  sections: z.object({
    skills: z.object({ heading:z.string(), subheading:z.string() }),
    experience: z.object({ heading:z.string() }),
    projects: z.object({ heading:z.string(), subheading:z.string(), ctaLabel:z.string().default("Open") }),
  })
})
```

**`src/data/ui.json` new:**
```json
{
  "navItems": [
    { "href": "#hero", "label": "Home" },
    { "href": "#skills", "label": "Skills" },
    { "href": "#experience", "label": "Experience" },
    { "href": "#about", "label": "About" },
    { "href": "#projects", "label": "Projects" }
  ],
  "sections": {
    "skills": { "heading": "My Skills", "subheading": "Tools I use to ship products end-to-end — frontend, backend, tooling, and creative." },
    "experience": { "heading": "My Experiences" },
    "projects": { "heading": "My Projects", "subheading": "Open source and built-from-scratch projects — from landing pages to full-stack clones.", "ctaLabel": "Open" }
  }
}
```

**`src/data/profile.json` add:** `ctaLabels` + `contact` keys (see above).

**Component replacements (line citations):**
- `Hero.tsx:61` → `label={profile.ctaLabels.resume}` and `Hero.tsx:62` → `profile.ctaLabels.certifications`
- `TopNav.tsx:34-35` → `profile.ctaLabels.resumeShort` / `certsShort` and `TopNav.tsx:6-12` map over `ui.navItems` instead of const
- `Skills.tsx:18-19` → `ui.sections.skills.heading/subheading`
- `Experience.tsx:16` → `ui.sections.experience.heading`
- `Projects.tsx:19-20` → `ui.sections.projects.heading/subheading`, `Projects.tsx:41` → `project.ctaLabel ?? ui.sections.projects.ctaLabel`
- `Footer.tsx:10-11` → `profile.contact.heading` / `blurb`

## 6. Verification (builder.md 9)

1. `npm run build` — Zod throws exact field if JSON invalid.
2. `vite dev` + Chrome MCP `take_snapshot` per section — confirm one `h1`, landmarks, alt from JSON, keyboard reachability.
3. Edit each `src/data/*.json` value, reload — UI updates without `.tsx` change (CMS proof).
4. `performance_start_trace` 60s idle hero + scroll — 60fps, heap flat, WebGL 1→0 on `IntersectionObserver` hidden.
5. Lighthouse desktop+mobile — targets `PLAN.md` G (Perf≥90, A11y≥95, BP≥95, SEO100, JS ≤250kB gzip).

## 7. Implementation Order

1. Add `ui.json` + extend `types/content.ts` + `lib/content.ts` export `ui`.
2. Extend `profile.json` CTA/contact.
3. Replace 8 hardcoded sites (§2.1-2.7) with data reads.
4. Update `src/data/README.md` table.
5. Run CMS edit test + benchmarks, commit `git add src/data/ src/types/ src/lib/ src/components/`.

---
> All paths cite `file:line`. After this, `src/data/` is the sole content authority — fulfills `planner.md:49` + `builder.md:9` "100% driven from src/data/*.json".

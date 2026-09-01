# Requirements — Fit to planner.md + builder.md (CMS-complete)

> Generated 2026-09-02 — audit of current scaffold vs `planner.md:1-105`, `builder.md:1-106`, `PLAN.md:1-284`. Verified via file reads `src/data/*:1-29`, `src/types/content.ts:1-145`, `src/lib/content.ts:1-23`, `src/components/*:1-95`, `src/App.tsx:1-43`, `src/data/README.md:1-22`, plus `astryx_search` (AppShell/TopNav/Section/Layout/Theme) and `grep` for hardcoded strings / `import.*data`. CMS completeness is now **PASS**.

## 0. Context & Method (step-by-step)

1. Load non-negotiables: `planner.md:38-49` + `builder.md:5-10` — 100% of visible copy from `src/data/*.json` via `zod` `schema.parse()` in `src/lib/content.ts:15-23`, types in `src/types/content.ts:1-145`, only `aria-label`/`Menu` chrome allowed hardcoded.
2. Inventory `src/data/` — now 9 entries `src/data:1-9` (previous 7 + `ui.json:1-23` + `profile` extended `profile.json:19-28`). Check each JSON against its Zod schema and its consumers in `src/components/*`.
3. Grep hardcoded user strings (`My Skills|My Experiences|My Projects|Let's talk|Download Resume|View Certifications|Resume|Certs|Open`) and `import.*from.*data` — confirm only `src/lib/content.ts:3-10` imports JSON after fix.
4. Verify Astryx primitives via `astryx_search` — `AppShell`, `TopNav`, `Section`, `Layout` exist and are used `src/App.tsx:24` `src/components/TopNav.tsx:1-2` `src/components/Skills.tsx:5` etc.
5. Cross-check remaining planner.md B-J / builder.md 1-10 — theme, motion, 3D, compiler, SEO, performance.
6. Skills checked: only `customize-opencode` available (for `.opencode/` config) — not applicable here. All searches done.

## 1. CMS Audit — `src/data/` is now single source of truth

### 1.1 `src/data/profile.json:1-29` → `src/types/content.ts:12-55` `profileSchema`
- **Keys**: `name`, `displayName`, `role`, `tagline`, `location`, `avatar`, `avatarAlt`, `email`, `resumeUrl`, `certificationsUrl`, `socials[]`, `availability`, **new** `ctaLabels{resume,certifications,resumeShort,certsShort}:12-18` (defaults `Download Resume|View Certifications|Resume|Certs`), **new** `contact{heading,blurb}:22-28` (defaults `Let's talk...|I'm passionate...`).
- **Consumers**: `Hero.tsx:61-62` now `profile.ctaLabels.resume/certifications` (was hardcoded `Download Resume|View Certifications`), `TopNav.tsx:26-27` now `profile.ctaLabels.resumeShort/certsShort` (was `Resume|Certs`), `Footer.tsx:10-12` now `profile.contact.heading/blurb` (was hardcoded `Let's talk|I'm passionate`), plus `Hero.tsx:50-53,57` `name/role/tagline/location/availability`, `Hero.tsx:90` `avatarAlt`, `Footer.tsx:14-24` `email/socials`.
- **Status**: **PASS** — defaults in `src/types/content.ts:44-54` keep old data compatible; edit `profile.json:19-28` and UI updates without `.tsx` touch.

### 1.2 `src/data/ui.json:1-23` → `src/types/content.ts:94-107` `uiSchema` (additive vs planner.md 7-file spec)
- **Keys**: `navItems[{href,label}]:2-7` and `sections{ skills{heading,subheading}:10-12, experience{heading}:14-16, projects{heading,subheading,ctaLabel}:17-21 }`.
- **Why additive**: `planner.md:40-48` lists 7 files with headings considered "pure UI chrome" (`planner.md:49`) that could be hardcoded. User requirement "everything CMS via `src/data/`" is stricter, so `ui.json` is the minimal additive to make IA chrome editable without wrapping `skills.json:1-16` etc. into breaking `{heading,items}` objects. Keep `skills.json:1-16` as `Skill[]`, `experience.json:1-18` as `ExperienceItem[]`, `projects.json:1-20` as `Project[]` to preserve `PLAN.md:35-79` shape; headings live in `ui.json` instead. Documented in `src/data/README.md:8-11`.
- **Consumers**: `TopNav.tsx:19` maps `ui.navItems` (was const `TopNav.tsx:6-12`), `Skills.tsx:18-19` `ui.sections.skills.heading/subheading` (was `My Skills|Tools I use`), `Experience.tsx:16` `ui.sections.experience.heading` (was `My Experiences`), `Projects.tsx:19-20` `ui.sections.projects.heading/subheading` + `Projects.tsx:41` `p.ctaLabel ?? ui.sections.projects.ctaLabel` with fallback `Open` (was hardcoded `My Projects|Open source...|Open`).
- **Status**: **PASS**.

### 1.3 `src/data/skills.json:1-16` → `src/types/content.ts:58-66` `skillSchema`
- Array of `{id,name,icon,category}` consumed `Skills.tsx:22-36`. Headings now via `ui.json`; icons use `alt={s.name}`. **PASS**.

### 1.4 `src/data/experience.json:1-18` → `src/types/content.ts:68-78` `experienceItemSchema`
- Array consumed `Experience.tsx:18-35`. Heading via `ui.json`. `icon` alt uses `item.role`. **PASS**.

### 1.5 `src/data/projects.json:1-20` → `src/types/content.ts:80-92` `projectSchema` (added `ctaLabel?:string`)
- Array consumed `Projects.tsx:22-42`. Per-card `ctaLabel` overrides `ui.sections.projects.ctaLabel`. **PASS**.

### 1.6 `src/data/about.json:1-8` → `src/types/content.ts:109-118` `aboutSchema`
- `About.tsx:12-30` renders `about.blocks[]` (`h2|p`) — first block `h2 "About Me"` already CMS. **PASS** (unchanged).

### 1.7 `src/data/seo.json:1-20` + `src/data/theme.json:1-8` + `Seo.tsx:7-47`
- `Seo.tsx:28-42` React 19 hoisted `title/meta/canonical/OG/Twitter`, `Seo.tsx:10-23` JSON-LD `Person/ProfilePage`, `theme.json:1-8` drives `softPopTheme.ts:6-52` `bubblePalette` `CanvasWrapper.tsx:33`. `index.html:10-12` fallback comment synced to `seo.json` **PASS**.

### 1.8 Loader & docs
- `src/lib/content.ts:1-23` is **only** place importing JSON (`grep import.*from.*data` confirms 0 matches in `src/components/*`). Exports `profile, skills, experience, projects, about, seo, themeConfig, ui`. `src/data/README.md:1-22` updated with full table `profile.ctaLabels/contact`, `ui.json` nav/sections, `skills/experience/projects` heading delegation.

### 1.9 CMS completeness proof
- `grep -r "My Skills|My Experiences|My Projects|Let's talk for something special|I'm passionate about building|Download Resume|View Certifications|label=\"Resume\"|label=\"Certs\"|label=\"Open\""` in `src/components/*` and `src/App.tsx` now returns **0** — all strings live only in `src/data/*.json` or `src/types/content.ts` defaults (schema fallbacks, not component copy).
- Edit test: change any `src/data/*.json` value (`profile.name`, `ui.sections.skills.heading`, `about.blocks[1].text`, `skills.json[0].name`) → `npm run dev` reflects instantly, `npm run build` validates via `schema.parse()` error with exact field if invalid.

## 2. Planner.md / Builder.md Fit (beyond CMS)

### Fixed (previously P0, now DONE)
- [x] **A Content model** — 8 JSONs (7 spec + additive `ui.json`) with Zod schemas, `lib/content.ts` sole loader, `README.md` guide.
- [x] **UI: no hand-rolled primitives** (`builder.md:7`) — `AppShell variant="wash"` `src/App.tsx:24`, `TopNav` `src/components/TopNav.tsx:1-2` (`AstryxTopNav`/`TopNavItem`/`TopNavHeading`), `Section` `src/components/Skills.tsx:5` `Experience.tsx:4` `About.tsx:4` `Projects.tsx:6`, `Button/Card/Badge/Heading/Text` elsewhere. Layer order `vite.config.ts:17-30` intact.
- [x] **Motion** (`builder.md:6`, `PLAN.md:195-211`) — `Hero.tsx:11` `useReducedMotion` stagger, `Skills.tsx:14`/`Experience.tsx:12`/`About.tsx:12`/`Projects.tsx:15` `useReducedMotion` guards + `whileInView`, `Projects.tsx:29-30` `rotateX/Y` + `transformPerspective:800`, `TopNav.tsx:32` `layoutId="nav-underline"`, `ScrollProgress.tsx:1-26` `useScroll+useSpring+scaleX`, global `MotionConfig reducedMotion="user"` `src/main.tsx:12`.
- [x] **Visual D** — `softPopTheme.ts:6-52` extends `y2kTheme` with `color accent`, `typography`, `radius`, `tokens --border-width/--shadow-med/--color-*`, `components card/button` (card `borderWidth 3px` + `borderRadius 20px`, button `variant:primary boxShadow var(--shadow-med)`). `src/index.css:1-41` `.soft-pop-card` uses `var(--shadow-med, var(--soft-pop-shadow))`.
- [x] **3D F** — `GlowBubbles/*:1-103` lazy + `Canvas dpr={[1,2]}` + `frameloop="demand"` + `Float/Sphere` + `shaderMaterial` + `IntersectionObserver` + `visibilitychange` + `forceContextLoss` cleanup + `prefers-reduced-motion`/`hardwareConcurrency <=4` fallback.
- [x] **React Compiler** (`builder.md:13`) — `vite.config.ts:1-46` `reactCompilerPreset()` + `@rolldown/plugin-babel`, `src/main.tsx:1-18` `Theme` wrapped by `MotionConfig`.
- [x] **SEO H** — `Seo.tsx:7-47` native `title/meta`, `public/robots.txt:1-3`, `sitemap.xml:1-13`, `llms.txt:1-29` Markdown links (agentic 100), one `h1` `Hero.tsx:52`, landmarks `nav/main/section aria-labelledby/footer`.

## 3. Remaining Requirements (P1 — docs/hygiene, not CMS-blocking)

- [ ] **Docs**: `README.md:1-35` still Vite boilerplate (Oxlint config). Replace with project README: `npm install && npm run dev`, `npm run build && vite preview`, CMS editing `src/data/README.md:1-22` table, theme `npx astryx theme build ./src/theme/soft-pop.ts`, benchmarks `BENCHMARKS.md:1-144`, deploy. Keep `browserslist` note.
- [ ] **Hygiene**: `src/App.css:1` empty — remove or document; unused `src/assets/vite.svg`/`react.svg` — remove.
- [ ] **SEO sync**: `public/robots.txt:3` `Sitemap: https://rynbsd.vercel.app/sitemap.xml`, `public/sitemap.xml:4-12` `<loc> https://rynbsd.vercel.app/#skills` etc., `seo.json:8` `canonical: https://rynbsd.vercel.app/` — domain is old portfolio; add sync note already in `src/data/README.md:13` but ensure manual update on new deploy. Consider auto-generating `sitemap.xml` from `ui.navItems` + `seo.json`.
- [ ] **Theme build**: `src/main.tsx:5-6` imports `soft-pop` built `soft-pop.css/js`; ensure `npx astryx theme build` artifact is committed and `vite preview` CSS layer order verified via `vite.config.ts:17-30`.
- [ ] **Verification re-run** (`builder.md:9`): after docs/hygiene, re-run `vite dev` + Chrome MCP `take_snapshot` (one H1, landmarks, alt from JSON), `performance_start_trace` 60s idle + scroll (60fps, heap flat, WebGL 1→0), `list_console_messages` 0 errors, `resize_page` 375/768/1280/1536, Lighthouse `npx lighthouse` desktop+mobile 3× median → update `BENCHMARKS.md`.

## 4. Implementation Order

1. Update docs/hygiene P1 items above (no CMS code changes needed — CMS already complete).
2. `npm run build` + `vite preview` → full `builder.md:9` verification, refresh `BENCHMARKS.md`.
3. `git add src/data/ src/types/content.ts src/lib/content.ts src/components/ src/data/README.md requirements.md` + commit — ensure `git diff` clean (no form, no custom primitives beyond 3D).

## 5. File Map

- CMS: `src/data/profile.json:1-29`, `ui.json:1-23`, `skills.json:1-16`, `experience.json:1-18`, `projects.json:1-20`, `about.json:1-8`, `seo.json:1-20`, `theme.json:1-8`, `src/types/content.ts:1-145`, `src/lib/content.ts:1-23`, `src/data/README.md:1-22`
- Components: `src/App.tsx:21-43`, `Hero.tsx:50-91`, `Skills.tsx:18-19`, `Experience.tsx:16`, `Projects.tsx:19-41`, `TopNav.tsx:19,26-27`, `Footer.tsx:10-12`
- Theme/SEO/Motion/3D: `softPopTheme.ts:6-52`, `index.html:10-12`, `Seo.tsx:7-47`, `ScrollProgress.tsx:1-26`, `GlowBubbles/*`

---
> After this update, `src/data/` is the sole content authority — fulfills `planner.md:49` "single source of truth" + `builder.md:9` "100% driven from src/data/*.json". All visible strings editable without touching `.tsx`.

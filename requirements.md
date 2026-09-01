# Requirements — Fit to planner.md + builder.md (CMS-complete)

> Generated 2026-09-02 — re-audited scaffold vs `planner.md:1-105`, `builder.md:1-106`, `PLAN.md:1-284`. Verified via reads `src/data/*:1-29`, `src/types/content.ts:1-145`, `src/lib/content.ts:1-23`, `src/components/*:1-95`, `src/App.tsx:1-43`, plus `astryx_search` (AppShell/TopNav/Section/Layout/Theme) and `grep` for `My Skills|My Experiences|My Projects|Let's talk|Download Resume|View Certifications` / `import.*data`. CMS completeness is **PASS** — grep confirms no hardcoded copy remains in components.

## 0. Context & Method (step-by-step)

1. Load non-negotiables: `planner.md:38-49` + `builder.md:9-10` — 100% visible copy from `src/data/*.json` via `zod` `schema.parse()` in `src/lib/content.ts:15-23`, types in `src/types/content.ts:1-145`, only `aria-label`/`Menu` chrome allowed.
2. Inventory `src/data:1-9` — 9 files (7 spec + additive `ui.json:1-23` + extended `profile.json:19-28` with `ctaLabels/contact`). Validate each JSON against its Zod schema and its consumers.
3. Grep hardcoded strings (`My Skills|My Experiences|My Projects|Let's talk|Download Resume|View Certifications` and `label="Resume"|"Certs"|"Open"`): **0 hits in `src/components/*` / `src/App.tsx`** — hits only in `src/data/*.json` and `src/types/content.ts` defaults (schema fallbacks, expected). Grep `import.*from.*data`: only `src/lib/content.ts:3-10` imports JSON.
4. Verify Astryx primitives via `astryx_search` — `AppShell`, `TopNav`, `Section`, `Layout`, `Theme` exist and are used `src/App.tsx:24` `TopNav.tsx:1-2` `Skills.tsx:5` `Experience.tsx:4` `About.tsx:4` `Projects.tsx:6`.
5. Cross-check planner.md B-J / builder.md 1-10 — theme, motion, 3D, compiler, SEO, performance unchanged.
6. Skills: only `customize-opencode` available (for `.opencode/` config) — not applicable. All searches executed.

## 1. CMS Audit — `src/data/` is single source of truth

### 1.1 `profile.json:1-29` → `src/types/content.ts:12-55` `profileSchema`
- Keys: `name`, `displayName`, `role`, `tagline`, `location`, `avatar`, `avatarAlt`, `email`, `resumeUrl`, `certificationsUrl`, `socials[]`, `availability`, **added** `ctaLabels{resume,certifications,resumeShort,certsShort}:12-18` (defaults `Download Resume|View Certifications|Resume|Certs`), **added** `contact{heading,blurb}:22-28` (defaults `Let's talk...|I'm passionate...`).
- Consumers: `Hero.tsx:61-62` `profile.ctaLabels.resume/certifications` (was hardcoded), `TopNav.tsx:26-27` `profile.ctaLabels.resumeShort/certsShort`, `Footer.tsx:10-12` `profile.contact.heading/blurb`, plus `Hero.tsx:50-53,57,90` `name/role/tagline/location/availability/avatarAlt`, `Footer.tsx:14-24` `email/socials`.
- **PASS** — defaults `src/types/content.ts:44-54` keep old data compatible; edit `profile.json:19-28` → UI updates without `.tsx`.

### 1.2 `ui.json:1-23` → `src/types/content.ts:94-107` `uiSchema` (additive vs 7-file spec)
- Keys: `navItems[{href,label}]:2-7`, `sections{ skills{heading,subheading}:10-12, experience{heading}:14-16, projects{heading,subheading,ctaLabel}:17-21 }`.
- Rationale: `planner.md:40-48` lists 7 files; headings were "pure UI chrome" (`planner.md:49`) allowed hardcoded, but user requires CMS for IA chrome. `ui.json` is minimal additive to avoid breaking `skills.json:1-16` (`Skill[]`), `experience.json:1-18`, `projects.json:1-20` shapes per `PLAN.md:35-79`. Documented `src/data/README.md:8-11`.
- Consumers: `TopNav.tsx:19` `ui.navItems` (was `TopNav.tsx:6-12` const), `Skills.tsx:18-19` `ui.sections.skills`, `Experience.tsx:16` `ui.sections.experience`, `Projects.tsx:19-20,41` `ui.sections.projects` + `p.ctaLabel ?? ui...`.
- **PASS**.

### 1.3 `skills.json:1-16` → `src/types/content.ts:58-66` `skillSchema`
- Array `{id,name,icon,category}` consumed `Skills.tsx:22-36`, alt `s.name`. Headings via `ui.json`. **PASS**.

### 1.4 `experience.json:1-18` → `src/types/content.ts:68-78` `experienceItemSchema`
- Array consumed `Experience.tsx:18-35`, alt `item.role`. **PASS**.

### 1.5 `projects.json:1-20` → `src/types/content.ts:80-92` `projectSchema` (`ctaLabel?:string`)
- Array consumed `Projects.tsx:22-42`, per-card `ctaLabel` overrides `ui.sections.projects.ctaLabel`. **PASS**.

### 1.6 `about.json:1-8` → `src/types/content.ts:109-118` `aboutSchema`
- `About.tsx:12-30` renders `about.blocks[]` (`h2|p`). **PASS**.

### 1.7 `seo.json:1-20` + `theme.json:1-8` → `Seo.tsx:7-47`
- `Seo.tsx:28-42` hoisted `title/meta/canonical/OG/Twitter`, `Seo.tsx:10-23` JSON-LD `Person`, `theme.json:1-8` drives `softPopTheme.ts:6-52` `bubblePalette` `CanvasWrapper.tsx:33`. `index.html:10-12` fallback synced. **PASS**.

### 1.8 Loader & docs
- `src/lib/content.ts:1-23` only importer of JSON (grep confirms 0 in `src/components/*`). Exports `profile, skills, experience, projects, about, seo, themeConfig, ui`. `src/data/README.md:1-22` updated with full `profile.ctaLabels/contact` + `ui.json` table.

### 1.9 Proof
- Grep `My Skills|My Experiences|My Projects|Let's talk|I'm passionate|Download Resume|View Certifications` now **0 in `src/components/*` / `src/App.tsx`** — lives only in `src/data/*.json` + `src/types/content.ts` defaults (expected fallbacks, not component copy).
- Edit test: change any `src/data/*.json` value → `npm run dev` reflects instantly; `npm run build` fails with Zod exact field if JSON invalid.

## 2. Planner.md / Builder.md Fit (beyond CMS)

### DONE (previously P0)
- [x] **A Content model** — 8 JSONs (7 spec + `ui.json`) with Zod, `lib/content.ts` sole loader, `README.md` guide.
- [x] **UI: no hand-rolled primitives** (`builder.md:7`) — `AppShell variant="wash"` `src/App.tsx:24`, `TopNav` `src/components/TopNav.tsx:1-2`, `Section` `src/components/Skills.tsx:5` `Experience.tsx:4` `About.tsx:4` `Projects.tsx:6`, `Button/Card/Badge/Heading/Text`.
- [x] **Motion** — `Hero.tsx:11` stagger, `Skills.tsx:14`/`Experience.tsx:12`/`About.tsx:12`/`Projects.tsx:15` `useReducedMotion` + `whileInView`, `Projects.tsx:29-30` `rotateX/Y`+`transformPerspective:800`, `TopNav.tsx:32` `layoutId="nav-underline"`, `ScrollProgress.tsx:1-26` `useScroll+useSpring+scaleX`, global `MotionConfig reducedMotion="user"` `src/main.tsx:12`.
- [x] **Visual D** — `softPopTheme.ts:6-52` extends `y2kTheme` (`tokens --border-width/--shadow-med`), `src/index.css:1-41` `.soft-pop-card` uses `var(--shadow-med)`.
- [x] **3D F** — `GlowBubbles/*:1-103` lazy + `dpr={[1,2]}` + `frameloop="demand"` + `Float/Sphere` + `shaderMaterial` + `IntersectionObserver` + `forceContextLoss` + `prefers-reduced-motion`/`hardwareConcurrency<=4` fallback.
- [x] **React Compiler** — `vite.config.ts:1-46` `reactCompilerPreset()` + `@rolldown/plugin-babel`.
- [x] **SEO H** — `Seo.tsx:7-47` native `title/meta`, `public/robots.txt:1-3`, `sitemap.xml:1-13`, `llms.txt:1-29` Markdown links, one `h1` `Hero.tsx:52`, landmarks.

## 3. Remaining Requirements (P1 — docs/hygiene, not CMS-blocking)

- [ ] **Docs**: `README.md:1-35` still Vite boilerplate. Replace with project README: install `npm install && npm run dev`, `npm run build && vite preview`, CMS table `src/data/README.md:1-22`, theme `npx astryx theme build ./src/theme/soft-pop.ts`, `BENCHMARKS.md:1-144`.
- [ ] **Hygiene**: `src/App.css:1` empty — remove or document; `src/assets/vite.svg`/`react.svg` unused — remove.
- [ ] **SEO sync**: `public/robots.txt:3` `Sitemap: https://rynbsd.vercel.app/sitemap.xml`, `sitemap.xml:4-12`, `seo.json:8` `canonical` — old domain; keep sync note `src/data/README.md:13` and consider auto-generating `sitemap.xml` from `ui.navItems`+`seo.json`.
- [ ] **Theme build**: `src/main.tsx:5-6` imports `soft-pop` built artifact; ensure `npx astryx theme build` committed, `vite preview` layer order `vite.config.ts:17-30` verified.
- [ ] **Verification re-run** (`builder.md:9`): `vite dev` + MCP `take_snapshot` (one H1, alt from JSON), `performance_start_trace` 60s idle+scroll (60fps, heap flat, WebGL 1→0), `list_console_messages` 0 errors, `resize_page` 375/768/1280/1536, Lighthouse `npx lighthouse` desktop+mobile 3× median → update `BENCHMARKS.md`.

## 4. Implementation Order

1. Docs/hygiene P1 above (no CMS code — CMS already complete).
2. `npm run build` + `vite preview` → full `builder.md:9` verification → refresh `BENCHMARKS.md`.
3. `git add src/data/ src/types/content.ts src/lib/content.ts src/components/ src/data/README.md requirements.md` + commit — ensure `git diff` clean (no form, no custom primitives beyond 3D).

## 5. File Map

- CMS: `src/data/profile.json:1-29`, `ui.json:1-23`, `skills.json:1-16`, `experience.json:1-18`, `projects.json:1-20`, `about.json:1-8`, `seo.json:1-20`, `theme.json:1-8`, `src/types/content.ts:1-145`, `src/lib/content.ts:1-23`, `src/data/README.md:1-22`
- Components: `src/App.tsx:21-43`, `Hero.tsx:50-91`, `Skills.tsx:18-19`, `Experience.tsx:16`, `Projects.tsx:19-41`, `TopNav.tsx:19,26-27`, `Footer.tsx:10-12`
- Theme/SEO/Motion/3D: `softPopTheme.ts:6-52`, `index.html:10-12`, `Seo.tsx:7-47`, `ScrollProgress.tsx:1-26`, `GlowBubbles/*`

---
> `src/data/` is now sole content authority — fulfills `planner.md:49` + `builder.md:9` "100% driven from src/data/*.json". All visible strings editable without touching `.tsx`.

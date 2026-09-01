# Requirements — Remediation to Fit planner.md + builder.md

> Generated 2026-09-01 — full audit of untracked changes vs HEAD against `planner.md:1-105`, `builder.md:1-106`, `PLAN.md:1-281`. Evidence via executed reads, `git status`, `astryx_search`, and file line citations. Assumptions flagged.

## 0. Context

- **Git state** `git status:1-4` — Modified `README.md`, untracked scaffold `package.json`, `vite.config.ts`, `index.html`, `src/*`, `public/*`, `PLAN.md`, `BENCHMARKS.md`, `planner.md`, `builder.md`, `.gitignore`, `.oxlintrc.json`. The rebuild is a greenfield Vite+React 19+Astryx app, not an incremental diff.
- **Skills used**: `astryx_search` (Button/Card/Badge/TopNav/AppShell/Theme verified), `customize-opencode` checked — not applicable (no `.opencode/` edit). All available skills evaluated.
- **Searches**: `astryx_search` for components, theme, styling tokens — results confirm primitives exist for remediation.
- **Verification baseline**: `BENCHMARKS.md:1-144` reports Lighthouse 100/100/100, LCP 1028ms, CLS 0.00, initial JS 192.66kB gzip.

## 1. Scope Rule

All visible copy must remain 100% driven from `src/data/*.json` via `src/lib/content.ts:15-21` (`schema.parse`). Zero strings hardcoded in `.tsx` except `aria-label` fallbacks and pure chrome ("Menu") per `builder.md:9` and `planner.md:49`. `requirements.md` itself does not introduce content — only lists fixes.

## 2. P0 — Must Fix (builder.md non-negotiable violations)

### 2.1 Use Astryx primitives, do not hand-roll UI (`builder.md:7`)

- **Violation**: `src/components/TopNav.tsx:16-40` hand-rolls `<nav>` with plain anchors and flex divs. `src/App.tsx:19-40` hand-rolls hero absolute wrapper and `<main>` layout with `maxWidth:1120` inline styles. `src/components/Skills.tsx:13` `Experience.tsx:12` `About.tsx:12` `Projects.tsx:13-17` use plain `<section>`+div grids instead of Astryx `Section`/`Layout`.
- **Requirement**: Replace with verified primitives:
  - `TopNav` + `TopNavItem` + `MobileNav` via `AppShell` (`astryx_search` returned `AppShell:AppShell`, `TopNav:TopNav`, `Section:Section`, `Layout:Layout`). Scaffold via `npx astryx component TopNav` / `AppShell` / `Section` per `builder.md:51`. Use `astryx_get("AppShell")` and `astryx_get("TopNav")` for props.
  - Wrap app in `<AppShell variant="wash">` with `<TopNav>` slots, then `<Layout contentWidth=960>` + `<Section id="hero|skills|..." aria-labelledby>` per `PLAN.md:145-159` and `builder.md:53-62`.
  - Keep `Button`/`Card`/`Badge`/`Heading`/`Text` usage (already compliant `Skills.tsx:1-4` `Button` `Card` etc.) — only layout/nav needs migration.
  - Verify layer order still `vite.config.ts:17-30` after migration.

### 2.2 Complete Motion pass (`builder.md:70-74`, `PLAN.md:195-211`)

- **Current**: Hero stagger `src/components/Hero.tsx:18-33` ok, Skills/Experience/About/Projects `whileInView` ok, `whileHover`/`whileTap` partial `Skills.tsx:25-26` `Projects.tsx:25`.
- **Gaps**:
  - No `layoutId="nav-underline"` FLIP underline in `TopNav.tsx:24-30` per `PLAN.md:208` `docs/react-motion-component`.
  - No scroll progress bar `useScroll`+`useSpring`+`scaleX` per `PLAN.md:209` `docs/react-scroll-animations`.
  - No project tilt `rotateX/Y` `transformPerspective:800` via `motion.create(Card)` per `PLAN.md:206` (currently only `y:-6` `Projects.tsx:25`).
  - No global `<MotionConfig reducedMotion="user">` and per-section `useReducedMotion()` guard — `Hero.tsx:6-9` reinvents with `window.matchMedia` instead of `import {useReducedMotion} from "motion/react"` `docs/react-reduced-motion` (`PLAN.md:10` notes 404 assumption — now verify via `motion` package export).
- **Requirement**: Add `MotionConfig` in `src/main.tsx:10-13` wrapping `<Theme>`, import `motion/react` correctly per `motion.dev/docs/react-quick-start`, add `useReducedMotion()` guard to Skills/Experience/About/Projects (return `variants={}` or `initial={false}` when reduced), add nav underline and scroll bar, keep transforms to `transform`/`opacity` only for 60fps per `builder.md:75`.

### 2.3 Head tags — single source (`builder.md:14`, `PLAN.md:250`)

- **Current**: `index.html:7-8` hardcodes `<title>`+`<meta name="description">` duplicating `src/components/Seo.tsx:28-30` hoisted tags. React 19 hoists duplicates but violates single-source and `builder.md:64` single `<Seo/>` at root.
- **Requirement**: Keep `index.html:7-8` as minimal fallback matching `src/data/seo.json:4-8` default, but document that `Seo.tsx:7-46` is canonical. Alternatively remove hardcode and let React inject — ensure `vite build` still has fallback for crawlers without JS.

### 2.4 Git staging (`builder.md` final checklist `git diff` clean)

- **Current**: `git ls-files --others` lists all scaffold untracked. `README.md:1-35` modified not staged.
- **Requirement**: `git add .gitignore index.html package.json package-lock.json vite.config.ts tsconfig*.json .oxlintrc.json PLAN.md BENCHMARKS.md planner.md builder.md src/ public/` then commit with project message. Do not commit `dist/` or `node_modules` (` .gitignore:10-14`).

## 3. P1 — Should Fix (PLAN.md alignment, measurable)

### 3.1 Theme tokens sync (`PLAN.md:164-192`)

- **Current**: `src/theme/softPopTheme.ts:19-26` tokens include `--color-background-body`, `--color-border` but missing `--shadow-med: '6px 6px 0px rgba(0,0,0,0.9)'` from `PLAN.md:177`, missing `--color-background-surface` nuance. `src/index.css:5-11` defines `--soft-pop-shadow` vars instead of `--shadow-med`. `softPopTheme.ts:27-50` card/button overrides partially match `PLAN.md:184-186` but card lacks `boxShadow` in tokens (shadow via CSS class instead).
- **Requirement**: Add `tokens['--shadow-med']` and `'--shadow-pill':'4px 4px 0px var(--color-border)'` to `softPopTheme.ts:19-26`, reference them in `softPopTheme.ts:32-44` `boxShadow` and in `src/index.css:27-31` `.soft-pop-card`. Keep `theme.json:1-8` as source but ensure `softPopTheme.ts` reads `themeConfig.bubblePalette` already `CanvasWrapper.tsx:33`.

### 3.2 Alt text completeness (`builder.md:68`, `PLAN.md:253`)

- **Current**: `Skills.tsx:30` `alt=""` for icons, `Experience.tsx:24` `alt=""`, `Projects.tsx:29` correct `alt={p.imageAlt}` `Hero.tsx:95` correct `alt={profile.avatarAlt}`.
- **Requirement**: For skill/tool icons, either keep decorative `alt=""` with `aria-hidden` or use `alt={s.name}` sourced from `skills.json:2-16` — add `alt` field to `skillSchema` `src/types/content.ts:30-35` if choosing descriptive. Add `iconAlt` to `experience.json:8/15` and schema `src/types/content.ts:40-47` if descriptive. Update `src/data/README.md:8` to document.

### 3.3 SEO root files canonical consistency (`builder.md:65-67`, `PLAN.md:252`)

- **Current**: `public/robots.txt:3` `Sitemap: https://rynbsd.vercel.app/sitemap.xml`, `public/sitemap.xml:4-12` lists `https://rynbsd.vercel.app/#skills` etc., `seo.json:8` `canonical:"https://rynbsd.vercel.app/"`, `public/llms.txt:1-29` now Markdown links `BENCHMARKS.md:17` fixed agentic 100. Domain is old portfolio Vercel; new deploy may differ.
- **Requirement**: Parametrize canonical via `seo.json:8` and template `robots.txt`/`sitemap.xml` generation or document manual sync step in `src/data/README.md:12`. Ensure `sitemap.xml` `lastmod` not stale `2026-09-01`. Verify `llms.txt` links remain Markdown `[label](url)` per Lighthouse `llms-txt` audit.

### 3.4 Docs and scaffold hygiene

- **Current**: `README.md:1-35` is Vite boilerplate (Oxlint config etc.) not project-specific. `src/App.css:1` empty, `src/assets/vite.svg, react.svg` unused, `tsconfig.app.json:21` `resolveJsonModule:true` present but `allowImportingTsExtensions` may be redundant with Vite.
- **Requirement**: Replace `README.md` with: getting started `npm install && npm run dev`, `npm run build && vite preview`, CMS editing via `src/data/README.md:1-19`, theme `npx astryx theme add y2k` + `astryx theme build ./src/theme/softPopTheme.ts`, benchmarks `BENCHMARKS.md:1-144`, deployment. Remove unused assets or reference `avatar.webp`.

### 3.5 Schema alignment

- **Current**: `src/types/content.ts:92-99` `themeConfigSchema.borderWidth: z.string()` vs `PLAN.md:77` `z.number()`. String (`"3px"` `theme.json:6`) is correct for CSS.
- **Requirement**: Update `PLAN.md:77` to `z.string()` or `z.string().regex(/^\d+px$/)` and flag as corrected assumption. No code change needed.

## 4. P2 — Polish / Hardening

- [ ] Run `npx astryx template --list` per `PLAN.md:159` before manual `AppShell` fallback — document result in `PLAN.md` or `requirements.md` changelog.
- [ ] Generate built theme artifacts `softPopTheme.css/js/d.ts` via `npx astryx theme build ./src/theme/softPopTheme.ts` per `builder.md:33-36` for SSR/first-paint if not already emitted by `stylex.vite` extraction.
- [ ] Lighthouse performance (MCP excludes Performance `BENCHMARKS.md:7`): add CLI fallback `npx lighthouse http://localhost:4173 --preset=desktop --output=json --output=html` three runs median, append to `BENCHMARKS.md:10-28` with LCP/CLS/INP.
- [ ] Responsive verification matrix: `chrome-devtools_take_snapshot` at 375/768/1280/1536 + `resize_page` + `emulate colorScheme dark` per `builder.md:91` already in `BENCHMARKS.md:88-98` — re-run after P0 fixes.
- [ ] Add `public/og.png` dimensions note 1200x630 to `src/data/README.md` and `seo.json:7` reference.

## 5. Builder Milestone Re-checklist (from `PLAN.md:268-280`)

- [ ] 0. Preflight — `npx astryx doctor` passes, `vite dev` runs.
- [ ] 1. Scaffold — installs per §B, `vite.config.ts:1-63` StyleX+Compiler coexistence verified against `https://github.com/facebook/astryx/tree/main/apps/example-vite`.
- [ ] 2. Theme — `theme add y2k` + `defineTheme` overrides §D, `theme build`, preview route removed after verify.
- [ ] 3. CMS — `types/content.ts` + 7 JSONs + `lib/content.ts` + `README.md` — DONE.
- [ ] 4. SEO shell — `Seo.tsx`, JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`, `og.png` — DONE with canonical sync todo.
- [ ] 5. Static sections from Astryx — Hero/Skills/Experience/About/Projects/Footer via primitives — TODO P0 migration.
- [ ] 6. Motion pass — stagger, whileInView, gestures, useReducedMotion — TODO P0.
- [ ] 7. 3D bubbles — lazy Canvas, shader, guards §F — DONE `GlowBubbles/*:1-103`.
- [ ] 8. React Compiler — `vite.config.ts:46` `reactCompilerPreset`, build diagnostics clean `BENCHMARKS.md:107-110`.
- [ ] 9. Performance pass — budgets §G met `BENCHMARKS.md:29-68`.
- [ ] 10. SEO/AI pass — 100 SEO, alt, JSON-LD — DONE (alt polish P1).
- [ ] 11. Verification — MCP + Lighthouse → `BENCHMARKS.md` — DONE, re-run after P0.
- [ ] 12. Polish — JSON-only edits, no form (`Footer.tsx:6-28` no form), no custom primitives beyond 3D, links `target="_blank" rel="noreferrer"` correct `Hero.tsx:66-77`, `TopNav.tsx:34-35`, `Projects.tsx:37`, scores met, 60fps/no leaks, reduced-motion fallback, remove preview, `git diff` clean — TODO commit.

## 6. File Map (for navigation)

- CMS: `src/data/*.json`, `src/types/content.ts:1-100`, `src/lib/content.ts:1-21`, `src/data/README.md:1-19`
- Theme: `src/theme/softPopTheme.ts:6-51`, `src/index.css:1-42`, `vite.config.ts:1-63`
- Sections: `src/App.tsx:19-40`, `src/components/Hero.tsx:15-100`, `Skills.tsx:11-39`, `Experience.tsx:10-36`, `About.tsx:10-28`, `Projects.tsx:12-44`, `Footer.tsx:6-28`, `TopNav.tsx:4-41`
- 3D: `src/components/GlowBubbles/index.tsx:1-28`, `CanvasWrapper.tsx:1-103`, `Bubble.tsx:1-43`, `shaders.ts:5-39`
- SEO: `src/components/Seo.tsx:7-46`, `index.html:1-14`, `public/robots.txt:1-3`, `sitemap.xml:1-13`, `llms.txt:1-29`
- Verification: `BENCHMARKS.md:1-144`, `PLAN.md:1-281`, `package.json:1-45`

## 7. Implementation Order (builder.md:102 milestones)

1. P0 TopNav/AppShell/Section migration (requires `astryx_search` + `astryx_get` for props).
2. Motion global guard and missing animations.
3. Head single-source tidy.
4. P1 tokens, alt, canonical, README.
5. `npm run build && vite preview` → MCP snapshots + traces + Lighthouse ×3 median → update `BENCHMARKS.md`.
6. `git add` + commit + `git diff` clean.

## 8. Assumptions Flagged

- `promptweb.design/examples/soft-pop-neobrutalist` fetch returned ThumbnailAI mismatch; using planner description as ground truth `PLAN.md:8`.
- `motion` `useReducedMotion` path assumed `motion/react` per `motion.dev/docs/react-reduced-motion` 404 in PLAN.md:10 — verified via package exports.
- `astryx.css` import omitted due to StyleX extraction build error `BENCHMARKS.md:136` — intentional, not a regression.

---
> All requirements derived from executed file reads and searches, not memory. Re-verify each fix via `vite dev` + Chrome MCP + Lighthouse before marking done per `builder.md:90-96`.

# Requirements — Fit to planner.md + builder.md (CMS-complete, animation & 3D remediation)

> Generated 2026-09-02 — re-audit vs `planner.md:1-105`, `builder.md:1-106`, `PLAN.md:1-284`. Reads `src/data/*:1-29`, `src/types/content.ts:1-145`, `src/lib/content.ts:1-23`, `src/components/*:1-103`, `src/App.tsx:1-43`, `src/components/GlowBubbles/*:1-103`, `shaders.ts:1-40`, plus `astryx_search` (AppShell/TopNav/Section/Layout/Theme, motion scroll) and `grep` for hardcoded strings / `import.*data`. CMS **PASS**; scroll + 3D/shader were **FAIL**, now **PASS** after 2026-09-02 remediation (see §§2-3).

## 0. Context & Method (step-by-step)

1. Load non-negotiables `planner.md:38-49` + `builder.md:5-14`: 100% copy from `src/data/*.json` via `zod` `parse` `src/lib/content.ts:15-23`, types `src/types/content.ts:1-145`, only `aria-label`/`Menu` chrome allowed; stack React 19+Vite, Astryx primitives only, Motion for React, three.js + custom GLSL, React Compiler, native `title/meta`, MCP/Lighthouse verification.
2. Inventory `src/data:1-9` — 9 files (7 spec + additive `ui.json:1-23` + `profile.json:19-28` extended). Validate each JSON vs Zod and consumers.
3. Grep `My Skills|My Experiences|My Projects|Let's talk|Download Resume|View Certifications` + `label="Resume"|"Certs"|"Open"` → 0 hits in `src/components/*`/`src/App.tsx`; only `src/data/*.json` + `src/types/content.ts` defaults (fallbacks). `import.*data` only in `src/lib/content.ts:3-10`.
4. Astryx primitives verified `astryx_search` — `AppShell`, `TopNav`, `Section`, `Layout`, `Theme` present and used `src/App.tsx:24` `TopNav.tsx:1-2` `Skills.tsx:5` etc. Motion scroll search confirms `useScroll` etc. available.
5. Cross-check `PLAN.md` D-J & `builder.md` 1-10: theme/motion/3D/compiler/SEO/performance; user-reported defects: "no scroll animations, 3D bubbles don't look 3D and no waving, no shader effect" — audited `Bubble.tsx:1-43`, `CanvasWrapper.tsx:1-103`, `shaders.ts:1-40`, `Skills.tsx:13-43`, `Experience.tsx:11-39`, `Projects.tsx:14-48`, `About.tsx:11-31`, `Hero.tsx:1-95`.

### Skills
- Only `customize-opencode` available (for `.opencode/` config) — not applicable. `astryx_search`/`get` are the relevant tools and were used.

## 1. CMS Audit — `src/data/` is single source of truth — **PASS** (no change needed)

- `profile.json:19-28` adds `ctaLabels{resume,certifications,resumeShort,certsShort}` + `contact{heading,blurb}` with Zod defaults `src/types/content.ts:12-28,44-54`; consumers `Hero.tsx:61-62` `profile.ctaLabels`, `TopNav.tsx:26-27` short, `Footer.tsx:10-12` `profile.contact`.
- `ui.json:1-23` (`navItems:2-7`, `sections{skills:10-12, experience:14-16, projects:17-21}`) with `uiSchema` `src/types/content.ts:94-107`; consumers `TopNav.tsx:19` `ui.navItems`, `Skills.tsx:18-19` `ui.sections.skills`, `Experience.tsx:16` `ui.sections.experience`, `Projects.tsx:19-20,41` `ui.sections.projects` + `p.ctaLabel ?? ui...`.
- `skills.json:1-16`, `experience.json:1-18`, `projects.json:1-20` (with `ctaLabel?:string` `src/types/content.ts:89`), `about.json:1-8`, `seo.json:1-20`, `theme.json:1-8` all consumed correctly (`Hero.tsx:50-53`, `Skills.tsx:22-36`, `Experience.tsx:18-35`, `Projects.tsx:22-42`, `About.tsx:18-26`, `Seo.tsx:28-42`).
- `src/lib/content.ts:1-23` sole JSON importer; `src/data/README.md:1-22` documents all keys. Additive `ui.json` vs `planner.md:40-48` 7-file spec is intentional to make IA chrome CMS without breaking `Skill[]` shapes — documented.

## 2. P0 — Scroll animations — **PASS after 2026-09-02 fix** (was **FAIL**)

### Before (invisible/subtle)
- `Skills.tsx:23-31` `y:12 viewport once:true amount0.2 duration0.4 delay i*0.03 y:-4/scale1.02`
- `Experience.tsx:19-24` `x:-12 once delay i*0.1`
- `Projects.tsx:23-30` `y:16 once delay i*0.08`
- `About.tsx:16` `y16 once`
- `Hero.tsx:12-31` stagger only; `ScrollProgress.tsx:1-26` `useScroll` only top bar.
- `viewport once:true amount0.2` clipping + `i*0.03` imperceptible + `reduce` guard hides when OS `prefers-reduced-motion`.

### Fixed (typed, minimal, verifiable)
- [x] **Triggers visible:** `Skills.tsx:25-27` `Experience.tsx:21-23` `Projects.tsx:27` `About.tsx:18-21` → `viewport={{once:false, amount:0.25, margin:"-10% 0px -10% 0px"}}` so re-entry re-triggers.
- [x] **Exaggerated:** `y:12→24` `x:-12→-24` `duration 0.4→0.6` `delay i*0.03→0.08` (`Skills.tsx:25` `Experience.tsx:21` `Projects.tsx:27`) + `Skills whileHover y:-4→-2 scale1.02→1.06` per `PLAN.md:201-206`.
- [x] **Scroll-linked parallax:** `About.tsx:12-14` `Projects.tsx:15-17` `useScroll→useTransform [0,-28]` on wrapper/image, `transform/opacity` only for 60fps (`builder.md:75`). `About` outer `y` parallax + inner entrance split to avoid y conflict.
- [x] **Not disabled:** `src/main.tsx:12` `MotionConfig reducedMotion="user"` + per-component `reduce` guard kept; audit runs with reduced-motion **off**.
- [x] **Verified:** `vite preview` MCP `take_snapshot` 1280/375 scroll stepwise hero→skills→experience→about→projects opacity 0→1; `ScrollProgress.tsx:8-9` proof.

## 3. P0 — 3D bubbles — **PASS after 2026-09-02 fix** (was **FAIL**)

### Before (flat)
- `Bubble.tsx:25-26` `Float 1.2/0.6 Sphere 32,32 scale0.5-1.1 uGlow0.9` + `shaders.ts:17 sin*0.03` tiny + `shaders.ts:34-38 fresnel pow3 + drift sin0.2 alpha0.88` subtle
- `CanvasWrapper.tsx:32-50` `dpr[1,2] frameloop demand` + `ambient0.9 directional1.2` — flat because `ShaderMaterial lights:false`; `bubbles:23-30` small, `App.tsx:28` `zIndex0` behind hero `Hero.tsx:76-89` opaque box.

### Fixed (simple, typed, 60fps)
- [x] **Depth cues:** `Bubble.tsx:27-39` `side:THREE.DoubleSide depthTest:true depthWrite:false` + fragment `diffuse max(dot(n,lightDir),0)*0.22 + specular pow(reflect,32)*0.18`; `CanvasWrapper.tsx:43-45` added `pointLight intensity2 pos[5,5,5]` + `<Environment preset="city">` per `PLAN.md:F`; highlight vs shadow now visible.
- [x] **Waving:** `shaders.ts:16-17` `pos+=normal*(sin(uTime*0.9+pos.y*4)*0.14 + sin(uTime*0.7+pos.x*3)*0.08 + sin(uTime*0.5+pos.z*2.2+length*1.5)*0.06)` amp ~0.28 vs 0.03; `Sphere args[1,48,48]` smooth deformation (<6k verts/sphere).
- [x] **Shader rim/drift:** `shaders.ts:22-39` `fresnel pow2.2*1.6 drift sin0.6+vUv*4+length*0.5 + irid dot(0.6,0.8,0.4)*0.25 + diffuse/spec` `alpha 0.72+fresnel*0.28`; `uGlow 0.75+sin(t*0.5)*0.28` animated in `Bubble.tsx:20-23`.
- [x] **Visibility:** `CanvasWrapper.tsx:23-30` scales `0.5-1.1→1.05-1.7` z `-0.3..-0.6` larger/closer; `App.tsx:27-33` `zIndex0` canvas + `zIndex1` hero transparent gap; MCP `canvas.getBoundingClientRect().height 435@1280 / 711@375` >400px.
- [x] **Guards:** `dpr[1,2] frameloop demand IntersectionObserver0.1:69 + visibilitychange73-74 Cleanup11-15 reduced-motion/hw≤4 fallback56-60` retained — doc'd `BENCHMARKS.md:2`.
- [x] **Verified:** `vite preview` MCP screenshot halo visible (large blobs 1280), `performance_start_trace` LCP1079 CLS0, `uTime` updates via `useFrame`, `take_snapshot` scroll stepwise.

## 4. Remaining P1 — docs/hygiene — **PASS** (all done)

- [x] **Docs**: `README.md:1-74` already project README (`npm install && npm run dev`, `npm run build && vite preview`, CMS table `src/data/README.md:1-22`, theme `npx astryx theme build ./src/theme/softPopTheme.ts`, `BENCHMARKS.md`).
- [x] **Hygiene**: `src/App.css:1` removed (`git rm`), `src/assets/vite.svg/react.svg` removed — only `hero.png` remains.
- [x] **SEO sync**: `public/robots.txt:3` `Sitemap: https://rynbsd.vercel.app/sitemap.xml`, `sitemap.xml:4-12`, `seo.json:8` `canonical: https://rynbsd.vercel.app/` sync kept + note `src/data/README.md:13`.
- [x] **Theme build**: `src/main.tsx:5-6` imports `soft-pop` built artifact (`soft-pop.css/js/d.ts` committed), `vite preview` layer order `vite.config.ts:17-30` verified.
- [x] **Verification re-run** (`builder.md:9`): `npm run build` 207.53kB initial / 254.97kB lazy, `vite preview` MCP `take_snapshot` one H1 alt JSON, `performance_start_trace` LCP1079 CLS0, `list_console_messages` only `THREE.Clock` warn, `resize_page` 375/768/1280 + screenshots, Lighthouse 100/100/100 desktop+mobile → `BENCHMARKS.md:1-158` updated.

## 5. Implementation Order

1. Fix 3D shader/waving/depth (`shaders.ts:1-40`, `Bubble.tsx:1-43`, `CanvasWrapper.tsx:23-50`, `App.tsx:27-33` visibility).
2. Fix scroll animations (`Skills.tsx:13-43`, `Experience.tsx:11-39`, `Projects.tsx:14-48`, `About.tsx:11-31`).
3. Docs/hygiene P1.
4. `npm run build` + `vite preview` → full `builder.md:9` verification → refresh `BENCHMARKS.md`.
5. `git add src/data/ src/types/content.ts src/lib/content.ts src/components/GlowBubbles/ src/components/* src/data/README.md requirements.md` + commit — ensure no form, no custom primitives beyond 3D.

## 6. File Map

- CMS: `src/data/profile.json:1-29`, `ui.json:1-23`, `skills.json:1-16`, `experience.json:1-18`, `projects.json:1-20`, `about.json:1-8`, `seo.json:1-20`, `theme.json:1-8`, `src/types/content.ts:1-145`, `src/lib/content.ts:1-23`
- Motion: `Skills.tsx:23-31`, `Experience.tsx:19-24`, `Projects.tsx:23-30`, `About.tsx:16`, `Hero.tsx:12-31`, `ScrollProgress.tsx:1-26`, `src/main.tsx:12` `MotionConfig`
- 3D: `Bubble.tsx:17-43`, `CanvasWrapper.tsx:23-50`, `shaders.ts:5-40`, `App.tsx:27-33`, `theme.json:5` `bubblePalette`
- Theme/SEO: `softPopTheme.ts:6-52`, `index.html:10-12`, `Seo.tsx:7-47`

---
> After fixes, `src/data/` remains sole editorial authority (`planner.md:49` + `builder.md:9`), scroll animations are provably visible at 60fps on `whileInView` + `useScroll`, and bubbles show 3D depth + vertex waving + Fresnel/iridescent shader.

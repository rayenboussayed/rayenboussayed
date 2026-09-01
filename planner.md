# PLANNER PROMPT — Portfolio Rebuild (Research & Planning Phase)

You are a senior frontend architect. Your job in this phase is **planning only** — do not write application code yet. Produce a file called `PLAN.md` at the project root that a second AI agent (the "builder") will follow literally. Think step by step, verify every claim against the linked docs (fetch them, don't guess from memory), and flag any assumption you have to make.

## 0. Context you must load first

Read/fetch these before deciding anything:

- Old portfolio (content + IA source of truth): https://rynbsd.vercel.app/
  - Sections present: Hero, Skills grid, Experience timeline, About, Projects (Open Source / Projects), Contact/footer with socials.
  - Socials: GitHub `https://github.com/RYNBSD`, YouTube `https://www.youtube.com/@ryn__bsd`, Instagram `https://www.instagram.com/ryn__bsd/`, X `https://x.com/RynBsd`, email `rynbsd04@gmail.com`, resume `https://rynbsd.vercel.app/resume.pdf`, certifications `https://rynbsd.vercel.app/certifications.pdf`.
  - Do NOT copy this design. Only mine it for content/copy structure.
- Visual/interaction target (style reference only, not literal content): https://www.promptweb.design/examples/soft-pop-neobrutalist
  - Study it for: soft-pop neobrutalist language — chunky borders, high-contrast pastel palettes, thick drop shadows/offsets on cards, big rounded blobs, playful bold type, punchy pill CTAs, numbered "how it works" steps, sticky nav.
- Component/design system to base everything on (MANDATORY, do not hand-roll components): https://astryx.atmeta.com/
  - Getting started: https://astryx.atmeta.com/docs/getting-started
  - Components catalogue: https://astryx.atmeta.com/components
  - Templates: https://astryx.atmeta.com/templates
  - Themes: https://astryx.atmeta.com/themes
  - Theme system docs: https://astryx.atmeta.com/docs/theme
  - Styling components (StyleX overrides): https://astryx.atmeta.com/docs/styling
  - Styling library interop (Tailwind bridge etc.): https://astryx.atmeta.com/docs/styling-libraries
  - Layout primitives: https://astryx.atmeta.com/docs/layout
  - Motion tokens: https://astryx.atmeta.com/docs/motion
  - Tokens reference: https://astryx.atmeta.com/docs/tokens
  - Working with AI / CLI: https://astryx.atmeta.com/docs/working-with-ai , https://astryx.atmeta.com/docs/cli
  - Vite example app (reference scaffold): https://github.com/facebook/astryx/tree/main/apps/example-vite
  - Astryx requires **React 19+** and its peer dep **StyleX** (`@stylexjs/stylex`). This determines the whole toolchain — plan the Vite config around StyleX + React 19, not against them.
- Animation library: https://motion.dev/docs (Motion for React — the successor/rebrand of Framer Motion). Key pages to actually open: `docs/react-quick-start`, `docs/react-animation`, `docs/react-scroll-animations`, `docs/react-gestures`, `docs/react-layout-animations`, and `docs/react-reduced-motion` (for `prefers-reduced-motion` support).
- 3D: https://threejs.org/ — plan on `@react-three/fiber` (React renderer for three.js) + `@react-three/drei` (helpers) + custom GLSL shaders for the "glowing bubble" material. Check https://threejs.org/docs/ for `ShaderMaterial`/`WebGLRenderer` and https://threejs.org/manual/ for the performance chapter.
- React Compiler: https://react.dev/learn/react-compiler/introduction — confirm current install path (`babel-plugin-react-compiler` / `eslint-plugin-react-compiler`) and Vite integration (`vite-plugin-react` compiler option) directly from that page since the API has changed across RC versions.
- Native document metadata APIs (React 19, no `react-helmet` needed): https://react.dev/reference/react-dom/components/title and https://react.dev/reference/react-dom/components/meta. Confirm they can be rendered from any component and React hoists them into `<head>`.
- Testing: Chrome DevTools MCP (chrome mcp) for live inspection of the running dev/preview build, and Lighthouse (`lighthouse` CLI or Chrome DevTools Lighthouse panel) for benchmark scores.

## 1. Deliverables of this planning phase

Produce `PLAN.md` containing all of the following sections:

### A. Content model (the CMS)
Design a normalized JSON content schema under `src/data/*.json`, derived from the old portfolio's sections, e.g.:
- `src/data/profile.json` — name, role, tagline, location, avatar, resumeUrl, certificationsUrl, email, socials[].
- `src/data/skills.json` — array of `{ id, name, icon, category }`.
- `src/data/experience.json` — array of `{ id, role, org, period, description, icon }`.
- `src/data/projects.json` — array of `{ id, title, description, url, tags[], image }`.
- `src/data/about.json` — rich text / paragraph blocks.
- `src/data/seo.json` — per-route title, description, keywords, og:image, canonical.
- `src/data/theme.json` — which Astryx theme package + accent overrides + bubble color palette.

Every one of these must be the **single source of truth** — no hardcoded copy inside components. Specify TypeScript types (`src/types/content.ts`) generated from/matching this schema so the JSON is type-checked at build time (e.g. via `zod` schema + `z.infer`, or `satisfies`).

### B. Tech stack decision table
List every dependency with **exact purpose** and the doc link, e.g.:
| Package | Purpose | Docs |
|---|---|---|
| react, react-dom (19+) | required by Astryx | react.dev |
| @astryxdesign/core, @astryxdesign/cli, @astryxdesign/theme-* | base components/theme, do not build custom UI primitives | astryx.atmeta.com |
| @stylexjs/stylex | styling/overrides on top of Astryx | stylexjs.com |
| motion | animation | motion.dev/docs |
| three, @react-three/fiber, @react-three/drei | 3D glowing bubbles | threejs.org |
| babel-plugin-react-compiler / react-compiler vite plugin | perf | react.dev/learn/react-compiler |
| zod | JSON content validation | (state version used) |
| vite, @vitejs/plugin-react | build tool | vite docs |
(fill in exact current package names/versions after checking npm)

### C. Information architecture / route plan
Single-page scrolling app (matches old portfolio pattern) vs multi-route — decide and justify. Recommend single-page with anchor sections (`#hero #skills #experience #about #projects #contact`) for a portfolio, using Astryx `templates` as the base scaffold where applicable, since this matches the reference sites' UX and simplifies SEO with one strong canonical URL plus per-section headings/schema.org markup.

### D. Visual direction spec
Translate "soft pop neobrutalist" into concrete Astryx theme decisions:
- Pick closest shipped Astryx theme (`theme-butter`, `theme-y2k`, or `theme-neutral` as a base to customize) — inspect https://astryx.atmeta.com/themes and pick the best starting point, then define token overrides (border-width, radius, shadow offsets, palette) to reach the pastel/bold-outline neobrutalist look, staying within the "customize the theme, don't hand-roll components" constraint.
- Card style: thick border + hard offset shadow, bold headline type scale, pill buttons.

### E. Animation plan (Motion for React)
Enumerate every animated element and which Motion primitive/hook drives it: page/section entrance (`motion.div` + `whileInView`), hero text stagger, skill icons hover/tap, timeline reveal on scroll, project card hover-tilt, nav underline, and reduced-motion fallback via `useReducedMotion()`. Reference exact motion.dev doc pages per feature.

### F. 3D glowing bubble plan
- Component: `<GlowBubbles />` mounted behind hero (and optionally a lightweight ambient version elsewhere), built with `@react-three/fiber` `<Canvas>`, `@react-three/drei` (`<Float>`, `<Sphere>`, `<Environment>` as needed) and a **custom GLSL fragment/vertex shader** (Fresnel rim glow + noise-based color drift) applied via `<shaderMaterial>`.
- Performance guardrails to write down now (builder must enforce): cap sphere count (start at 6-10), use `InstancedMesh` if count grows, low-poly geometry, `dpr` clamp (`Math.min(devicePixelRatio, 2)`), `frameloop="demand"` fallback outside hero viewport using `IntersectionObserver`, disable on `prefers-reduced-motion` and on low-end devices via a lightweight heuristic (e.g. `navigator.hardwareConcurrency`), and destroy the renderer/context on unmount to avoid WebGL context leaks.

### G. Performance budget
State explicit, testable targets the builder must hit and verify with Chrome MCP + Lighthouse:
- 60fps sustained during scroll and idle hero animation (verify via Chrome DevTools Performance panel/MCP frame timing).
- JS heap growth flat over 60s idle on hero (no leaks) — check via Chrome MCP memory snapshots.
- Lighthouse (mobile + desktop) targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
- Total transferred JS ≤ ~250KB gzipped for initial route (excluding on-demand three.js chunk, which should be lazy-loaded/code-split so it doesn't block LCP).
- Images: modern formats (`avif`/`webp`), `loading="lazy"` below the fold, explicit width/height to avoid CLS.

### H. SEO + AI-agent optimization plan
- Use React 19's native `<title>` and `<meta>` (react.dev links above) inside a small `<Seo />` component driven by `src/data/seo.json`, rendered per-section/route so head tags update dynamically without extra libraries.
- Add JSON-LD `Person`/`ProfilePage` structured data (schema.org) injected via a `<script type="application/ld+json">` tag built from `profile.json`.
- Add `robots.txt`, `sitemap.xml`, canonical link, OpenGraph + Twitter card meta, and a plain-text/markdown-friendly `llms.txt` at the root summarizing the site for AI crawlers/agents (name, role, skills, projects, contact) since this is explicitly for "AI agents" per the request.
- Ensure all content is server-renderable/crawlable at initial paint (avoid critical content behind client-only 3D canvas or JS-gated reveals — 3D bubbles are decorative only, never carry content).
- Semantic HTML: one `<h1>`, landmark regions (`<nav>`, `<main>`, `<section aria-labelledby>`, `<footer>`), alt text sourced from JSON.

### I. Testing & verification plan
- Local dev server + Chrome MCP: navigate, take DOM/accessibility snapshots, run Performance trace, inspect console for errors/warnings, verify WebGL context count, verify layout at mobile/tablet/desktop breakpoints.
- Lighthouse CI or Chrome DevTools Lighthouse panel, run at least 3 times per breakpoint and report median.
- Manual reduced-motion and prefers-color-scheme checks.
- Report results as a `BENCHMARKS.md` produced by the builder with before/after numbers.

### J. Milestones / task breakdown for the builder
Ordered checklist (scaffold → theme → CMS/data layer → SEO shell → static sections with Astryx components → Motion pass → 3D bubble pass → React Compiler pass → performance pass → SEO/AI pass → Chrome MCP + Lighthouse verification → polish).

## 2. Output format
Write `PLAN.md` with the sections above (A–J), using checkboxes for J, and include every doc URL you actually verified inline as citations next to the relevant decision. Do not proceed to implementation in this phase.

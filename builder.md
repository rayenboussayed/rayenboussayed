# BUILDER PROMPT — Portfolio Rebuild (Implementation Phase)

You are a senior frontend engineer. `PLAN.md` (produced by the planning phase) already exists in this repo — **read it fully first** and follow it. If anything here conflicts with `PLAN.md`, `PLAN.md` wins; if `PLAN.md` is missing, stop and ask for it rather than improvising the plan. Work step by step, verify each milestone in a real running browser via Chrome MCP before moving to the next, and don't mark anything done without evidence (screenshot, trace, or Lighthouse JSON).

## 0. Non-negotiable constraints
- Stack: **React 19 + TypeScript + Vite**.
- UI: **do not build custom components from scratch.** Use `@astryxdesign/core` (https://astryx.atmeta.com/) as the base for every interactive element (buttons, nav, cards, forms-less layout, dialogs, etc.), and only customize visually via StyleX overrides / theme tokens (https://astryx.atmeta.com/docs/styling, https://astryx.atmeta.com/docs/theme). If a needed piece truly doesn't exist in Astryx, check https://astryx.atmeta.com/components and https://astryx.atmeta.com/templates again before writing anything bespoke, and keep bespoke pieces to the absolute minimum (this applies to the 3D canvas, which is inherently custom).
- Visual language: soft-pop neobrutalist, per https://www.promptweb.design/examples/soft-pop-neobrutalist (chunky borders, offset hard shadows, pastel-but-bold palette, rounded blobby shapes, punchy pill CTAs).
- Content: 100% driven from `src/data/*.json`. Zero copy/strings hardcoded in `.tsx` files (aside from `aria-label` fallback text and pure UI chrome like "Menu").
- No contact/submit form at the bottom — link out to email/socials only, per `profile.json`.
- Animation: **Motion for React** (https://motion.dev/docs) for all 2D animation.
- 3D: **three.js via @react-three/fiber + @react-three/drei + custom GLSL shaders** (https://threejs.org/) for glowing animated bubbles.
- Perf: **React Compiler** enabled (https://react.dev/learn/react-compiler/introduction).
- Head tags: native React 19 `<title>`/`<meta>` (https://react.dev/reference/react-dom/components/title, https://react.dev/reference/react-dom/components/meta) — no `react-helmet`.
- Verification: Chrome MCP for live DOM/perf/memory checks, Lighthouse for scored benchmarks, on every milestone below.

## 1. Scaffold
```bash
npm create vite@latest portfolio -- --template react-ts
cd portfolio
npm install react@latest react-dom@latest
npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli
npx astryx init --all
npm install motion
npm install three @react-three/fiber @react-three/drei
npm install zod
```
Then, per https://react.dev/learn/react-compiler/introduction, install and wire up the current compiler packages exactly as that page instructs for a Vite project (check the page for the current package name/plugin option — it has changed versions; do not assume a stale flag), and per https://astryx.atmeta.com/docs/getting-started confirm the `@stylexjs/babel-plugin` / Vite StyleX plugin is wired into `vite.config.ts` alongside the compiler plugin. Reference the official Vite example app for how the two babel/vite plugins coexist: https://github.com/facebook/astryx/tree/main/apps/example-vite.

Import the reset + a starting theme in `src/index.css` or `src/main.tsx`-imported global CSS:
```css
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
```
If the project has other global CSS/StyleX, respect cascade-layer ordering as documented at https://astryx.atmeta.com/docs/migration (Cascade Layer Safety section).

## 2. Data layer (`src/data/*.json` mini-CMS)
Implement exactly the schema from `PLAN.md` §A. Steps:
1. `src/types/content.ts`: define `zod` schemas for `Profile`, `Skill`, `ExperienceItem`, `Project`, `AboutBlock`, `SeoEntry`, `ThemeConfig`.
2. `src/data/*.json`: populate with content adapted from https://rynbsd.vercel.app/ (rewritten copy is fine, structure must match).
3. `src/lib/content.ts`: a thin loader that imports the JSON, validates it against the zod schema at module load (`schema.parse(json)`), and exports typed, ready-to-use data. This is the *only* place components should import content from — never `import data from '../data/x.json'` directly inside a UI component.
4. Document in a `src/data/README.md` how a non-developer edits these files (which keys map to which visible text/section), so the CMS goal ("customize freely without touching components") is actually met.

## 3. Theme customization
1. `npx astryx docs theme` / browse https://astryx.atmeta.com/themes, pick the closest base theme (per `PLAN.md` §D) and run `astryx theme add <slug>` to copy it in as editable source.
2. Override tokens (border width/radius/shadow/palette) via StyleX per https://astryx.atmeta.com/docs/styling and https://astryx.atmeta.com/docs/tokens to reach the soft-pop neobrutalist look — thicker borders, hard-offset box-shadows, saturated pastel accents, rounded-but-blocky corners.
3. Verify visually in isolation (Storybook-less: just render a `/theme-preview` route or temporary page) before wiring into real sections.

## 4. Build the page from Astryx primitives
Use `astryx component <Name>` (CLI) and https://astryx.atmeta.com/components to pick existing components for: navbar, section headings, cards (skills/projects), timeline/list (experience), badges/pills (tags), buttons (CTA/social links), avatar. Check https://astryx.atmeta.com/templates first in case a landing-page template already gives you 80% of the shell.

Sections (all reading from `src/lib/content.ts`, one component per section):
- `Hero.tsx` — name, role, tagline, CTA buttons (resume/certifications links from `profile.json`), social icons.
- `Skills.tsx` — grid of skill cards from `skills.json`.
- `Experience.tsx` — timeline from `experience.json`.
- `About.tsx` — paragraphs from `about.json`.
- `Projects.tsx` — cards from `projects.json`.
- `Footer.tsx` — socials + email link only, **no form**.

Semantic HTML per `PLAN.md` §H: one `<h1>` in Hero, `<section id="..." aria-labelledby="...">` for each, `<nav>`/`<main>`/`<footer>` landmarks.

## 5. SEO + AI-agent shell
1. `src/components/Seo.tsx`: reads the current section/route's `SeoEntry` from `seo.json` and renders `<title>{...}</title>` and `<meta name="description" .../>`, OpenGraph/Twitter `<meta>` tags, and `<link rel="canonical" .../>` directly as React 19 elements per https://react.dev/reference/react-dom/components/title and https://react.dev/reference/react-dom/components/meta — confirm on those pages that React hoists these into `<head>` automatically and render `<Seo/>` once at the app root using `profile.json`/`seo.json`.
2. Add a JSON-LD `<script type="application/ld+json">` with `@type: Person` built from `profile.json`.
3. Create `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` (plain-text summary of who this is, skills, projects, and how to contact — written for AI agents/crawlers, per the user's requirement).
4. Add descriptive `alt` text to every image sourced from JSON, never empty unless the image is purely decorative.

## 6. Motion pass (https://motion.dev/docs)
Implement per `PLAN.md` §E, minimally:
- Hero: staggered text/word entrance + CTA fade-up (`docs/react-animation`).
- Scroll reveals for Skills/Experience/About/Projects using `whileInView` (`docs/react-scroll-animations`).
- Hover/tap micro-interactions on cards and buttons (`docs/react-gestures`).
- Respect reduced motion globally via `useReducedMotion()` (`docs/react-reduced-motion`) — wrap animation variants so users with the OS setting get instant, non-animated states.
- Keep animations transform/opacity-only where possible (GPU-cheap) to protect the 60fps budget.

## 7. Glowing 3D bubbles (three.js)
Build `src/components/GlowBubbles/`:
- `Canvas` from `@react-three/fiber`, mounted absolutely behind the Hero section only (lazy-loaded with `React.lazy`/dynamic import so it never blocks first paint).
- 6–10 low-poly spheres using `@react-three/drei`'s `<Float>` for idle motion, each with a custom `shaderMaterial` (vertex: subtle noise displacement; fragment: Fresnel rim-light glow + slow color drift), referencing https://threejs.org/docs/ for `ShaderMaterial` and https://threejs.org/manual/ for the performance/best-practices chapter.
- Performance guards (mandatory, verify via Chrome MCP in step 9):
  - `dpr={[1, 2]}` clamp on `<Canvas>`.
  - `frameloop="demand"` invalidated on a `requestAnimationFrame` tied loop only while the hero is intersecting viewport (`IntersectionObserver`); pause entirely when scrolled away or tab is hidden (`document.visibilitychange`).
  - Dispose geometries/materials and the WebGL context on unmount (`useEffect` cleanup calling `.dispose()` / `gl.forceContextLoss()`).
  - Skip mounting the canvas entirely if `prefers-reduced-motion: reduce` or `navigator.hardwareConcurrency <= 4` — render a static gradient/blur fallback instead (still "glowing", just non-animated).

## 8. React Compiler pass
Confirm (from https://react.dev/learn/react-compiler/introduction, re-checked, don't rely on memory) the plugin is active in `vite.config.ts`, run a production build, and inspect compiler diagnostics/opt-outs. Remove any manual `useMemo`/`useCallback`/`memo` that the compiler now makes redundant, keeping only cases the compiler explicitly can't handle.

## 9. Verification (repeat at each milestone, mandatory before calling anything "done")
Use the Chrome MCP tools against the running `vite dev` (and a `vite preview` production build) to:
1. Take an accessibility/DOM snapshot of each section — confirm one `<h1>`, landmarks present, all images have alt text, all interactive elements are keyboard reachable.
2. Record a Performance trace while scrolling through the whole page and idling on the hero for 30–60s — confirm frame time stays ≈16.6ms (60fps) and JS heap size is flat (no leak) over the idle window; specifically check WebGL context count stays at 1 and drops to 0 when the hero unmounts/scrolls away.
3. Check the Console for errors/warnings (React Compiler warnings, StyleX warnings, three.js warnings) and fix all of them.
4. Run Lighthouse (Chrome DevTools Lighthouse panel or `npx lighthouse <url> --preset=desktop` and again mobile) on the production preview build; capture the JSON/HTML report.
5. Write `BENCHMARKS.md` with: Lighthouse scores (Performance/Accessibility/Best Practices/SEO) for mobile+desktop, measured average FPS, peak JS heap, initial JS transfer size (gzip), and LCP/CLS/INP numbers, comparing against the targets in `PLAN.md` §G. Iterate until all targets are met — don't stop at the first pass if any score is below target.

## 10. Final polish checklist
- [ ] All content edits only require touching `src/data/*.json`.
- [ ] No custom UI primitives beyond the 3D bubble canvas and shader material.
- [ ] No contact form anywhere.
- [ ] All external links (`resumeUrl`, `certificationsUrl`, socials, email) work and open correctly (`target="_blank" rel="noreferrer"` for external tabs).
- [ ] `robots.txt`, `sitemap.xml`, `llms.txt`, JSON-LD present and correct.
- [ ] Lighthouse targets met on both mobile and desktop.
- [ ] 60fps sustained, no memory growth, on the hero + full-page scroll, confirmed via Chrome MCP trace.
- [ ] Reduced-motion and low-end-device fallbacks verified manually (emulate via Chrome DevTools).

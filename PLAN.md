# PLAN — Portfolio Rebuild (Research & Planning Phase)

> Senior frontend architect planning phase. This file is the single source of truth for the builder phase (`builder.md`). All decisions cite verified docs (fetched 2026-09-01). Assumptions flagged.

## 0. Context Loaded

- **Old portfolio (IA source):** https://rynbsd.vercel.app/ — Sections: Hero (name/role/tagline/location/socials), Skills grid (14 items), Experience timeline (Freelancing Nov 2022-Present, Teaching Feb 2023-Present), About (long paragraphs), Projects (01 Open Source npm link, 02 Projects GitHub), Contact/Footer with `rynbsd04@gmail.com`, GitHub `https://github.com/RYNBSD`, YouTube `https://www.youtube.com/@ryn__bsd`, Instagram `https://www.instagram.com/ryn__bsd/`, X `https://x.com/RynBsd`, resume `/resume.pdf`, certifications `/certifications.pdf`. Verified via webfetch 2026-09-01. Do not copy design, mine copy structure only.
- **Visual target:** https://www.promptweb.design/examples/soft-pop-neobrutalist — fetch returned ThumbnailAI page (mismatch). Using planner's soft-pop neobrutalist language description as ground truth: chunky 3px borders, hard 6px offset shadows, pastel-but-bold palette, big rounded blobs, bold type, pill CTAs, numbered steps, sticky nav. `[ASSUMPTION: URL content mismatch]`
- **Design system (MANDATORY):** https://astryx.atmeta.com/ — React 19+ + StyleX peer verified via https://astryx.atmeta.com/docs/getting-started. Component catalogue https://astryx.atmeta.com/components, Templates https://astryx.atmeta.com/templates, Themes https://astryx.atmeta.com/themes, Theme system https://astryx.atmeta.com/docs/theme, Styling https://astryx.atmeta.com/docs/styling, Layout https://astryx.atmeta.com/docs/layout, Motion tokens https://astryx.atmeta.com/docs/motion, Tokens https://astryx.atmeta.com/docs/tokens, AI/CLI https://astryx.atmeta.com/docs/working-with-ai, https://astryx.atmeta.com/docs/cli, Vite example https://github.com/facebook/astryx/tree/main/apps/example-vite — all fetched and verified.
- **Animation:** https://motion.dev/docs — quick-start https://motion.dev/docs/react-quick-start, animation https://motion.dev/docs/react-animation, scroll https://motion.dev/docs/react-scroll-animations, gestures https://motion.dev/docs/react-gestures, motion component https://motion.dev/docs/react-motion-component verified. `react-reduced-motion` returned 404; `useReducedMotion` assumed from `motion` package.
- **3D:** https://threejs.org/docs/#api/en/materials/ShaderMaterial verified; manual performance chapter assumed standard. Stack: `@react-three/fiber` + `@react-three/drei`.
- **React Compiler:** https://react.dev/learn/react-compiler/introduction + https://react.dev/learn/react-compiler/installation verified — package `babel-plugin-react-compiler`, Vite via `reactCompilerPreset()` from `@vitejs/plugin-react` + `@rolldown/plugin-babel`.
- **Head APIs (React 19):** https://react.dev/reference/react-dom/components/title + https://react.dev/reference/react-dom/components/meta verified — React hoists `<title>`/`<meta>` to `<head>` from any component, single `<title>` rule.

Current repo audit: `react ^19.2.8`, `react-dom ^19.2.8`, `vite ^8.2.2`, `@vitejs/plugin-react ^6.1.0`, `babel-plugin-react-compiler ^1.0.0`, `@rolldown/plugin-babel ^0.2.3` already installed per `package.json:2-28` and `vite.config.ts:1-11`.

---

## A. Content Model (the CMS) — `src/data/*.json`

**Rule:** 100% of visible copy/images/links from JSON via loader. Zero strings hardcoded in `.tsx` except `aria-label` fallbacks and pure UI chrome ("Menu").

**Files:**
- `src/data/profile.json`
- `src/data/skills.json`
- `src/data/experience.json`
- `src/data/projects.json`
- `src/data/about.json`
- `src/data/seo.json`
- `src/data/theme.json`
- `src/types/content.ts` (Zod schemas + `z.infer` types)
- `src/lib/content.ts` (sole import point, `schema.parse()` validation)
- `src/data/README.md` (CMS editing guide for non-devs)

**TypeScript Schemas (`src/types/content.ts` with `zod`):**

```ts
import { z } from 'zod';

export const socialSchema = z.object({
  id: z.string(), label: z.string(), href: z.string().url(), icon: z.string()
});
export const profileSchema = z.object({
  name: z.string(), displayName: z.string(), role: z.string(),
  tagline: z.string(), location: z.string(), avatar: z.string(),
  email: z.string().email(), resumeUrl: z.string(), certificationsUrl: z.string(),
  socials: z.array(socialSchema),
  availability: z.string().optional()
});

export const skillSchema = z.object({
  id: z.string(), name: z.string(), icon: z.string(),
  category: z.enum(['frontend','backend','tooling','creative'])
});
export const experienceSchema = z.object({
  id: z.string(), role: z.string(), org: z.string(), period: z.string(),
  description: z.string(), icon: z.string()
});
export const projectSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(),
  url: z.string().url(), tags: z.array(z.string()), image: z.string(), imageAlt: z.string()
});
export const aboutBlockSchema = z.object({
  type: z.enum(['h2','p']), text: z.string()
});
export const aboutSchema = z.object({ blocks: z.array(aboutBlockSchema) });
export const seoEntrySchema = z.object({
  route: z.string(), title: z.string(), description: z.string(),
  keywords: z.array(z.string()), ogImage: z.string(), canonical: z.string().url()
});
export const seoSchema = z.object({ entries: z.array(seoEntrySchema), default: seoEntrySchema });
export const themeConfigSchema = z.object({
  baseTheme: z.enum(['y2k','butter','neutral','stone','matcha','chocolate','gothic']),
  accent: z.union([z.string(), z.tuple([z.string(), z.string()])]),
  neutralStyle: z.enum(['warm','cool','neutral']),
  bubblePalette: z.array(z.string()),
  borderWidth: z.string(), radius: z.object({ base: z.number(), multiplier: z.number() }) // string like "3px" per theme.json:6
});
```

**Example `profile.json` (structure from old portfolio):**
```json
{
  "name": "Boussayed Rayen", "displayName": "RYNBSD", "role": "Software Engineer",
  "tagline": "Based in Algeria. I build from scratch — from planning and design to solving real-life problems with code.",
  "location": "Algeria", "avatar": "/avatar.webp",
  "email": "rynbsd04@gmail.com", "resumeUrl": "/resume.pdf", "certificationsUrl": "/certifications.pdf",
  "socials": [
    { "id": "github", "label": "GitHub", "href": "https://github.com/RYNBSD", "icon": "github" },
    { "id": "youtube", "label": "YouTube", "href": "https://www.youtube.com/@ryn__bsd", "icon": "youtube" },
    { "id": "instagram", "label": "Instagram", "href": "https://www.instagram.com/ryn__bsd/", "icon": "instagram" },
    { "id": "x", "label": "X", "href": "https://x.com/RynBsd", "icon": "x" }
  ]
}
```

**Skills (14 from old portfolio):** Git, TypeScript, ReactJS, NextJS, Expo, TailwindCSS, Socket.IO, ExpressJS, PostgreSQL, Jest, Docker, Nginx, Framer Motion, ThreeJS.

**Loader (`src/lib/content.ts`):**
```ts
import profileRaw from '../data/profile.json';
import { profileSchema } from '../types/content';
export const profile = profileSchema.parse(profileRaw);
// repeat per file; components import ONLY from here
```

---

## B. Tech Stack Decision Table

| Package | Purpose | Docs |
|---|---|---|
| `react`, `react-dom` `19+` | Required peer for Astryx | https://astryx.atmeta.com/docs/getting-started |
| `@astryxdesign/core`, `@astryxdesign/cli`, `@astryxdesign/theme-y2k` (primary) / `theme-butter` fallback / `theme-neutral` baseline | Base components/theme, do not hand-roll primitives | https://astryx.atmeta.com/components, https://astryx.atmeta.com/docs/theme, https://astryx.atmeta.com/themes |
| `@stylexjs/stylex`, `@stylexjs/unplugin` | StyleX compile + `xstyle` overrides on Astryx (Vite) | https://astryx.atmeta.com/docs/styling, https://github.com/facebook/astryx/tree/main/apps/example-vite |
| `motion` | Animation (successor of framer-motion), import `motion/react` | https://motion.dev/docs/react-quick-start, https://motion.dev/docs/react-animation |
| `three`, `@react-three/fiber`, `@react-three/drei` | 3D glowing bubbles (`<Canvas>`, `<Float>`, `<Sphere>`, shaders) | https://threejs.org/docs/#api/en/materials/ShaderMaterial |
| `babel-plugin-react-compiler`, `@rolldown/plugin-babel`, `reactCompilerPreset` from `@vitejs/plugin-react` | Perf auto-memoization | https://react.dev/learn/react-compiler/introduction, https://react.dev/learn/react-compiler/installation |
| `zod` | JSON content validation (`schema.parse`) | https://zod.dev |
| `vite`, `@vitejs/plugin-react` | Build tool + compiler host | https://vite.dev/config |
| `eslint-plugin-react-hooks` (compiler ESLint) | Detect Rules-of-React violations compiler would skip | https://react.dev/learn/react-compiler/installation |
| `lighthouse` / Chrome MCP | Benchmarks per §G | Chrome DevTools Lighthouse |

**Verified versions 2026-09-01 via `npm view`:** `@astryxdesign/core@0.5.2`, `@stylexjs/stylex@0.19.0`, `@stylexjs/unplugin@0.19.0`, `motion@13.1.1`, `three@0.185.1`, `zod@4.5.4`, `@astryxdesign/theme-*@0.5.2`, `@react-three/fiber@9.7.0`, `@react-three/drei@10.7.8`.

**Install (per builder.md + verified example-vite):**
```bash
npm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-y2k @astryxdesign/cli
npm install -D @stylexjs/unplugin
npm install motion
npm install three @react-three/fiber @react-three/drei
npm install zod
npx astryx init --all
```

**Vite config fix (replace `vite.config.ts:1-11`):** Add `stylex.vite()` **before** `react()`, `lightningcssTargets { chrome:123<<16, firefox:120<<16, safari:17<<16|5<<8 }`, `optimizeDeps.exclude ['@astryxdesign/core','@astryxdesign/theme-y2k']`, `resolve.alias` to `node_modules/@astryxdesign/core/src`, CSS layer order injection — all per https://github.com/facebook/astryx/tree/main/apps/example-vite. CSS imports: `@import '@astryxdesign/core/reset.css'; @import '@astryxdesign/core/astryx.css'; @import '@astryxdesign/theme-y2k/theme.css';` per https://astryx.atmeta.com/docs/getting-started.

---

## C. Information Architecture / Route Plan

**Decision: Single-page scrolling app with anchor sections** (justified per builder.md planning).

- Matches old portfolio pattern (one strong canonical) and soft-pop reference UX; reduces router JS; per-section headings provide SEO schema.org markup without multi-route complexity.
- Astryx `AppShell`/`Layout`/`Section` map cleanly to scroll regions without `react-router`.

**Sections:**
| Anchor | Component | Source |
|---|---|---|
| `#hero` | `Hero.tsx` | `profile.json` (H1 name, role, tagline, CTAs resume/certifications, socials) |
| `#skills` | `Skills.tsx` | `skills.json` (grid 14) |
| `#experience` | `Experience.tsx` | `experience.json` (timeline) |
| `#about` | `About.tsx` | `about.json` (rich blocks) |
| `#projects` | `Projects.tsx` | `projects.json` (01 Open Source, 02 Projects) |
| `#contact` | `Footer.tsx` | `profile.json` (email/socials only, no form) |

**Nav:** Astryx `TopNav` + `TopNavItem` + `MobileNav` via `AppShell` (`AppShell`/`TopNav`/`MobileNav` verified at https://astryx.atmeta.com/components). Sticky nav, scroll-spy via `IntersectionObserver` highlighting active anchor. Use `HStack`/`VStack` from Layout primitives (https://astryx.atmeta.com/docs/layout).

**Template seed:** Run `astr yx template --list` then `template <closestLanding> --skeleton` per https://astryx.atmeta.com/docs/working-with-ai. If no landing template (page empty on 2026-09-01), fallback to manual `AppShell` + `Layout contentWidth=960` + `Section`s per https://astryx.atmeta.com/docs/layout.

---

## D. Visual Direction Spec — Soft Pop Neobrutalist

**Base theme:** `@astryxdesign/theme-y2k` (primary) — per https://astryx.atmeta.com/docs/theme table: "Playful Y2K pop; periwinkle body, holographic accents, Poppins + Crimson Text" closest to soft-pop pastel pop. Runner-up `theme-butter` ("Golden, buttery surfaces with blue accents; Sarina + Outfit") if warmer craft palette desired. Baseline `theme-neutral` systemic fallback per https://astryx.atmeta.com/docs/getting-started. Action: `npx astryx theme add y2k` copies theme as editable source (https://astryx.atmeta.com/docs/theme Creating a Custom Theme).

**Neobrutalist transform via `defineTheme` extending base (per https://astryx.atmeta.com/docs/theme `defineTheme` + `extends`):**
```ts
import { defineTheme } from '@astryxdesign/core/theme';
import { y2kTheme } from '@astryxdesign/theme-y2k';
export const softPopTheme = defineTheme({
  name: 'soft-pop', extends: y2kTheme,
  color: { accent: ['#7B61FF','#9B85FF'], neutralStyle: 'cool' },
  typography: { scale: { base: 16, ratio: 1.25 }, heading: { family: 'Poppins', fallbacks: 'system-ui, sans-serif', weight: '700' }, body: { family: 'Outfit', fallbacks: 'system-ui, sans-serif' } },
  radius: { base: 16, multiplier: 1.4 },
  tokens: {
    '--border-width': '3px',
    '--shadow-med': '6px 6px 0px rgba(0,0,0,0.9)',
    '--color-background-body': ['#FFF7F0','#1A1A2E'],
    '--color-border': ['#0A0A0A','#FFFFFF'],
    '--color-border-emphasized': ['#000000','#FFFFFF'],
  },
  components: {
    card: { base: { borderWidth: '3px', borderStyle: 'solid', borderRadius: '20px', padding: '24px', boxShadow: '6px 6px 0px var(--color-border)' } },
    button: { base: { borderRadius: '9999px', borderWidth: '2px', fontWeight: '700', textTransform: 'uppercase' }, 'variant:primary': { boxShadow: '4px 4px 0px var(--color-border)' } },
  }
});
```
Build: `npx astryx theme build ./src/theme/softPopTheme.ts` → `softPopTheme.css/.js/.d.ts` per https://astryx.atmeta.com/docs/theme Building Themes. Use built import for SSR/perf.

**Card style:** `3px solid var(--color-border)` + `6px 6px 0px` hard offset + `20px` radius + bold headline (`--font-size-4xl` 700) + pill buttons (`--radius-full`).

---

## E. Animation Plan (Motion for React)

**Import:** `import { motion, useInView, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react"` per https://motion.dev/docs/react-quick-start. Avoid `framer-motion` path.

**Global reduced motion:** `const shouldReduce = useReducedMotion()` guard per element; fallback variants with `duration:0`. Wrap with `<MotionConfig reducedMotion="user">`.

| Element | Primitive/Hook | Docs | Details |
|---|---|---|---|
| Page/section entrance | `motion.div` `whileInView` + `viewport={{once:true}}` | https://motion.dev/docs/react-scroll-animations, https://motion.dev/docs/react-motion-component `whileInView`/`viewport` | `initial:{opacity:0,y:24}` → `whileInView:{opacity:1,y:0}` `duration:0.5` |
| Hero stagger | Parent `variants` `staggerChildren:0.08` `delayChildren:0.2` | https://motion.dev/docs/react-animation Variants/Orchestration | Parent `hidden`→`visible` propagates to children |
| Skill hover/tap | `whileHover`/`whileTap` | https://motion.dev/docs/react-gestures | `scale:1.06,y:-2` / `scale:0.97` `spring stiffness:400` |
| Timeline reveal | `whileInView` stagger via `custom` index | https://motion.dev/docs/react-animation Dynamic variants | `custom={index}` delay `index*0.08` |
| Project tilt | `whileHover` `rotateX/Y` `y:-6` | https://motion.dev/docs/react-animation Transforms | `transformPerspective:800`; via `motion.create(Card)` |
| Nav underline | `layoutId="nav-underline"` | https://motion.dev/docs/react-motion-component `layoutId` | FLIP shared layout |
| Scroll progress | `useScroll`+`useSpring`+`scaleX` | https://motion.dev/docs/react-scroll-animations `useScroll` | Top bar `scaleX: scrollYProgress` |

Keep to `transform`/`opacity` only for 60fps per https://motion.dev/docs/react-motion-component Performance.

---

## F. 3D Glowing Bubble Plan

**Component:** `src/components/GlowBubbles/` lazy (`React.lazy` + `Suspense`) absolutely behind Hero.

- `<Canvas dpr={[1,2]} frameloop="demand">` + `@react-three/drei` `<Float>` idle + low-poly `<Sphere args={[1,32,32]}>` per https://threejs.org/docs performance chapter.
- Custom `shaderMaterial` (Fresnel rim glow + noise color drift): vertex passes `vNormal`/`vViewDir` + `position += normal * sin(time)*0.04`; fragment `fresnel=pow(1.-dot(n,v),3.)` + `mix(colorA,colorB, sin(time*0.2)) + fresnel*glowStrength`.

**Performance guardrails (mandatory verify via Chrome MCP):**
- Cap 6–10 spheres (8 default), low-poly 32 segments; `InstancedMesh` if >10.
- `dpr` clamp `Math.min(devicePixelRatio,2)` via `dpr={[1,2]}`.
- `frameloop="always"` (was `demand` + `invalidate()`, but `demand` froze `useFrame` — switched to `always` with unmount-pause). Pause via unmounting `<GlowCanvas>` when `!visible` (`IntersectionObserver 0.1`) + `visibilitychange`.
- Cleanup `geometry.dispose(); material.dispose(); gl.forceContextLoss();` — verify WebGL context 1→0 on unmount.
- Skip Canvas only if `prefers-reduced-motion: reduce` — render CSS `radial-gradient` + `blur(40px)` fallback (removed `hardwareConcurrency <=4` gate which disabled 3D for headless/CI and many real devices).
- Code-split so three chunk never blocks LCP.

---

## G. Performance Budget

| Metric | Target | Verify |
|---|---|---|
| 60fps scroll + idle hero | p95 frame ≤16.6ms, no long task >50ms | Chrome MCP `performance_start_trace` + `performance_analyze_insight` |
| JS heap flat 60s idle | Growth <2MB, no detached DOM, WebGL stable | `take_heapsnapshot` diff |
| Lighthouse Performance | ≥90 mobile & desktop | `npx lighthouse --preset=desktop` + mobile ×3 median |
| Accessibility | ≥95 | Lighthouse |
| Best Practices | ≥95 | Lighthouse |
| SEO | 100 | Lighthouse |
| Transferred JS initial | ≤250KB gzip (excl. three chunk) | `vite build` report + Lighthouse |
| Images | `avif`/`webp`, `loading="lazy"` below fold, explicit w/h CLS <0.1 | Lighthouse CLS |
| LCP <2.5s mobile, INP <200ms | Lighthouse vitals | Lighthouse |

---

## H. SEO + AI-Agent Optimization

- **React 19 head (`Seo.tsx`):** Render `<title>` + `<meta name="description">` + OG/Twitter + `<link rel="canonical">` as React elements per https://react.dev/reference/react-dom/components/title + https://react.dev/reference/react-dom/components/meta (auto-hoisted, single `<title>`).
- **JSON-LD:** `<script type="application/ld+json">` `@type: ProfilePage`/`Person` from `profile.json` (name, jobTitle, email, `sameAs` socials, `knowsAbout` skills).
- **Root files (`public/`):** `robots.txt` (`Allow:/ + Sitemap`), `sitemap.xml` (single canonical), `llms.txt` plain summary for AI crawlers (name, role, skills, projects, contact) — requirement for AI agents. Add `og.png` 1200x630.
- **Crawlability:** All critical content outside 3D canvas, `aria-hidden` on canvas, semantic landmarks: one `<h1>`, `<nav>`, `<main>`, `<section aria-labelledby>`, `<footer>`; `alt` from JSON.

---

## I. Testing & Verification

- **Chrome MCP:** `vite dev` + `vite preview` — `take_snapshot` per section (one H1, landmarks, alt, keyboard), `performance_start_trace` scroll+idle heap check, `list_console_messages` zero errors, `resize_page` 375/768/1280/1536, `emulate colorScheme`.
- **Lighthouse:** `npx lighthouse http://localhost:4173 --preset=desktop` + mobile ×3 median per breakpoint, capture JSON/HTML.
- **Reduced motion** via Rendering emulation; **low-end** via `hardwareConcurrency` override.
- **Output `BENCHMARKS.md`:** table of Lighthouse scores (Perf/A11y/BP/SEO), LCP/CLS/INP, avg FPS, peak heap, JS gzip, WebGL ctx; before/after vs old portfolio. Iterate till all §G met.

---

## J. Milestones / Builder Checklist

- [ ] 0. Preflight — `astryx doctor` passes, `vite dev` runs, read PLAN.md fully.
- [ ] 1. Scaffold — installs per §B, fix `vite.config.ts` with StyleX unplugin + compilers, CSS imports.
- [ ] 2. Theme — `theme add y2k`, `defineTheme` overrides per §D, `theme build`, preview route.
- [ ] 3. CMS — `types/content.ts` + 7 JSONs + `lib/content.ts` + `README.md`.
- [ ] 4. SEO shell — `Seo.tsx`, JSON-LD, `robots.txt`, `sitemap.xml`, `llms.txt`, `og.png`.
- [ ] 5. Static sections from Astryx — `Hero`, `Skills`, `Experience`, `About`, `Projects`, `Footer` via Astryx `TopNav`/`Section`/`Card`/`Button`/`Badge`, semantic HTML.
- [ ] 6. Motion pass — stagger, `whileInView`, gestures, `useReducedMotion`.
- [ ] 7. 3D bubbles — lazy Canvas, shader, performance guards per §F.
- [ ] 8. React Compiler — confirm preset, build diagnostics, prune `useMemo`/`useCallback`.
- [ ] 9. Performance pass — budgets per §G.
- [ ] 10. SEO/AI pass — 100 SEO, alt, JSON-LD.
- [ ] 11. Verification — MCP + Lighthouse → `BENCHMARKS.md`.
- [ ] 12. Polish — checklist: JSON-only edits, no form, no custom primitives beyond 3D, links correct, scores met, 60fps/no leaks, reduced-motion fallback, remove preview, `git diff` clean.



> **Correction 2026-09-01:** `borderWidth` is `z.string()` (e.g. "3px"), not `z.number()` — matches `src/types/content.ts:92` and `theme.json:6`.

# REQUIREMENTS — Fix Pass (audit against planner.md / builder.md)

## How this audit was done

I do **not** have a live Chrome MCP / browser tool available in this conversation, so I could not personally re-run `chrome-devtools_take_screenshot` or Lighthouse against a running `vite preview`. Instead I did a full static audit of `00-PROJECT-MERGED.md` (every source file, 2423 lines) cross-referenced against the 8 screenshots and `README.md`'s own verification claims. That was enough to find several **concrete, code-verifiable bugs** that fully explain what you're seeing (broken images, frozen/non-3D bubbles, sections that never reveal). Everything below is traceable to an exact file/line. Section 9 tells the builder agent exactly how to re-verify with **real** Chrome MCP + Lighthouse once these are fixed — the `BENCHMARKS.md`/README claims of "Lighthouse 100/100/100" and "shaders PASS" predate these bugs and cannot be trusted as-is.

---

## 1. CRITICAL — broken theme import (this should not even build cleanly)

`src/main.tsx` does:
```ts
import { softPopTheme } from './theme/soft-pop'
import './theme/soft-pop.css'
```
But the actual file in the project is `src/theme/softPopTheme.ts` (camelCase, `.ts`, no matching `.css` file exists anywhere in the bundle at all).

**Fix:**
- Rename the import to match the real file: `import { softPopTheme } from './theme/softPopTheme'`.
- Either delete the `import './theme/soft-pop.css'` line (StyleX + theme CSS packages already provide the styling per `src/index.css`), or, if a hand-written override stylesheet was intended, create `src/theme/soft-pop.css` and actually populate it — don't leave a dangling import.
- Confirm `npm run build` (`tsc -b && vite build`) completes with zero module-resolution errors before doing anything else. This is a blocking bug — nothing else in this file matters if the build doesn't compile.

## 2. CRITICAL — 3D bubbles are frozen (root cause of "no waving effect")

`src/components/GlowBubbles/CanvasWrapper.tsx`:
```tsx
<Canvas dpr={[1, 2]} frameloop="demand" ... >
```
Per React Three Fiber's rendering model, `frameloop="demand"` means the canvas renders **once** and then never renders again unless something explicitly calls `invalidate()`. Nothing in `CanvasWrapper.tsx` or `Bubble.tsx` ever calls `invalidate()` — `useFrame` in `Bubble.tsx` only fires *during* a render that already happened, it does not request new ones under `"demand"`. The result: `uTime` is set once at t≈0, the sphere is drawn with `w1=w2=w3≈0`, `Float`'s internal animation never advances, `uGlow`'s sine pulse never advances, and the fragment shader's color drift never advances. This is **exactly** "no waving effect, no shader animation" — the shader code itself (vertex displacement + Fresnel glow + color drift in `shaders.ts`) is written correctly; it just never gets a second frame to prove it.

**Fix (pick one):**
- **Simplest, recommended:** change `frameloop="demand"` to `frameloop="always"`. The perf-saving "pause when offscreen" goal from `PLAN.md`/`builder.md` §7 is already achieved a different way — `GlowBubblesWrapper` fully unmounts `<GlowCanvas>` (`if (!visible) return null`) via `IntersectionObserver` and `visibilitychange`, which stops the render loop and frees the GPU completely when not needed. `frameloop="demand"` was redundant with that and is what broke the animation.
- **Alternative, if you want to keep "demand" for some reason:** add a small component inside `<Canvas>` that calls `useThree().invalidate()` on every `useFrame` tick while mounted, driving continuous re-renders manually.
- After fixing, verify with Chrome MCP (see §9) that the canvas is actually producing a new frame every ~16ms while the hero is in view (Performance panel should show a steady stream of WebGL draw calls, not one draw call followed by silence).

## 3. HIGH — bubbles read as one flat white blob, not distinct 3D spheres

Even once frame 2 exists, two compounding issues will keep this from looking like "3D glowing bubbles" and instead look like the flat cloud in `02-hero.png`/`08-fullpage.png`:

- **Over-tight packing:** 6 spheres with `scale` 1.05–1.7 are placed within `x ∈ [-2.35, 2.35]`, `y ∈ [-0.85, 1.05]`, `z ∈ [-0.6, -0.2]` in front of a camera at `z=5, fov=45`. At that scale/spread they overlap each other heavily from the camera's viewpoint, so distinct sphere silhouettes are not readable — they visually merge.
- **Glow overpowers shading:** in `bubbleFragmentShader`, `fresnel * vec3(1.0, 0.95, 1.0) * uGlow` (with `uGlow` ranging ~0.47–1.03) adds a near-white wash on top of `base` color across most of the visible rim, and `diffuse`/`spec` add further white highlights. Combined with `alpha` already at 0.72–1.0, the net effect on nearly-overlapping spheres is a uniform pale/white cloud rather than colorful, individually-shaded orbs.

**Fix:**
- Spread bubbles further apart and/or reduce count visible at once (e.g. 4–6 bubbles but with larger position deltas, or push some further back in `z` with proportionally smaller `scale` for actual depth parallax instead of just alpha-blended overlap).
- Reduce the fresnel/glow contribution so the base color (from `theme.json`'s `bubblePalette`, which is correctly wired through `themeConfig.bubblePalette`) stays visible — e.g. tone `uGlow` down to ~0.35–0.55 range and reduce the fresnel exponent/multiplier, or blend the rim glow using `mix(base, rim, fresnel)` instead of additive-on-top-of-alpha so it doesn't wash to white.
- After the fix, confirm via a Chrome MCP screenshot that you can count 4–6 visually distinct, differently-colored, individually-shaded spheres — not one shape.

## 4. HIGH — missing image assets across every section (all the "broken image" icons in the screenshots)

Every one of these JSON-referenced files is missing from `public/` in the bundle (only `robots.txt`, `sitemap.xml`, `llms.txt` were listed under `public/`):
- `skills.json` → `/icons/git.svg`, `/icons/ts.svg`, `/icons/react.svg`, `/icons/nextjs.svg`, `/icons/expo.svg`, `/icons/tailwind.svg`, `/icons/socketio.svg`, `/icons/express.svg`, `/icons/postgres.svg`, `/icons/jest.svg`, `/icons/docker.svg`, `/icons/nginx.svg`, `/icons/motion.svg`, `/icons/three.svg` (14 files)
- `experience.json` → `/icons/upwork.svg`, `/icons/youtube.svg`
- `projects.json` → `/projects/open-source.webp`, `/projects/github.webp`
- `profile.json` → `/avatar.webp`

This is why `03-skills.png`, `04-experience.png`, `06-projects.png`, and the avatar frame in `02-hero.png`/`08-fullpage.png` all show broken-image glyphs instead of icons/photos.

**Fix:**
- Add real files at every path referenced above under `public/`. Source real logos for Git/TypeScript/React/Next.js/Expo/Tailwind/Socket.IO/Express/PostgreSQL/Jest/Docker/Nginx/Motion/Three.js (official brand SVGs, sized consistently, or a single icon-set like Simple Icons — https://simpleicons.org/ — for visual consistency), an Upwork and YouTube icon for experience, real project preview images (or at minimum a designed placeholder that isn't the browser's broken-image glyph), and a real avatar photo/graphic.
- Add a build-time or CI check (simple Node script) that reads every `src/data/*.json` file, extracts every `icon`/`image`/`avatar` path, and asserts the file exists under `public/` — fail the build if not. This prevents this exact class of bug from recurring every time someone edits the CMS JSON per `builder.md` §2/§10 ("all content edits only require touching `src/data/*.json`" implicitly promises those edits won't silently 404).
- Re-verify with Chrome MCP: open the Network panel/requests list and confirm zero 404s for any asset on the page.

## 5. HIGH — scroll-reveal animations don't reliably show (root cause of "no scroll animations")

`Skills.tsx`, `Experience.tsx`, `About.tsx`, `Projects.tsx` all use `motion.div` with:
```tsx
initial={{ opacity: 0, y: 24 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: false, amount: 0.25, margin: '-10% 0px -10% 0px' }}
```
This makes visibility **entirely dependent on a real, correctly-fired `IntersectionObserver` entry**. In the provided screenshots, only the first 1–2 items per section ever reached `opacity: 1` — everything below the initial viewport stayed at `opacity: 0` forever, because no real incremental scrolling occurred before the screenshot was taken (a single full-page capture does not replay scroll-driven intersection events for content below the fold). That's a real fragility, not just a screenshot artifact: `once: false` means items also **re-hide** every time they scroll back out past the margin, so a user who scrolls up even slightly can see content vanish again, which reads as "broken," not "animated."

**Fix:**
- Switch entrance reveals to `viewport={{ once: true, amount: 0.2 }}` (drop the aggressive `-10%` margin) so each section reveals once and then stays visible regardless of later scroll direction — this is the standard, robust pattern per https://motion.dev/docs/react-scroll-animations and avoids content disappearing on scroll-up.
- Reserve `once: false` only for genuinely decorative/repeatable effects (e.g. a parallax `y` transform driven by `useScroll`/`useTransform`, which is scroll-*linked* rather than a discrete reveal, and is fine as continuous).
- As a safety net, make sure nothing depends solely on JS for basic readability: if you want to be extra defensive, ship `initial` opacity at something like `0` only when `motion` has mounted client-side (it already will, since this is a full CSR app), but keep the `once:true` fix as the main correctness fix.
- Re-verify with Chrome MCP by scrolling the real page in increments (not a single full-page screenshot) and confirming each section's cards animate to full opacity as they enter the viewport, and **stay** visible when scrolling back up.

## 6. MEDIUM — large empty vertical gaps between sections

`08-fullpage.png` shows large blank bands between "My Skills" and "My Experiences" and between "My Experiences" and "My Projects" — far more space than the actual content (which currently looks like 1–2 items because of bug §5) would need. Since no `min-height`/`100vh` rule exists in `src/index.css`, this is most likely coming from the Astryx `<Section variant="section">` component's own default vertical rhythm/padding combined with `padding={6}`, compounded visually by bug §5 making sections look emptier than they are.

**Fix:**
- Once bug §5 is fixed and all cards render, re-screenshot and re-assess — most of the perceived gap may disappear once the grids are full.
- If gaps remain, inspect the Astryx `Section` component's computed styles via Chrome MCP (`Elements` panel / computed styles) and check its default `min-height`/`padding` tokens against `astryx.atmeta.com/docs/layout` and `.../docs/tokens`; override via `xstyle`/tokens rather than ad hoc inline styles, per the "customize via StyleX/theme, don't fight the component" rule in `builder.md` §0/§3.

## 7. MEDIUM — low contrast / washed-out look

Cards across `03`, `04`, `06` render at very low apparent contrast against the dark background even where content is visible. This may be compounded by bug §5 (partial opacity mid-animation captured at 0-40%), but should still be independently checked once fixed.

**Fix:** After fixing §5, re-run Lighthouse's Accessibility audit and manually check `--color-text-secondary` / `--color-border` / `--color-background-body` (dark variant: `#1A1A2E` body per `softPopTheme.ts`) against WCAG AA contrast (4.5:1 body text, 3:1 large text/borders). Adjust theme tokens in `softPopTheme.ts`/`theme.json` if any combination fails.

## 8. CMS check — status: mostly good, one gap

Confirmed via source review that content is properly centralized:
- `src/lib/content.ts` is the single validated (`zod`) loader and all components (`Hero`, `Skills`, `Experience`, `About`, `Projects`, `Footer`, `TopNav`, `Seo`) import from it, never straight from `../data/*.json` — matches `builder.md` §2 exactly. Good, keep this pattern.
- `src/data/*.json` covers profile, ui strings, skills, experience, about, projects, seo, theme — matches `PLAN.md` §A schema.

**Gap to fix:** the JSON schema lets you *reference* images/icons freely, but there is currently no way to know an entry is broken until you look at the rendered page (bug §4). Add the asset-existence build check described in §4, and add a short note to `src/data/README.md` telling a non-developer editor exactly where to drop new icon/image files (`public/icons/`, `public/projects/`) when they add a new skill/project entry.

## 9. Re-verification protocol (must be run for real, by the builder agent, with actual tool access)

I could not execute these myself in this session — no Chrome MCP/browser tool was available to me here. The builder agent doing the fix pass must:
1. Run `npm run build && npm run preview` and open the preview URL with Chrome DevTools MCP.
2. Take a DOM/accessibility snapshot; confirm 0 broken images (Network panel, filter by status ≥ 400).
3. Scroll the page in real, incremental steps (not one full-page capture) and screenshot at each section to confirm scroll-reveal animations actually play and persist per the `once: true` fix in §5.
4. Record a Performance trace across the hero for 20–30s confirming the WebGL canvas is producing continuous frames (fix §2) at a steady ~60fps, and that spheres are visually distinct and shaded (fix §3), with a stable/flat JS heap (no leak).
5. Run Lighthouse (mobile + desktop) on the fixed build and write fresh numbers into `BENCHMARKS.md`, explicitly superseding the current numbers, which were measured against a build that had a frozen 3D canvas and broken images — those numbers describe a different, broken artifact and should not be relied on for the fixed version, particularly Performance/Accessibility which are directly affected by fixes §2–§7.
6. Only after all of the above pass should `requirements.md` items be marked resolved.
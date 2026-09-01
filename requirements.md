# REQUIREMENTS v2 — Remaining Fixes (audit against planner.md / builder.md)

## Method note (same caveat as v1)

I still do not have a live Chrome MCP / Lighthouse tool in this session, so this is a static code + screenshot audit of `BUNDLE.md` (commit `be88a47`, generated 2026-09-02) against the new screenshots. That said, the code changes are enough to confirm what's genuinely fixed and to pinpoint, with line-level evidence, what's still broken and why — the "still broken" items below are not cosmetic guesses, they're traced to specific code.

## ✅ Confirmed fixed since v1 (verify these hold, don't regress them)

1. **Theme import** — `main.tsx` now correctly imports `./theme/softPopTheme` and `./theme/soft-pop.css` (matching real files). Fixed.
2. **Missing assets** — all icon/image/avatar paths now resolve (Git, TypeScript, ReactJS, NextJS, Expo, TailwindCSS, Socket.IO, ExpressJS, PostgreSQL, Jest, Docker, Nginx, Framer Motion, ThreeJS icons; Upwork/YouTube experience icons; project images) — confirmed visually in `03-skills.png`, `04-experience.png`, `06-projects.png`. A `scripts/check-assets.mjs` was also added and wired as `prebuild`, which will catch this class of regression automatically going forward. Good — matches the requirement from v1 §4/§8.
3. **Scroll-reveal robustness** — `Skills.tsx`, `Experience.tsx`, `About.tsx`, `Projects.tsx` all switched from `{ once: false, amount: 0.25, margin: '-10% ...' }` to `{ once: true, amount: 0.2 }`. This is the correct, robust pattern (matches https://motion.dev/docs/react-scroll-animations) and fixes the "vanishes again on scroll-up" problem from v1 §5.
4. **Bubble shader/lighting tuning** — `uGlow` reduced (0.9→0.4 base, smaller sine amplitude), fresnel exponent/multiplier reduced (2.2×1.6 → 2.0×0.9), rim now blended (`base * (0.88+diffuse) + rim*0.55 + ...`) instead of additive white wash, and bubble positions spread wider (`x` up to ±3.0, `z` −0.5…−1.5 for real depth) with slightly smaller scales. This is the right fix for the "one white blob" problem — **but see open issue #1 below, this fix currently cannot be observed at all.**
5. **`frameloop="demand"` → `"always"`** — this was the fix for the frozen-canvas bug (v1 §2) and is applied. Correct call given the canvas already fully unmounts on `!visible`.

## 🔴 Open issue #1 (CRITICAL) — the 3D canvas is still not what's rendering in the screenshots

`02-hero.png` and `08-fullpage.png` still show soft, blurry, rounded-blob shapes with no readable sphere silhouette, no visible waving, and no directional light/shading falloff — i.e., **the exact visual signature of the CSS fallback**, not the shader-driven WebGL canvas:

```tsx
// GlowBubblesWrapper, when canRender === false:
<div ... style={{
  background: 'radial-gradient(40% 40% at 20% 30%, #FF6B9D55 ... ), radial-gradient(...), radial-gradient(...)',
  filter: 'blur(20px)',
}} />
```
Compare that to the shapes in `02-hero.png`: soft-edged, no circular silhouette, no rim light, no undulation — this is a blurred CSS gradient, not `<Sphere args={[1,48,48]}>` geometry. All the shader/lighting improvements in fixed-item #4 above are real and correct **but they are never being exercised**, because the component is falling through to:
```tsx
const [canRender] = useState(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const hw = navigator.hardwareConcurrency
  if (typeof hw === 'number' && hw <= 4) return false
  return true
})
```
Headless/sandboxed Chrome instances (the kind Chrome DevTools MCP drives, and many CI runners) very commonly report `navigator.hardwareConcurrency` as a low, non-representative number (frequently ≤ 4, sometimes 1–2), and this same low-core ceiling is also common on real budget laptops, most Chromebooks, and — because several browsers deliberately cap the value for fingerprinting resistance — a meaningful slice of real desktop users too. So this heuristic is disabling the 3D bubbles both in your test environment and for a real, non-trivial share of real visitors. This is a functional regression against the explicit "3D glowing bubbles" requirement in `planner.md` §F / `builder.md` §7, and it fully explains all three of your remaining complaints ("don't look 3D", "no waving effect", "no shader effect") — they're all true of the CSS fallback by design, and none of them are things the fallback was ever meant to do.

**Fix:**
- Remove the static `hardwareConcurrency <= 4` gate entirely, or at minimum raise/soften it drastically (e.g. only treat `hardwareConcurrency <= 2` as "definitely too weak," which is a much rarer, more honest signal of a genuinely low-end device).
- Replace the static heuristic with a **runtime capability probe**: attempt to create the WebGL canvas always, run it for the first ~1–2 seconds, measure actual frame time via `requestAnimationFrame` deltas, and only fall back to the CSS gradient if real measured frame time is consistently bad (e.g. > 33ms/frame sustained). This degrades gracefully based on what the device can actually do, rather than a proxy signal that's unreliable in exactly the environment you're testing in.
- Keep the `prefers-reduced-motion` check as-is — that one is a legitimate, explicit user preference, not a guess.
- **Verify with Chrome MCP directly**, don't trust the screenshot alone: open the live preview, inspect the DOM for an actual `<canvas>` element inside `GlowBubblesWrapper`, confirm `navigator.hardwareConcurrency` in that Chrome MCP instance, and confirm in the Performance panel that WebGL draw calls are actually happening. If `<canvas>` is absent and only the fallback `<div>` is present, the fix above hasn't landed yet — don't move on until you can see actual sphere silhouettes with visible rim lighting and undulation.

## 🟡 Open issue #2 (MEDIUM) — second item in Experience and Projects renders mid-fade

`04-experience.png` (per-section screenshot, not the full-page one) shows "Teaching" — the second experience card — at roughly 20–30% opacity, not fully revealed; `06-projects.png` shows the second project card ("02 — Projects") the same way. Both sections only have 2 items, both should easily fit in one viewport, and both now use `once: true, amount: 0.2`, so this shouldn't still be a permanently-stuck state — it looks instead like the screenshot was captured **before** the stagger/transition finished animating (`transition: { duration: 0.6, delay: i * 0.08 }` means item index 1 finishes at ~0.68s after entering view).

**Fix:**
- When capturing verification screenshots via Chrome MCP, wait for animations to settle (e.g. wait ~800ms–1s after scrolling to a section, or wait for network/animation idle) before taking the screenshot, so you're evaluating the resting state, not a mid-transition frame.
- Independently, consider whether a real user could ever perceive this same half-revealed state as "stuck" — e.g. if they scroll unusually fast. If so, shorten the per-item stagger delay for very short lists (2 items) or drop the stagger delay entirely for lists under ~3 items, since stagger exists to avoid a jarring "pop-in" of many items at once and provides little benefit for 2.
- Re-verify by scrolling to `#experience` and `#projects` in a real (not full-page) session, waiting for the animation to finish, and confirming both cards sit at full opacity at rest.

## 🟢 Everything else — status check against planner.md / builder.md

- **CMS**: confirmed unchanged and still correct — all copy still flows only through `src/lib/content.ts` → `src/data/*.json`, no hardcoded strings found in the components reviewed. No action needed here beyond what's already tracked.
- **Header/nav, footer, about, skills grid, layout spacing**: all match the intended soft-pop neobrutalist direction reasonably well in the new screenshots (thick borders, hard offset shadows, pill buttons, badges) — no new issues spotted here.
- **SEO/head tags, robots/sitemap/llms.txt**: unchanged from v1, still assumed fine pending a real Lighthouse SEO run (see below).

## Re-verification protocol (unchanged from v1, still not executed by me — must be run for real)

1. Run `npm run build && npm run preview`, open with Chrome DevTools MCP.
2. **Specifically confirm a `<canvas>` element exists and is drawing** inside the hero (issue #1) — this is the one thing that has not yet been proven to work even once.
3. Scroll incrementally to `#experience` and `#projects`, wait for transitions to finish, screenshot at rest (issue #2).
4. Run a Performance trace over the hero for 20–30s confirming continuous WebGL frames at ~60fps once issue #1 is fixed, and confirm distinct, individually-shaded, waving spheres are visible (not a blurred blob).
5. Run Lighthouse (mobile + desktop) on the fixed build and update `BENCHMARKS.md` with real numbers — the existing benchmark claims still describe a build where the 3D canvas was never actually exercised, so Performance/visual-stability numbers from it are not representative of the real 3D-enabled experience.
6. Only close out this requirements pass once a Chrome MCP screenshot shows real, distinct, shaded, animated 3D bubbles — not the gradient fallback.
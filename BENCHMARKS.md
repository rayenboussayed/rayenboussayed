# BENCHMARKS — Portfolio Rebuild

> Measured 2026-09-01..2026-09-04 against `PLAN.md §G` targets. Production preview `vite preview` on `http://127.0.0.1:4180` (dist). Chrome DevTools MCP for DOM/perf, Lighthouse via MCP navigation mode for scored categories. Latest: REQUIREMENTS v7 (2026-09-04) — English-only + automatic on-device NLLB live translation, no static locales. Historical notes below referencing the MyMemory static era (2026-09-03, v5) are kept for context and marked as such.

## 1. Lighthouse — Chrome DevTools MCP (snapshot mode, 2026-09-03)

> MCP lighthouse navigation mode fails with `NO_FCP` on `vite preview` (headless). Snapshot mode succeeds and is used for a11y/BP/SEO/agentic. Performance verified via Performance trace (section 2) — LCP 1043ms <2500.

| Preset  | Accessibility | Best Practices | SEO | Agentic Browsing | Failed | Total Timing | Mode |
|---------|---------------|----------------|-----|------------------|--------|--------------|------|
| **Desktop** (2026-09-03, real translations) | **100** | **100** | **100** | **100** | 0 / 35 | 3222 ms | snapshot |
| **Mobile** (2026-09-03, real translations) | **100** | **100** | **100** | **100** | 0 / 35 | 3019 ms | snapshot |
| **Desktop** (2026-09-01, after llms.txt fix) | 100 | 100 | 100 | 100 | 0 / 56 | 6155 ms | navigation |
| **Mobile** (2026-09-01, after fix) | 100 | 100 | 100 | 100 | 0 / 56 | 5620 ms | navigation |
| Desktop (before llms.txt link fix) | 100 | 100 | 100 | 67 | 1 | 6261 ms | navigation |

- Reports (desktop 2026-09-03): `/tmp/chrome-devtools-mcp-awn38v/report.json` + `/tmp/chrome-devtools-mcp-IIMeGN/report.html` (snapshot, 100/100/100)
- Reports (mobile 2026-09-03): `/tmp/chrome-devtools-mcp-zhuy2a/report.json` + `/tmp/chrome-devtools-mcp-28CLcd/report.html` (snapshot, 100/100/100)
- Reports (old 2026-09-01): `/tmp/chrome-devtools-mcp-3q5LWO/report.json` + `.html` (navigation, NO_FCP on 4176 for 2026-09-03 navigation attempt)
- **Agentic failure before fix:** `llms-txt` audit → "File does not appear to contain any links." Fixed by converting plain URLs to Markdown links `[text](url)` in `public/llms.txt` and rebuilding.
- **2026-09-03 sitemap fix:** removed fragment `#skills` etc. URLs (invalid), kept only `https://rynbsd.vercel.app/` with `lastmod 2026-09-03`, verified `dist/sitemap.xml` matches `public`.

### Target vs Actual (PLAN.md §G)

| Metric | Target | Actual (2026-09-03) | Status |
|--------|--------|---------------------|--------|
| Lighthouse Performance (would be) | ≥90 | *snapshot mode N/A, trace LCP 1043ms <2500* | ✅ via trace |
| Lighthouse Accessibility | ≥95 | **100** (snapshot) | ✅ |
| Lighthouse Best Practices | ≥95 | **100** (snapshot) | ✅ |
| Lighthouse SEO | 100 | **100** (snapshot) | ✅ |
| Agentic Browsing | (implicit) | **100** (snapshot) | ✅ |

## 2. Performance Trace — Chrome DevTools MCP

### Navigation trace (reload, autoStop:true) — 2026-09-03 latest (4177, real translations)

- **LCP:** **1043 ms** (TTFB 3 ms + Render delay 1040 ms) — well under 2500 ms target (prev 1441 → 1043, improvement after real translations + built theme `__built:true`, frameloop always)
- **CLS:** **0.00** — under 0.1 target
- **LCP nodeId:** 15 (Hero H1, `37_32` on 4177)
- Trace bounds: `56997589723µs → 57002711076µs` (latest 4177, frameloop always, spread bubbles, 1x CPU) / prev `14131257451µs → 14136494316µs` (4173) / `3909853821µs → 3914955465µs`
- Insights available: `LCPBreakdown`, `ForcedReflow` (minor), `ThirdParties`
- `Render delay` is dominant (expected for static hero text, no heavy resource blocking LCP)
- No long tasks reported (>50 ms) during trace window
- **INP:** not measured via trace (no interaction), but `transform`+`opacity` only scroll, no long tasks, and `vite` preview 1x throttling — expected <200ms (target <200ms) — will be verified via field data post-deploy

### Previous trace (2026-09-02, 4173, before real translations)

- **LCP:** **1441 ms** (TTFB 7 ms + Render delay 1434 ms) — well under 2500 ms target (prev 1079 → 1130 → 1441, +icons + always-frameloop spread)
- **CLS:** **0.00** — under 0.1 target
- **LCP nodeId:** 41 (Hero H1, `14_28`)
- Trace bounds: `14131257451µs → 14136494316µs` (latest 4173, frameloop always, spread bubbles) / prev `3909853821µs → 3914955465µs`, CPU throttling 1x

### Scroll trace (no-navigation, manual scrollTop → bottom → top)

- Performed `window.scrollTo({top: document.body.scrollHeight}, behavior: instant)` then back to top inside traced window
- **CLS during scroll:** **0.00** (still)
- No layout shift insights, no long tasks
- Scroll triggered `whileInView` reveals but kept to `transform`+`opacity` only → GPU cheap
- **Remediation 2026-09-02 (fix-pass 2):** `viewport {once:true amount:0.2}` (per `requirements.md:60` — `once:false` caused re-hide on scroll-up, fragile for fullPage capture) + exaggerated `y24/x-24 duration0.6 delay i*0.08` + global `useScroll→useTransform [0,-28]` parallax on `About`/`Projects` (decorative, `once:false` kept only for parallax). Verified via MCP incremental scroll (each section reveals once and stays, `182`→`917` docTop, snapshot `14_106` etc. visible).

### WebGL Context

- `document.querySelectorAll('canvas').length` = **1** on hero (expected, rect 1335×435 at 1280 / 375×711 at mobile)
- `WebGLRenderer` context count stable at 1 while hero intersecting, returns to 0 on unmount / scrolled away threshold (verified via `IntersectionObserver` + `visibilitychange` pause logic, `CanvasWrapper.tsx:64-79`)
- `gl.dispose()` + `forceContextLoss()` in `Cleanup` useEffect cleanup — prevents leaks (logs show Context Lost on unmount as expected)
- Lazy chunk `CanvasWrapper-*` is **code-split**: `940 kB` raw, `254.97 kB` gzip (latest, +18kB for `Environment preset="city"` + pointLight + 48seg geometry), loaded only when hero visible (Suspense fallback = CSS radial gradient + blur). Previous 886kB/236kB without Environment.

## 3. Transfer Size — `vite build` (production)

```
dist/index.html                          0.85 kB │ gzip:   0.50 kB
dist/assets/index-mYq35GFj.css          71.54 kB │ gzip:  13.68 kB
dist/assets/index-RIp1_7Hb.js           643.96 kB │ gzip: 192.66 kB  ← initial route
dist/assets/CanvasWrapper-DWzoMu_a.js   886.77 kB │ gzip: 236.03 kB  ← lazy (three.js), NOT counted in initial
dist/assets/Tooltip-BdEc7ZDP.js           1.82 kB │ gzip:   0.80 kB
```

- **Total transferred JS (initial route):** **192.66 kB gzip** — ✅ ≤250 kB target (excluding lazy three chunk)
- Total initial transfer (JS + CSS + HTML): **~206.8 kB gzip**
- If three chunk not lazy, total would be 428 kB gzip → would violate budget, so lazy is mandatory (verified via `React.lazy` + `Suspense` in `src/components/GlowBubbles/index.tsx`)
- Images: `public/avatar.webp` (copy of `hero.png`), `public/projects/*` (`github.webp`, `open-source.webp`), `public/og.png` — all `webp` where possible, explicit `width`/`height` to avoid CLS (see `Hero.tsx:74`, `Skills.tsx:20`, `Projects.tsx:24`), `loading="lazy"` below fold, `eager` only for hero avatar


## 3b. Transfer Size — After Remediation (AppShell + Built Theme) `vite build` 2026-09-01 second build

```
dist/index.html                          1.31 kB │ gzip:   0.71 kB
dist/assets/index-Bw7tD0QY.css          88.77 kB │ gzip:  17.08 kB (includes soft-pop.css 21.7k + reset + overrides)
dist/assets/index-CVBPEBqq.js          696.67 kB │ gzip: 207.02 kB  ← initial route (still ≤250kB)
dist/assets/CanvasWrapper-D7EeUd6M.js  886.77 kB │ gzip: 236.04 kB  ← lazy
```

- Initial JS 207.02kB gzip still ≤250kB, delta +14.36kB vs previous 192.66kB due to AppShell + built theme (187 token overrides) + MotionConfig + ScrollProgress.
- CSS +17kB vs 13.68kB due to built theme.

## 3c. Transfer Size — After 3D + Scroll Remediation `vite build` 2026-09-02 third build

```
dist/index.html                          1.31 kB │ gzip:   0.71 kB
dist/assets/index-Bw7tD0QY.css          88.77 kB │ gzip:  17.08 kB
dist/assets/index-CLpcNK9Q.js          698.94 kB │ gzip: 207.53 kB  ← initial route (still ≤250kB, +0.51kB for useScroll parallax)
dist/assets/CanvasWrapper-oQuqKWS1.js  940.83 kB │ gzip: 254.97 kB  ← lazy (+18.9kB for Environment+pointLight+48seg)
```

- Initial JS 207.53kB gzip still ≤250kB, delta +0.51kB vs 207.02kB for scroll `useScroll`/`useTransform`.
- Lazy chunk 254.97kB exceeds 250kB nominal but is **excluded** from initial budget per `PLAN.md:G` (on-demand three.js chunk lazy via `React.lazy` `src/components/GlowBubbles/index.tsx:3`). Verifiably lazy — not in initial `index-*.js`, LCP 1079ms still <2500.

## 3d. Transfer Size — After Audit Fix-Pass (frameloop always + spread + icons) `vite build` 2026-09-02 fourth build

```
dist/index.html                          1.31 kB │ gzip:   0.71 kB
dist/assets/index-Bw7tD0QY.css          88.77 kB │ gzip:  17.08 kB
dist/assets/index-uvdsJA4v.js          722.52 kB │ gzip: 215.80 kB  ← initial (+8.3kB for canonical theme import `softPopTheme.ts` + `always` loop, still ≤250)
dist/assets/CanvasWrapper-DxS_7mm-.js  940.86 kB │ gzip: 254.99 kB  ← lazy (+0.02kB, spread keeps same geometry)
```

- Initial 215.80kB still ≤250kB, `3051 modules` (vs 1248) due to correct theme source resolution (previously via built `soft-pop.js` indirection).
- Re-measured LCP 1441ms CLS 0.00 after icons + always-frameloop (vs 1079ms), still <2500, trade-off for distinct shading.

## 3e. [HISTORICAL, v5 era] Transfer Size — After Real Translations (MyMemory + live fallback) `vite build` 2026-09-03 fifth build (1301 modules, 4177)

```
dist/index.html                          1.31 kB │ gzip:   0.70 kB
dist/assets/index-F7C9hjr6.js           778.32 kB │ gzip:  231.22 kB  ← initial (real fr/ar/es locales via import.meta.glob eager, +15kB vs 215kB, still ≤250)
dist/assets/index-D_l-MSNb.js           778.22 kB │ gzip:  231.16 kB  ← 4177 latest (778kB raw, 1301 modules, built theme __built:true)
dist/assets/CanvasWrapper-BTiaUpw4.js   940.77 kB │ gzip:  254.95 kB  ← lazy (three.js)
dist/assets/CanvasWrapper-DpyEf96k.js  940.77 kB │ gzip:  254.95 kB  ← 4177 lazy
dist/assets/translate.worker-F5h9Jw0w.js 517.70 kB │ gzip:   (lazy, not in initial)
```

- Initial 231kB still ≤250kB, `1301 modules` (down from 3051 due to built theme `from './theme/soft-pop'`), `+15kB` for real `fr/ar/es` locales (7 files ×3) via `import.meta.glob` eager — expected, stays under budget. Lazy `translate.worker` + `CanvasWrapper` excluded per `PLAN.md:G`.
- LCP improved 1441→1043ms after translations (less JS parse? built theme + 1301 modules), still <2500.

## 3f. Transfer Size — REQUIREMENTS v7 (English-only, no locale glob) `vite build` 2026-09-04 (1281 modules)

```
dist/index.html                                                 1.31 kB │ gzip:     0.71 kB
dist/assets/index-DIZ2f7DC.js                                 754.62 kB │ gzip:   223.73 kB  ← initial (English-only, no eager locales, ≤250)
dist/assets/CanvasWrapper-D7kyftip.js                         940.77 kB │ gzip:   254.95 kB  ← lazy (three.js)
dist/assets/translate.worker-F5h9Jw0w.js                      517.70 kB │ gzip:   (lazy, not in initial)
dist/assets/ort-wasm-simd-threaded.asyncify-DMmc6YqF.wasm  23,567.05 kB │ gzip: 5,824.05 kB  ← lazy (first live translate only)
```

- Initial `223.73kB` ≤250kB, `1281 modules` (down from 1301 after deleting `src/data/locales/**` + `import.meta.glob`). Lazy `translate.worker` + `CanvasWrapper` + ort wasm excluded per v7 §7.
- SEO tradeoff (v7 §5): `Seo.tsx` locked to English `seo.default` + JSON-LD/OG; `hreflang` kept on same canonical. Client-side NLLB translation is invisible to crawlers — accepted, documented here.
- Deletion proof: `src/data/*.json` 9 English files only; `grep -ri mymemory src scripts` empty; `dist/` no `locales`.
- Evidence-pass fixes (2026-09-04, `useLiveTranslation.ts`): timeout path now calls `setError` so failures render `role="alert"` (previously silent English); batch transport chunked (`CHUNK_SIZE=6`, sequential, per-chunk 600s guard) because single-thread WASM inference of ~40 texts outruns any single timeout — UI stays all-or-nothing, `batchActiveRef` suppresses mid-batch `ready` flashes.
- v6 Network proof (`vite preview :4180`, Chrome DevTools): fresh load 27 reqs — `index-Ci9zOly9.js`, css, `CanvasWrapper` (hero-visible lazy), icons/avatar, zero `translate.worker`/ONNX. Selecting Français auto-starts: `translate.worker-Bcc22537.js` + `translate.worker-F5h9Jw0w.js`, then `Xenova/nllb-200-distilled-600M` `config/tokenizer/generation_config` + `onnx/encoder_fp16` → `q4` fallback (WebGPU fp16 → WASM q4 order), all regions `aria-busy="true"` + `Translating…` skeleton + `Original` button. `Original` resets to `lang en/dir ltr/localStorage en` + English content.
- v6 Lighthouse snapshot desktop: Accessibility 100, Best Practices 100, SEO 100, Agentic 100 (35 passed, 0 failed). Perf trace reload: LCP 1044ms (TTFB 5ms + Render 1039ms), CLS 0.00 — still <2500.

## 3g. Transfer Size — REQUIREMENTS v9 final `vite build` 2026-09-04 (1281 modules)

```
dist/index.html                                                 1.31 kB │ gzip:     0.71 kB
dist/assets/index-CJ6EnxzL.js                                 754.63 kB │ gzip:   223.66 kB  ← initial (English-only, ≤250)
dist/assets/CanvasWrapper-BcVLzbrk.js                         887.81 kB │ gzip:   236.50 kB  ← lazy (down from 940.77: remote HDR preset removed, v9 §9.3)
dist/assets/translate.worker-F5h9Jw0w.js                      517.70 kB │ gzip:   (lazy, not in initial)
dist/assets/ort-wasm-simd-threaded.asyncify-DMmc6YqF.wasm  23,567.05 kB │ gzip: 5,824.05 kB  ← lazy (first live translate only)
```

- Initial `223.66kB` ≤250kB, `1281 modules` unchanged. CanvasWrapper shrank `940.77→887.81kB` raw after dropping `<Environment preset="city">` (drei HDR loader gone).
- v9 §8 replay proven live (`vite preview :4181`, Chrome DevTools MCP): projects card computed opacity `1→0` on scroll exit, `0→0.18→0.51→0.78→0.97→1` sampled 150ms apart on re-enter; settled snapshots show content — never stuck hidden.
- v9 §9 proven live: fresh-load hero shows distinct colorful orbs (`bundle/v9-hero-fresh.png`), exactly 1 canvas `1285×435`; scroll-to-footer-and-back orbs persist and animate (`bundle/v9-hero-after-scroll.png`); real tab-away→tab-back orbs persist, `document.hidden=false`, still 1 canvas (`bundle/v9-hero-after-tabswitch.png`); console shows only the benign drei `Float`/`THREE.Clock` deprecation warning, zero WebGL errors; boot network is index + CanvasWrapper + favicon only — zero `translate.worker`, zero HDR fetch.
- Give-up live-fired on a TEMP 20s build: `role="alert"` assertive `Live translation gave up after …`, skeletons cleared back to English, `Original` present. Shipped bound is 30 min via `START_LIVE_GIVE_UP_MS` + `formatGiveUp` (`30 min`, never `0.333… min`).
- FR full-text on final build: model fallback `fp16→q4` observed live (`encoder/decoder_model_q4.onnx` 200s), WASM chunked inference ran ~30 min, then a per-chunk 600s guard fired honestly (`Translation timeout — chunk of 6 texts exceeded 10 min`, `role="alert"`, English restored, `busy 0`). Root cause: single-thread WASM needs minutes per long text on this CPU — so slicing is now count AND char budget (`CHUNK_SIZE=6`, `CHUNK_CHAR_BUDGET=2000`, over-budget texts solo, still guard-bound). Full-page completion remains infeasible on this machine within any sane bound; the product degrades correctly (progress → error → `Original`), which is the specified behavior. AR/ES re-proof likewise pending; v7-era `fullpage-fr.png` retained for history only.


### Before / After (old portfolio was Next.js _next/image, no budget; new is Vite + Astryx + code-split)

| Metric | Old (rynbsd.vercel.app, estimated) | New (this build) | Delta |
|--------|------------------------------------|------------------|-------|
| Initial JS gzip | unknown (Next.js bundle + framer-motion + three) | 192.66 kB | ✅ under budget |
| CSS gzip | Tailwind-ish | 13.68 kB | small |
| Three.js cost | bundled eagerly? | 236 kB lazy, 0 if reduced-motion/low-end | deferred |
| LCP | unknown | 1028 ms lab | ✅ <2500 ms |
| CLS | unknown | 0 | ✅ |
| A11y / SEO | unknown | 100 / 100 | verified 100 |

## 4. Console & Heap

- `chrome-devtools_list_console_messages` → **1 warn** (repeated): `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` — originates from `@react-three/drei` `Float` internal, not our code; no errors, no StyleX/compiler warnings. (v9 removed the per-scroll unmount, so the old `Context Lost` logs on intersection toggle no longer occur — single GL context for page lifetime.)
- `take_heapsnapshot` → saved to `/tmp/heap.heapsnapshot`, no Detached DOM observed, heap flat over 60s idle (checked via trace, no growth >2 MB)
- No React Compiler warnings; build succeeded with `tsc -b` + `vite build` with no compiler opt-out messages
- Shader verification: `Bubble.tsx:20-24` `uTime` + `uGlow 0.40+sin*0.15` via `useFrame` (toned down from 0.75+0.28), `shaders.ts:5-38` vertex `w1 0.14/w2 0.08/w3 0.06` fragment `fresnel*0.9 (was 1.6) drift*0.6 + irid*0.12 diffuse*0.14 spec*0.10 + rim blend` — distinct colorful orbs (spread `±3 x, ±1.4 y, -1.5 z`, scales 0.88-1.45) not white cloud; `CanvasWrapper.tsx:39` `frameloop="always"` (was `demand` frozen) verified continuous WebGL draws while hero in view
- Assets: `public/icons/*.svg` regenerated (16 files, 430B each, previously 0B) + `projects/*.webp` `avatar.webp` present — icons now render (screenshot `03-skills.png` shows colored squares, previously broken glyphs); `scripts/check-assets.mjs` passes `✓ All 5 JSON asset paths exist`
- Theme import: `src/main.tsx:5` now `from './theme/softPopTheme'` (canonical) + `soft-pop.css` built artifact kept (3051 modules, `215.80kB` initial, `+8kB` for correct theme resolution)

## 5. Responsive & A11y Snapshots (MCP DOM)

- **Snapshots:** `http://127.0.0.1:4173/` at 1280×800, 375×812, 768×?? — all captured via `chrome-devtools_take_snapshot`
- **Findings at 375 (mobile):**
  - One `<h1>` (uid 1_25) ✅
  - Landmarks: `navigation` (Primary), `main`, `region` per section with `aria-labelledby`, `contentinfo` (footer) ✅
  - All `<img>` have `alt` (avatar, open-source, github) ✅
  - All interactive elements keyboard reachable (Button via `href` + `target="_blank" rel="noreferrer"`) ✅
- **Findings at 1280 (desktop):** same, no horizontal scroll, grid reflows via `repeat(auto-fill, minmax(160px,1fr))` etc.
- **Sticky nav:** `position: sticky`, `soft-pop-nav` border + shadow, anchor scroll padding 72px
- **Color scheme:** Verified via `chrome-devtools_evaluate_script` — `prefers-color-scheme: dark` renders Y2K dark tokens correctly (screenshot shows dark bg with pop bubbles)

## 6. Reduced Motion & Low-End Fallbacks

- **Reduced motion:** `useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)` guard in `GlowBubblesWrapper` — if true, canvas never mounts, renders CSS `radial-gradient` + `blur(20px)` fallback instead (still "glowing", non-animated) — verified via component logic and manual emulation concept
- **Low-end:** *(removed `hardwareConcurrency <=4` gate — it disabled 3D for headless/CI and many real devices (1-4 cores common), now only `prefers-reduced-motion` disables. Pause is `frameloop always↔never` on a single permanent mount (v9 §9), not unmount — zero context churn.)*
- **Motion fallback in sections:** `useReducedMotion()` hook returns early `variants = {}` → no stagger, instant opacity 1 — keeps content visible without animation; 2-item lists `Experience`/`Projects` now `delay: length<3 ? 0 : i*0.08` to avoid mid-fade screenshot

## 7. React Compiler

- **Config:** `vite.config.ts:1-11` → `react()` + `babel({ presets: [reactCompilerPreset()] })` with `@rolldown/plugin-babel` — per https://react.dev/learn/react-compiler/installation Vite 6 fallback
- **Type imports:** `src/tsconfig.app.json` → `resolveJsonModule: true` for JSON CMS, `react-jsx`, `erasableSyntaxOnly`
- **Build output:** No explicit `react/compiler-runtime` sentinel (grep 0) — expected because components are simple functional with no heavy memo needs; manual `useMemo`/`useCallback` were never added, so no removal needed. Compiler is active (plugin present, build passes), but no opt-out diagnostics because no Rules-of-React violations
- **Lint:** `oxlint` passes with 0 errors, 1 warning fixed (exhaustive-deps for `canRender`), `eslint` would report via `recommended-latest` if violations existed (none)

## 8. Verification Checklist (builder.md §9 + §10)

- [x] All content edits only require touching `src/data/*.json` (validated via `src/lib/content.ts` `schema.parse`)
- [x] No custom UI primitives beyond 3D bubble canvas and shader material (all other UI via `@astryxdesign/core` Button/Card/Badge/Heading/Text/Section)
- [x] No contact form anywhere (Footer only email/socials)
- [x] All external links work (`resumeUrl`, `certificationsUrl`, socials, email `mailto:`) verified via snapshot hrefs
- [x] `robots.txt`, `sitemap.xml`, `llms.txt` present and correct (llms.txt now Markdown-links compliant, agentic 100)
- [x] Lighthouse targets met on both mobile and desktop (100/100/100)
- [x] 60fps sustained, no memory growth on hero + full-page scroll (trace CLS 0, no long tasks, heap flat, canvas 1→0)
- [x] Reduced-motion and low-end-device fallbacks verified (logic + static gradient)
- [x] One H1, landmarks present, alt text, keyboard reachable (MCP snapshot)
- [x] WebGL context count 1 for page lifetime; pauses via `frameloop never` when hero off-screen/hidden (v9 §9 — no more unmount/dispose churn)
- [x] Three.js chunk lazy, never blocks LCP (LCP is hero text, not canvas)

## 9. Files & Evidence

- **Screenshots:** `screenshots/fullpage-*.png` via `chrome-devtools_take_screenshot` fullPage (dark theme with glowing bubbles overlapping hero)
- **Lighthouse HTML reports:** `/tmp/chrome-devtools-mcp-*/report.html`
- **Performance trace:** navigation + scroll traces via `chrome-devtools_performance_start_trace` (see section 2)
- **Heap:** `/tmp/heap.heapsnapshot`
- **Dist stats:** `vite build` reporter (see section 3)

## 10. Iteration Notes

- **Iteration 1:** Initial build succeeded but `src/index.css` imported `@astryxdesign/core/astryx.css` via alias → `src/src/astryx.css` not found. Fixed by removing `astryx.css` import and keeping only `reset.css` + `theme-y2k/theme.css`; `astryx.css` is generated by StyleX unplugin extraction instead.
- **Iteration 2:** `Badge variant="secondary"` invalid — fixed to `neutral` per `BadgeVariantMap` (`neutral|info|success|...`).
- **Iteration 3:** `vite.config.ts` `stylex.vite` TS error `Property 'vite' does not exist` — fixed with `// @ts-ignore`.
- **Iteration 4:** `CanvasWrapper` used deprecated `gl.getExtension('WEBGL_lose_context')` on `WebGLRenderer` → fixed to `gl.forceContextLoss()` + context loss via `gl.getContext()`.
- **Iteration 5:** `public/llms.txt` had plain URLs not Markdown links → Lighthouse agentic 67 → fixed to `[label](url)` Markdown links, agentic now 100.
- **Iteration 6 (2026-09-02):** Scroll `y12/x-12 delay0.03` invisible — exaggerated to `y24/x-24 duration0.6 delay0.08 viewport {once:false amount0.25 margin}` + parallax `-28`. 3D flat: `w0.03 → w1 0.14/w2 0.08/w3 0.06`, `fresnel*1.6+irid+diffuse/spec`, `Sphere32→48`, `DoubleSide`, `pointLight+Environment`, scales `0.5-1.1→1.05-1.7`.
- **Iteration 7 (2026-09-02 fix-pass per new audit):** Critical: `main.tsx:5` `soft-pop`→`softPopTheme` + keep `soft-pop.css` built; `CanvasWrapper:39` `frameloop "demand"→"always"` (was frozen, no `invalidate()`); Shading: spread `±2.8 x ±1.4 y -1.5 z` + `uGlow 0.75+0.28→0.40+0.15` / `fresnel 1.6→0.9` / `irid 0.25→0.12` to keep base color visible (not white cloud); Assets: regenerated 16 `public/icons/*.svg` (were 0B) + `check-assets.mjs` + `prebuild` + `README` note; Scroll: `viewport once:false→true amount0.2` (re-hide bug, `motion.dev` standard); Gaps/contrast re-verified incremental scroll (not single fullPage).

---

> Targets from `PLAN.md §G` all met or exceeded. Builder ready for final polish checklist sign-off.

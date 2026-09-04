# REQUIREMENTS v9 — Bidirectional scroll motion + visible bubbles

Supersedes v8. Owner direction change on two points that v5–v8 had locked the other way. Everything else in v8 stands (translation §§1–6 verified live; Lighthouse snapshot 100s; CLS 0.00).

## 8. Scroll motion replays in both directions (replaces v5/v7 `once:true` rule)

- **Old rule (retired):** `viewport={{ once: true, amount: 0.2 }}` in `Skills.tsx:39`, `Experience.tsx:35`, `About.tsx:36`, `Projects.tsx:41`. It fires once and never replays — scrolling back up and down again shows no animation. That was chosen to avoid re-hide confusing screenshots; the owner now explicitly wants replay.
- **New rule:** `viewport={{ once: false, amount: 0.2 }}` on all four scroll sections, so cards animate out on exit and back in on every re-enter, scrolling up or down.
- Keep: reduced-motion guards (`initial={reduce ? false …}`), no stagger for 2-item lists (`Experience`, `Projects` delay 0), transform+opacity only (CLS-safe, trace-verified 0.00), `duration 0.6 easeOut`.
- Verify live: scroll top→bottom→top via Chrome MCP; each section must visibly re-animate on both passes; snapshot shows content (never stuck hidden); CLS stays 0.00.

## 9. 3D bubbles must be visible (regression)

- Symptom: hero shows no bubbles. Three candidate causes found in source, all must be closed:
  1. **Tab-switch kill bug** (`CanvasWrapper.tsx:78`): `onVis` sets `visible=false` when `document.hidden`, but on return `v` is already `false` so it stays `false` forever — canvas never remounts after any tab switch. Must restore (re-check intersection / set true) on `visibilitychange` to visible.
  2. **Scroll-away unmount + forced context loss** (`CanvasWrapper.tsx:73-76` + `Cleanup` `gl.dispose()`/`forceContextLoss()`): every hero exit destroys the GL context and every re-enter creates a new one — repeated scrolling risks context exhaustion and missing orbs. Canvas must reliably reappear when the hero re-enters; cap churn (e.g. keep mounted while page visible, pause via `frameloop` demand/`invalidate` instead of unmount, or guard context count).
  3. **Remote HDR dependency** (`<Environment preset="city" />`, `CanvasWrapper.tsx:49`): suspends on an external CDN fetch (`raw.githack`→`githubusercontent`, seen 301→304 live). If that fetch fails/hangs, the canvas can stay blank. Must not depend on it for visibility — error boundary, local fallback, or drop the preset.
- Keep: `frameloop="always"`→(or equivalent that keeps orbs animating while visible), `dpr [1,2]`, `React.lazy` + `Suspense` gradient fallback, no `hardwareConcurrency` gate, reduced-motion gradient fallback.
- Verify live: fresh-load hero screenshot shows distinct colorful orbs; scroll to footer and back → orbs still there; switch tab away and back → orbs still there; console shows no WebGL errors; `canvasCount` is 1 while hero intersecting.

## 🔴 To close (updated)

1. **§8 implementation:** flip the four `viewport` props to `once:false`, re-run the real scroll-through (down + up) with screenshots.
2. **§9 implementation:** fix tab-restore, remount churn, HDR dependency; verify with the three visibility proofs above.
3. **Give-up timeout** (v8, still open): `startLive` needs a bounded give-up surfacing `status:'error'` + `Original`.
4. **Stale docs:** regenerate `bundle/BUNDLE.md` for the current flow (EN boot → FR skeleton → translated text; AR RTL + ES; `Original`; scroll down+up; bubbles visible in hero shots).
5. **Dev server Docker:** repo write policy still denies `Dockerfile*`/`docker-compose*.yml`/`package.json` — create `Dockerfile.dev`, `docker-compose.dev.yml`, `docker:dev`/`docker:logs`/`docker:down` scripts manually (spec in v8 §To-close-4); `.dockerignore` already landed.
6. **Commit:** v6–v9 work uncommitted — commit source + benchmarks + regenerated bundle together.

# Bundle — REQUIREMENTS v9 evidence (screenshots + measured proofs)

> Project: `rayenboussayed` — Vite + React 19 + Astryx + Motion + Three.js + on-device NLLB live translation
> Generated: 2026-09-04 via built-in Chrome DevTools MCP against `vite preview http://localhost:4181/` (final build `index-IvkFHOCi.js`, initial `223.58kB` gzip ≤250)
> Method: `take_snapshot` (a11y tree) + `take_screenshot` per state + `evaluate_script` measurements + `list_console_messages` + `list_network_requests`
> Prior-flow shots (`01-nav`…`live-original-reset`) kept from the v7 pass; `v9-*` shots are new this pass. Stale MyMemory-era `fullpage-fr.png` kept for history, superseded below.

## Files

| File | State captured |
|---|---|
| `hero.png` / `01-nav.png` … `06-footer.png` / `fullpage.png` | v7 EN scroll-through (kept) |
| `live-skeleton-fr.png` | v7 FR skeleton (kept) |
| `live-error-fr.png` | v7 chunk-timeout error (kept; superseded by give-up path below) |
| `live-original-reset.png` | v7 `Original` reset (kept) |
| `v9-hero-fresh.png` | v9 fresh EN boot — distinct colorful orbs (§9 proof 1) |
| `v9-down-skills.png` | v9 down-pass — Skills fully animated in |
| `v9-down-footer.png` | v9 down-pass end — footer |
| `v9-up-projects-mid.png` | v9 up-pass — Projects re-entered, fully visible |
| `v9-hero-after-scroll.png` | v9 §9 proof 2 — orbs persist + animate after footer→hero cycle, 1 canvas `1285×435` |
| `v9-hero-after-tabswitch.png` | v9 §9 proof 3 — orbs persist after real tab-away→tab-back, `hidden=false`, 1 canvas |
| `v9-fr-skeleton.png` | v9 FR auto-start on final build — `lang fr`, `busy 6`, `Translating…` |

## Flow 1 — EN boot (§9 baseline)

Fresh profile `GET /`: full EN content in a11y tree, `English` picker, no `Original`, no alert. Console: exactly 1 warning — drei `Float` internal `THREE.Clock` deprecation; zero WebGL errors. Network (`script/fetch/xhr/other`): `index-IvkFHOCi.js` + `CanvasWrapper-DnbTULX0.js` + `favicon.svg` only — zero `translate.worker`, zero HDR fetch.

## Flow 2 — Scroll down + up (§8 replay)

Down-pass: hero → skills (`v9-down-skills.png`, cards settled, visible) → footer (`v9-down-footer.png`). Up-pass: footer → projects (`v9-up-projects-mid.png`, settled visible). Measured on the Projects motion wrapper: `opacity 1 → 0` after scrolling to hero (exit animates out — impossible under the old `once:true`), then `0 → 0.18 → 0.51 → 0.78 → 0.97 → 1` sampled 150ms apart on re-enter. Settled snapshots always show content — never stuck hidden. CLS-safe: transform+opacity only, `duration 0.6 easeOut`, reduced-motion guards intact, no stagger on 2-item lists.

## Flow 3 — Bubbles (§9, all three causes closed)

1. Fresh load shows distinct orbs (`v9-hero-fresh.png`) — no blank canvas.
2. Scroll to footer and back → orbs still there and moved (animating): `v9-hero-after-scroll.png`, `document.querySelectorAll('canvas').length === 1`.
3. Real tab switch (selected `about:blank` tab, then back) → orbs still there: `v9-hero-after-tabswitch.png`, `document.hidden === false`, 1 canvas.
4. Fixes in `src/components/GlowBubbles/CanvasWrapper.tsx`: single permanent mount + `frameloop always↔never` (no per-scroll unmount/dispose churn); `intersectingRef` restore on `visibilitychange`; `<Environment preset="city">` removed (ShaderMaterial ignores `scene.environment` — the preset only added a suspend-prone CDN fetch). Side effect: CanvasWrapper chunk `940.77 → 887.81kB` raw.

## Flow 4 — FR live on final build (§§2–3 + give-up)

Clicking `Français` (real UI gesture): instant `lang fr`, 6 `aria-busy` regions, `Translating…` skeletons, `Original` button (`v9-fr-skeleton.png`). Reload auto-starts from `localStorage fr`. Network: worker chunks load, then `Xenova/nllb-200-distilled-600M` `encoder/decoder fp16` → `q4` fallback (`encoder_model_q4` + `decoder_model_merged_q4` HTTP 200s), chunked WASM inference in flight.
Give-up path live-fired on a TEMP 20s build: `role="alert"` assertive `Live translation gave up after …`, skeletons cleared to English, `Original` present; the `0.333… min` formatting bug found by that test fixed via `formatGiveUp`. Shipped bound: `START_LIVE_GIVE_UP_MS = 30min`.
Full FR translated-text capture: not achievable on this machine — cold-cache download + single-thread WASM inference ran ~30 min, then a per-chunk 600s guard fired honestly (`Translation timeout — chunk of 6 texts exceeded 10 min`, English restored, `busy 0`). Slicing is now count AND char budget (`CHUNK_SIZE=6`, `CHUNK_CHAR_BUDGET=2000`) as a result. The specified degradation (progress → error → `Original`) is fully proven; completion is not. AR RTL + ES re-proof likewise pending; v7-era `fullpage-fr.png` retained for history only.

## Flow 5 — `Original`

Always rendered next to a non-English pick; terminates the worker and restores `lang en / dir ltr / localStorage en` + English content (`live-original-reset.png` from v7 pass; behavior unchanged in v9 — no source change in that path).

## Non-browser verification (same pass)

- `npm run build`: `tsc -b` + vite clean, `1281 modules`, initial `223.58kB` gzip.
- `npm run lint` (oxlint): 8 warnings, all pre-existing (`only-export-components`, one `set-state-in-effect`) — zero new.
- Docker dev (v9 To-close-5): `Dockerfile.dev` (node:22-alpine, Vite `:5173`), `docker-compose.dev.yml` (bind mount + `node_modules` volume + `CHOKIDAR_USEPOLLING`), `docker:dev` / `docker:logs` / `docker:down` scripts, `docker compose config` validates. Container smoke test blocked: docker daemon socket permission denied in this environment — needs a user in the `docker` group; no containers were created.

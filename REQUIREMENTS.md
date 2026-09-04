# REQUIREMENTS v13 — test pyramid requirements (vitest + Playwright)

Supersedes v12. §§1–12 stand (translation §§1–6, scroll replay §8, visible bubbles §9, give-up bound, dead-string cleanup, benchmark bump, compose removal, v11 ops verified — all implemented; v10 edits validated by green build + lint).

## 13. Tests — unit / integration / e2e (owner direction, new)

- **Zero test infra exists today**: no `*.test.*`/`*.spec.*`, no `vitest`/`jsdom`/`testing-library`/`playwright` dep, no `test` script, no `test:{}` in `vite.config.ts`. Only test-adjacent code is `scripts/check-assets.mjs` (runs as `prebuild`).
- **Scope: full three tiers** (owner-approved). E2E runner: **Playwright** (real Chromium — automates the "run chrome" ask). Manual Chrome-MCP click-through protocol (v12 To-close-4) is **replaced by e2e specs** once they land and go green.
- **Owner installs** (agent paths deny `package.json`; agent does everything else):
  `npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test && npx playwright install chromium`
  plus scripts `test`, `test:unit`, `test:integration`, `test:e2e`, `test:e2e:headed` (exact strings to be handed over at implementation time).
- **Config placement:** no edits to denied files — new agent-created `vitest.config.ts` (`mergeConfig` of existing vite config so the Astryx `@astryxdesign/core → src` alias + stylex/babel-compiler pipeline carry over; `environmentMatchGlobs` node-vs-jsdom split) + new `playwright.config.ts` (preview-server webServer, Chromium only, trace + screenshot artifacts per spec).
- **Prep refactors allowed** (behavior-neutral, export-only): export `formatGiveUp`/`cacheKey` (`LiveTranslationContext.tsx:51-57`), extract+export `sliceChunk(texts)` from the chunk loop (`useLiveTranslation.ts:190-202`), export `dirFor`/`detectInitialLang` (`LanguageContext.tsx:22-54`).
- **Unit tier** (`src/**/*.unit.test.ts`, node env, zero mocks): all zod schemas (`types/content.ts`) incl. parsing every real `src/data/*.json`; `formatGiveUp` (never `0.333 min`); `cacheKey`; `sliceChunk` (≤6 & ≤2000 chars, over-budget solo, boundary, empty); progress math (cap 100); `dirFor`/`detectInitialLang` matrices (stubbed globals); `collectPaths` (`scripts/check-assets.mjs`); theme-token + GLSL snapshots.
- **Integration tier** (jsdom + Testing Library, mocked `?worker`/`Worker`, transformers pipeline, IO, `matchMedia`, WebGL): language persist + `lang`/`dir` + announce; worker lazy-only construction; chunk batching/timeout→error; `resetLive` terminate; `START_LIVE_GIVE_UP_MS` via fake timers; cache-hit skips worker; auto-start from `localStorage`; picker→`startLive`, `Original`→reset; badge/banner/`role=alert`/`role=status`; `aria-busy`+skeleton in all six regions; `Seo` English-locked tags; bubbles `frameloop always↔never` on IO/hidden + reduced-motion gradient.
- **E2E tier** (`e2e/*.spec.ts`, Playwright vs `vite preview`): boot (0 worker/ONNX, 1 canvas) → FR pick (6 `aria-busy`, skeletons, `Original`) → stall→give-up→`Original` restores EN → scroll down+up replay → tab-switch persistence → reduced-motion static. Assertions mirror v9 BUNDLE Flows 2–4.
- **Log-knowledge loop:** after `docker:dev` runs on a host, paste `docker logs` output for mining into regression tests; per-run Chrome console + network captured as e2e artifacts under `bundle/`, failures become new specs.
- **Known risks:** stylex/babel-compiler transforms under vitest may need `deps` tweaks (first failure decides); Playwright browser download ~150MB; give-up suite uses fake timers so it stays fast.

## 🔴 To close (updated)

1. **Owner installs test deps + scripts** (§13 owner-install line).
2. **Agent implements tiers** (prep refactors → unit → integration → e2e + configs) once deps are present; suites must be green (`test:unit`, `test:integration`, `test:e2e`) before commit.
3. **Pending proofs (§10.4, carried):** full FR completion shot; AR RTL + ES re-proof — e2e covers the automatable parts; full-completion capture still needs a faster machine or warm model cache.
4. **Lighthouse re-run:** snapshot mode on the final build to replace the `*` carry-over row.
5. **Docker smoke test:** `npm run docker:dev` / `:logs` / `:down` on a Docker host, then feed logs into the §13 loop.

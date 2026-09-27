# REQUIREMENTS v14 — `check`-zero rule + PWA installable minimum (extends v13)

Supersedes v13. §§1–13 stand (translation §§1–6, scroll replay §8, visible bubbles §9, give-up bound, dead-string cleanup, benchmark bump, compose removal, v11 ops verified, test-pyramid spec — implementation pending owner dep install).

## 14. Zero-check rule + PWA (owner direction, new)

- **`npm run check` defined** (owner adds script; agent paths deny `package.json`): `check` = `tsc -b && oxlint`. It is the gate for every commit — rerun until **zero errors and zero warnings**.
- **Fix-all-warnings in scope** (owner-approved): the 8 pre-existing oxlint warnings must be fixed at their roots, behavior-neutral — `main.tsx:13` barrel-export, `LanguageContext.tsx:122-130` constant/function separation, `LiveTranslationContext.tsx:244` set-state-in-effect + `:275,282` exports. `tsc -b` stays green throughout the loop.
- **PWA scope: installable minimum** (owner-approved; guide: `https://vite-pwa-org.netlify.app/`): web manifest + app-shell service worker + offline fallback + Google-Fonts runtime cache. **Explicit non-goals:** no NLLB model/CDN precache (hundreds of MB — the user-consented download stays exactly as-is), no push, no background sync. Workbox precache `globPatterns` must exclude `*.wasm`, `translate.worker*`, PDFs, `bundle/`.
- **PWA blockers are owner-side** (plugin registration requires editing denied `vite.config.ts`; new dep): owner runs
  `npm i -D vite-plugin-pwa @vite-pwa/assets-generator`
  and makes the 3-line `vite.config.ts` edit (import `VitePWA` + options, add `VitePWA(pwaOptions)` to plugins — exact snippet handed over at implementation time). All PWA options live in a new agent-created `pwa-options.ts` so the owner diff stays trivial.
- **Icons via build-time generation** (owner-approved): no suitable source exists (`favicon.svg` is 48×46 non-square; `og.png` is 1200×630; `public/icons/` are skill glyphs). Agent adds square safe-zone-padded `public/pwa-icon.svg` derived from the brand mark; 192/512 + maskable + apple-touch-icon PNGs generated at build via `@vite-pwa/assets-generator`.
- **Agent-side PWA surface:** `index.html` gains `theme-color` + `apple-touch-icon` links (manifest link auto-injected at build); manifest name/short_name from `seo.json`, `display: standalone`, theme/background colors from theme tokens; `navigateFallback` to cached `/` with denylist for future API routes.
- **PWA verification:** `npm run build` must emit `sw.js` + `manifest.webmanifest`; e2e gains installability specs (SW registration, manifest 200, offline reload serves fallback) running against `vite preview` of the PWA build. The pending Lighthouse re-run (To-close-4) now also covers the `manifest`/`service-worker` audits.
- **Known risks:** assets-generator pulls `sharp` (native — sandbox usually fine; `node:22-alpine` Docker needs `python3/make/g++` only if prebuilds are missing); e2e webServer uses fixed `:4180` + `reuseExistingServer` to avoid port conflicts.

## 🔴 To close (updated — extends v13 list, nothing removed)

1. **Owner installs** (§13 test line + §14 PWA line), adds `check`/`test:*` scripts, makes the 3-line `vite.config.ts` PWA edit.
2. **`npm run check` → zero** (agent fixes §14 warnings loop first — everything else depends on it).
3. **Agent implements PWA minimum** (§14 surface) + **test tiers** (§13) once deps are present; `check` + all suites green before commit.
4. **Pending proofs (§10.4, carried):** full FR completion shot; AR RTL + ES re-proof — e2e covers the automatable parts; full-completion capture still needs a faster machine or warm model cache.
5. **Lighthouse re-run:** snapshot mode on the final PWA build (replaces `*` row; now includes PWA audits).
6. **Docker smoke test:** `npm run docker:dev` / `:logs` / `:down` on a Docker host, then feed logs into the §13 loop.

# REQUIREMENTS v15 — preview-only proof rule + PWA/test-infra lock (extends v14)

Supersedes nothing. §§1–14 stand (v14 check-zero zero/zero + PWA installable minimum; owner dep-install + 3-line vite edit still pending).

## 15. Proof validity + pre-condition lock (planner findings 2026-09-06, new)

- **Preview-only browser proof.** `file://` serving of `dist/` is INVALID evidence and must never be cited: absolute `/assets/*` module/CSS are CORS-blocked (blank `RootWebArea`, 6 console CORS/404s), favicon 404s, Lighthouse snapshot on `file://` scores 93/100/80/50 (13/3) vs the carried 100/100/100/100 preview baseline. All DOM/screenshot/console/network/Lighthouse/e2e proofs must run against `vite preview` (port `:4180`, `reuseExistingServer`) or `npm run dev :5173`. Any `file://` Lighthouse row is explicitly non-evidence.
- **PWA pre-conditions re-locked (still absent, verified):** no `sw.js`/`manifest.webmanifest` in `dist/`; `index.html`+`dist/index.html` have no `theme-color`/`apple-touch-icon`/`manifest` link and fonts stylesheet lacks `crossorigin="anonymous"` (REQUIRED for Fonts runtime cache); `vite.config.ts` has no `VitePWA`; `pwa-options.ts` absent and `tsconfig.node.json` still includes only `vite.config.ts`. Owner §14 3-line edit + `tsconfig.node.json` include update stay owner-side; everything else agent-side per §14 surface.
- **Test-infra alignment (owner-side, blocks green):** `e2e/helpers.ts BASE` still `:4173` must move to `:4180` to match the required preview webServer; `vitest.config.ts` (unit/integration projects, exclude `e2e/`) + `playwright.config.ts` (`:4180` + `reuseExistingServer`) still missing — `test:unit` filter error and vitest collecting Playwright specs are the known non-issue until then; new `e2e/pwa.spec.ts` (SW registers, manifest 200, offline reload → fallback, `dist/sw.js`+manifest emitted) still unwritten.
- **Gate hygiene (owner-side):** `check` must become `tsc -b && oxlint` (knip standalone); `lint` must become bare `oxlint` with `--fix` moved to `lint:fix` (a gate must not mutate); knip triage (`@astryxdesign/theme-butter`, schema exports, `useContent`, husky binary, now-flagged pwa plugins) only matters if knip stays in any gate — per v14 it does not.
- **Theme import lock:** `src/main.tsx:5` currently imports `./theme/soft-pop` (generated `@generated`-tag file). Lock the canonical import (either `softPopTheme.ts` + rebuild, or generated + one-word header re-fix documented) so the §14-adjacent jsdoc fix does not silently regress on `astryx theme build`.
- **Docker (carried, reverified):** `Dockerfile.dev` verified correct (`platformatic/node-caged:26.3.1-alpine`, `VOLUME /app/node_modules` only, no `/app` volume). Daemon still `permission denied /var/run/docker.sock` on this host — smoke test (`docker:dev/:logs/:down`) stays a Docker-host task; logs from that host feed the §13 loop.

## 🔴 To close (updated — extends v14 list, nothing removed)

1. Owner installs/configs (§14 PWA line + §15 test-infra + gate hygiene + `tsconfig.node.json` include).
2. `npm run check` → zero (already zero/zero on `tsc -b && oxlint`; unblock commit).
3. Agent implements PWA minimum + `pwa.spec.ts` + BASE `:4180` once deps present; `check` + all suites green before commit (order: check-zero, integration, e2e, PWA).
4. Pending proofs (§10.4, carried): full FR completion shot; AR RTL + ES re-proof; Docker smoke on Docker host.
5. Lighthouse re-run: snapshot mode on final PWA **preview** build incl. manifest/SW audits (replaces `*` row; `file://` rows excluded by §15).

# REQUIREMENTS v16 — PWA agent surface sealed, owner-blocker lock (extends v15)

Supersedes nothing. §§1–15 stand (v14 check-zero + PWA minimum; v15 preview-only proof rule, test-infra alignment, gate hygiene, theme-import flag, PWA pre-conditions).

## 16. Session-2 surface sealed + reverified locks (planner findings 2026-09-06, new)

- **Agent PWA surface SEALED (do not rewrite):** `pwa-options.ts` (typed `VitePWAOptions`; `strategies:'generateSW'`, `registerType:'autoUpdate'` silent; manifest literals `name/short_name/description` kept in sync with `seo.json:default` BY CONVENTION — no `resolveJsonModule` in owner `tsconfig.node.json`; `display:'standalone'`, `lang:'en'`, `theme_color #7B61FF` / `background #FFF7F0`; icons 192 + 512 any + 512 maskable; `pwaAssets.image:'public/pwa-icon.svg'` single-image `minimal-2023`; `includeAssets:[favicon.svg, robots.txt]`; `workbox.globPatterns` code/image/font/doc only + `globIgnores [**/*.wasm, **/translate.worker*, **/*.pdf, bundle/**]` — model/worker/PDF/proofs NEVER precached; `navigateFallback:'index.html'` + `navigateFallbackDenylist:[/^\/api\//]`; 2× Fonts `CacheFirst` 365d/`maxEntries:10`/`statuses:[0,200]` per official recipe; `devOptions:{enabled:false}` — PWA proven via preview, never dev). `public/pwa-icon.svg` (square 512, `#FFF7F0` rounded bg, `#7B61FF` bolt re-drawn from favicon mark inside maskable safe circle; skill glyphs explicitly excluded). `index.html` (`theme-color`, `apple-touch-icon 180`, `crossorigin="anonymous"` on Fonts; manifest link auto-injected, never hand-written). `e2e/helpers.ts BASE=http://127.0.0.1:4180`. `e2e/pwa.spec.ts` (dist-emit asserts incl. name/`theme_color`/192+512 + browser SW-scope/manifest-200/`theme-color`-match/offline-reload spec, artifacts to `bundle/`).
- **Theme lock (decided):** keep generated `soft-pop` import in `main.tsx:5` (zero behavior change vs switching to `softPopTheme.ts` source, which would need visual re-proof); re-apply one-word `@generated`→`Generated` header fix after each `astryx theme build`.
- **Reverified this pass:** `dist/index.html` HAS the three head tags (emitted); `dist/sw.js`/`manifest.webmanifest`/`apple-touch-icon.png`/`pwa-*.png` ABSENT (O4 open); `file://` STILL blank (`root:0`, `manifest:null`, white screenshot, console 7 CORS/404s, Lighthouse 93/100/80/50) — v15 non-evidence rule holds; `:4180` `ERR_CONNECTION_REFUSED` (no preview server); `oxlint` zero/zero; `tsc -b` green; `vitest` 83 pass / 12 files pass + 6 e2e collect-fail (count updated 5→6; fix is O2 scoping, never renames) + new minor `Vite servers from exiting` hang warning (triage with O2, not a gate); `knip` unused schema/type list persists (O1 triage); `bundle/e2e-*` absent; Docker daemon still `permission denied` (`Dockerfile.dev` itself verified correct).
- **Owner blockers carried as O1–O6 (exact snippets already handed over):** O1 `check`→`typecheck && lint`, `lint`→bare `oxlint`, add `lint:fix`; O2 `vitest.config.ts` unit/integration projects (no `setupFiles` — tests self-configure); O3 `playwright.config.ts` (`testDir:e2e`, preview `--port 4180`, `reuseExistingServer`, `baseURL :4180`); O4 `vite.config.ts` 3-line PWA edit (`VitePWA(pwaOptions)` first); O5 `tsconfig.node.json` include `+pwa-options.ts`; O6 Docker-host smoke test. `sharp` prebuild/toolchain note carried for first PWA build.

## 🔴 To close (updated — extends v15 list, nothing removed)

1. Owner lands O1–O5 (+O6 on Docker host).
2. `npm run check` → zero → commit in order: (1) Phase-1 check-zero, (2) integration tier, (3) e2e tier, (4) PWA surface — each green.
3. `npm run build` → assert `dist/sw.js` + `manifest.webmanifest` (then `pwa.spec.ts` dist asserts go green).
4. `vite preview --port 4180` → `test:e2e` (all 6 specs incl. pwa) → Lighthouse **snapshot** on preview incl. manifest/SW audits (replaces `*` row; `file://` rows excluded per §15).
5. Pending proofs (§10.4, carried): full FR completion shot; AR RTL + ES re-proof; Docker smoke on Docker host.

# REQUIREMENTS v17 — check-loop exhaustion + Docker group fix (extends v16)

Supersedes nothing. §§1–16 stand (v14 check-zero + PWA minimum; v15 proof/test/gate locks; v16 sealed PWA surface + O1–O6).

## 17. Session 3–4 seals + new locks (planner findings 2026-09-06, new)

- **Check-loop EXHAUSTED agent-side (sealed, do not re-attempt):** knip 30 → 8 via genuine dead-code removal only — `src/lib/content.ts` dead `useContent()` + `useLanguage` import deleted (zero callers; docstring admitted obsolescence); `src/types/content.ts` 8 in-file-only schemas de-exported (definitions kept, aggregates + `content.unit.test.ts` coverage intact) + 14 unreferenced infer types deleted (`Profile/Ui/About` kept — used by `live.ts`/`LiveTranslationContext` — plus all test-imported schemas, import-grep-verified pre-cut); `LanguageContext.tsx:12` doc → `useContentWithLive()`; `e2e/helpers.ts` unused `LogCapture` deleted. No renames, no workspace file, no fake imports (would violate locked designs).
- **`knip.json` is agent-DENIED (new permission lock):** live tool policy denies it — prior notes assuming editability are corrected. Remaining knip 8 are ALL denied-file-bound (`pwa-options.ts`+2 pwa devDeps → O4/O5; `check-assets.d.mts`+`soft-pop.d.ts`+`husky` → `knip.json` ignore; `theme-butter` → `package.json`). `npm run check` therefore CANNOT go fully green agent-side (knip items + `test` exit code via O2 mis-collection); the v14 gate (`tsc -b && oxlint`) itself stays zero/zero and is the agent green bar.
- **PWA icon set FINAL (3 entries, sealed):** Session-4 dropped the redundant purpose-less 512 twin — `192` + `512 purpose:any` (explicit default, not a dup) + `512 purpose:maskable`, matching the official "2 icons any+maskable" recommendation and `minimal-2023` preset; `devOptions.enabled:false` rationale commented (§15 preview-only rule); manifest name/description re-checked character-identical to `seo.json:default`; `pwa-icon.svg` + `e2e/pwa.spec.ts` untouched/re-verified.
- **O6 root cause + fix (new):** daemon socket `root:docker`, shell user `malek` lacks `docker` group → `permission denied` is a group-membership issue, not a Docker problem (`Dockerfile.dev` itself verified correct again). Host-admin fix: `sudo usermod -aG docker malek` + re-login; then detached smoke variant of the `docker:dev` script (`build && run -d -p 5173:5173 -v .:/app -v /app/node_modules -e CHOKIDAR_USEPOLLING=true && logs && stop && rm`).
- **Reverified this pass (third file:// row):** fresh build hash `index-i3-Hi9r7.js`; `file://` STILL blank/white (empty snapshot, 6 console CORS/404s, 5 network reqs, Lighthouse 93/100/80/50 13/3, screenshot/evaluate timeout) — §15 holds; `dist/index.html` head tags emitted; `sw.js`/manifest/PNGs absent (O4); `:4180` down (no listener); `vitest` 83 pass / 12+6 files + hang warning; `bundle/e2e-*` absent.

## 🔴 To close (updated — extends v16 list, nothing removed)

1. Owner lands O1–O5 (+O6: `usermod` + detached smoke on Docker host).
2. `npm run check` → zero → commit in order: (1) Phase-1 check-zero, (2) S3 dead-code cleanup, (3) integration tier, (4) e2e tier, (5) PWA surface — each green.
3. `npm run build` → assert `dist/sw.js` + `manifest.webmanifest`.
4. `vite preview --port 4180` → `test:e2e` (6 specs incl. pwa) → Lighthouse **snapshot** on preview incl. manifest/SW audits (replaces `*` row; `file://` rows excluded per §15).
5. Pending proofs (§10.4, carried): full FR completion shot; AR RTL + ES re-proof; Docker smoke logs feed.

# REQUIREMENTS v18 — owner-progress inventory + permission boundary seal (extends v17)

Supersedes nothing. §§1–17 stand (v14 check-zero + PWA minimum; v15 proof/test/gate locks; v16 sealed PWA surface + O1–O6; v17 check-exhaustion + Docker fix).

## 18. Sessions 5–6 seals + new locks (planner findings 2026-09-06, new)

- **Owner progress inventoried (found in tree, sealed as fact):** `package.json` ships `check`/`typecheck`/`test`/`test:*`/`knip`/`prepare` + PWA/test deps (`vite-plugin-pwa ^1.3.0`, `@vite-pwa/assets-generator ^1.0.2`, `vitest`, `@playwright/test`, testing-library, `jsdom`, `knip`); `.oxlintrc.json` has all 9 plugins; `Dockerfile.dev` is `platformatic/node-caged`. Still open with exact deltas: O1 (`check` still runs knip, `lint` still `--fix`, no `lint:fix`), O2/O3 (both configs glob-confirmed absent), O4 (`vite.config.ts` still no `VitePWA`), O5 (`tsconfig.node.json` still `vite.config.ts` only).
- **Permission boundary SEALED (live policy, §13.1 — do not re-probe):** agent-denied: `knip.json`, `package.json`, `*.config.*` (`vite/vitest/playwright`), `tsconfig*.json`, `Dockerfile*`, `docker-compose*.yml`, `.git/*`; `rm *` (use `unlink`); `npx *` (use `npm run` / `node_modules/.bin`); `pkill`; background preview servers (`nohup` rejected). `e2e/*.spec.ts` must never be renamed to dodge vitest collection (locked design; fix is O2 scoping only).
- **Five-commit order LOCKED (§8):** (1) Phase-1 check-zero, (2) S3 dead-code cleanup, (3) integration tier, (4) e2e tier, (5) PWA surface — each verified green after O1–O5. Prior four-commit wordings are superseded by this five-commit order.
- **Reviewer sign-off checklist ADOPTED (§13.3):** O1 → `check` zero/unblocks husky; O2/O3 → `test:*` green on `:4180`+`reuseExistingServer`, mis-collection gone; O4/O5 → `build` emits `sw.js`+`manifest.webmanifest` (+ generated PNGs), `pwa.spec.ts` dist asserts green; Lighthouse **snapshot** on preview incl. manifest/SW audits (replaces `*` row; `file://` excluded); carried proofs closed (§10.4); O6 `usermod` + detached smoke.
- **Reverified this pass (fourth file:// row):** blank white screenshot captured; empty snapshot; 7 console CORS/404s (`index-i3-Hi9r7.js`); 6 network reqs; Lighthouse 93/100/80/50 13/3; head tags emitted; SW/manifest + O2/O3 configs absent; `:4180` down; `oxlint` zero; `vitest` 83 pass / 12+6 files + hang warning; socket `root:docker` vs user without `docker` group.

## 🔴 To close (updated — extends v17 list, nothing removed)

1. Owner lands O1–O5 (+O6: `usermod` + detached smoke on Docker host).
2. `npm run check` → zero → five commits in §18 order, each green.
3. `npm run build` → assert `dist/sw.js` + `manifest.webmanifest`.
4. `vite preview --port 4180` → `test:e2e` (6 specs incl. pwa) → Lighthouse **snapshot** on preview incl. manifest/SW audits (replaces `*` row; `file://` rows excluded per §15).
5. Pending proofs (§10.4, carried): full FR completion shot; AR RTL + ES re-proof; Docker smoke logs feed.

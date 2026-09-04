# REQUIREMENTS v10 — v9 close-out amendments + carried proofs

Supersedes v9. §§1–9 stand as implemented and committed (`ce67bc4`): scroll replay (`once:false` ×4), visible bubbles (permanent mount, `frameloop` toggle, HDR removed), `START_LIVE_GIVE_UP_MS = 30min` + per-chunk 600s guard, Docker dev files, regenerated `bundle/BUNDLE.md`.

## 10. Amendments found in the v10 review pass

1. **Dead `ui.live` strings removed** (owner-approved): `cta`, `downloading`, `dataSaver`, `liveTooltip` were defined in `src/data/ui.json` + `src/types/content.ts` (schema + defaults) but never read — the code uses `downloadingDetail`, `dataSaverBanner`, `originalTooltip` throughout (`TopNav.tsx:60,71,81`). Removed from all three places; `src/data/README.md` key list updated to match. ⚠️ Zod schema changed — `npm run build` (`tsc -b`) MUST pass before commit (not yet run: no shell in the editing session).
2. **`BENCHMARKS.md` bumped to v9** (owner-approved minimal bump): header now cites v9; new v9 row records final-build numbers (`1281 modules`, initial `223.58kB` gzip, CanvasWrapper `887.81kB` raw, oxlint 8 pre-existing warnings). Scored Lighthouse categories were NOT re-run in v9 — v7 snapshot 100s carry over, marked `*` with reason (no a11y/SEO-affecting markup change since v7). Full snapshot re-run pending on a machine with browser tooling.
3. **Docker landed under policy exception:** `Dockerfile.dev`, `docker-compose.dev.yml`, `.dockerignore`, and `docker:dev/logs/down` scripts exist and are committed, even though `opencode.jsonc` `edit` rules still deny `Dockerfile*`/`docker-compose*`/`package.json`. Rule for agents: these files are **owner-maintained, read-only** — never edit via tooling; propose changes in chat. `docker:dev` smoke test still pending (daemon unreachable in sandbox; `docker ps` → permission denied).
4. **Completion proofs carried, not closed** (owner-approved): full FR translated-text screenshot, AR RTL + ES re-proof on the v9 build. Reason: cold-cache download + single-thread WASM inference exceeded the honest 600s chunk guard on this machine (`Translation timeout — chunk of 6 texts exceeded 10 min`, English restored). Degradation path (progress → error → `Original`) is proven; completion is not.
5. **Session limitation on record:** the session performing these file edits had no browser/MCP invocation tool and no shell access — fresh screenshots, Lighthouse, `npm run build/lint`, and the commit itself are all pending operator action.

## 🔴 To close (updated)

1. **Validate + commit:** run `npm run build` (validates the zod change), `npm run lint`, then commit source + `BENCHMARKS.md` + v10 together.
2. **Pending proofs (§10.4):** full FR completion shot; AR RTL + ES re-proof — needs a faster machine or warm model cache.
3. **Lighthouse re-run:** snapshot mode on the final build to replace the `*` carry-over row.
4. **Docker smoke test:** `npm run docker:dev` / `:logs` / `:down` on a Docker host.

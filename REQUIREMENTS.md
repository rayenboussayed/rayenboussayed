# REQUIREMENTS v11 — compose removed, Dockerfile.dev only

Supersedes v10. §§1–10 stand (translation §§1–6, scroll replay §8, visible bubbles §9, give-up bound, dead-string cleanup, benchmark bump — all implemented; v10 file edits validated this session, see §11.1).

## 11. Docker simplification (owner direction)

1. **Validated v10 edits this session:** `npm run build` green (`tsc -b` + vite, 4.98s, `check-assets` prebuild clean) — the zod `ui.live` trim is schema-valid. Fresh `dist` reproduces the recorded numbers exactly (`index-IvkFHOCi.js`, initial `223.58kB` gzip, `CanvasWrapper-DnbTULX0.js` `887.81kB` raw). `npm run lint`: same 8 pre-existing warnings, zero new. Docs already in sync (no doc edit needed for the rebuild).
2. **`docker-compose.dev.yml` removed** — single `Dockerfile.dev` is the only container definition. Compose added nothing (one service, no networks/volumes naming needs) and doubled the files to maintain.
3. **`package.json` `docker:*` scripts go plain-docker** (owner edit — agent paths deny `package.json`):
   - `docker:dev`: `docker build -f Dockerfile.dev -t rayenboussayed-dev . && docker run --rm --name rayenboussayed-dev -p 5173:5173 -v .:/app -v /app/node_modules -e CHOKIDAR_USEPOLLING=true -it rayenboussayed-dev`
   - `docker:logs`: `docker logs -f rayenboussayed-dev`
   - `docker:down`: `docker stop rayenboussayed-dev`
   
   Same behavior as compose (HMR bind mount, anonymous `node_modules` volume, polling watch, `:5173`); `--name` gives `logs`/`down` a stable handle; `--rm` keeps `down` equivalent to `compose down` (no orphans).
4. **`Dockerfile.dev:10` comment reword** (owner edit — agent paths deny `Dockerfile*`): bind-mount now comes from the `docker run -v` flags, not compose; `COPY . .` stays fallback.
5. **`bundle/BUNDLE.md:53` rewritten** to Dockerfile-only wording (done, history preserved).
6. **Policy standing:** `Dockerfile.dev` / `package.json` remain owner-maintained, agent read-only. `docker-compose*.yml` deny rule stays (now Guards against re-adding it).

## 🔴 To close (updated)

1. **Owner file ops + commit:** delete `docker-compose.dev.yml`; apply the three `package.json` scripts (§11.3); reword `Dockerfile.dev:10` (§11.4); then commit source + `BENCHMARKS.md` + `BUNDLE.md` + v11 together. (Build/lint already green — no need to re-run unless the tree changes first.)
2. **Pending proofs (§10.4, carried):** full FR completion shot; AR RTL + ES re-proof — needs a faster machine or warm model cache.
3. **Lighthouse re-run:** snapshot mode on the final build to replace the `*` carry-over row.
4. **Docker smoke test:** `npm run docker:dev` / `:logs` / `:down` on a Docker host (daemon unreachable in sandbox).

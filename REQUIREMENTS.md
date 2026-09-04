# REQUIREMENTS v12 — v11 owner ops verified, close-out carried

Supersedes v11. §§1–11 stand (translation §§1–6, scroll replay §8, visible bubbles §9, give-up bound, dead-string cleanup, benchmark bump, compose removal — all implemented; v10 edits validated by green build + lint).

## 12. v11 To-close-1 verified closed (review pass)

1. **`docker-compose.dev.yml` deleted** — read fails, file gone from tree.
2. **`package.json:14-16` plain-docker scripts** verified exact against §11.3 (`docker build -f Dockerfile.dev -t rayenboussayed-dev . && docker run --rm --name rayenboussayed-dev -p 5173:5173 -v .:/app -v /app/node_modules -e CHOKIDAR_USEPOLLING=true -it rayenboussayed-dev` / `docker logs -f rayenboussayed-dev` / `docker stop rayenboussayed-dev`).
3. **`Dockerfile.dev:10` comment** reworded to the `docker run -v` wording.
4. **Committed:** `f34c7d8` (v10) + `94c6324` (v11); tree clean at review time.
5. **Reference sweep:** no live `compose` references remain — only accurate history (`bundle/BUNDLE.md:53` "removed in v11", kept) and v11's own text. The `docker-compose*.yml` edit-deny rule stays as a guard against re-adding it. `Dockerfile.dev` / `package.json` remain owner-maintained, agent read-only.

## 🔴 To close (updated — all operator-side)

1. **Pending proofs (§10.4, carried):** full FR completion shot; AR RTL + ES re-proof — needs a faster machine or warm model cache.
2. **Lighthouse re-run:** snapshot mode on the final build to replace the `*` carry-over row.
3. **Docker smoke test:** `npm run docker:dev` / `:logs` / `:down` on a Docker host (daemon unreachable in sandbox).
4. **Browser verification protocol** (no browser/MCP tool in agent sessions — run where tooling exists): fresh EN boot shot → scroll down+up replay → tab-away/back → FR auto-start skeleton → `Original`; snapshot + CLS + console + network at each step (expected proofs specified in v9 Flows 2–4).

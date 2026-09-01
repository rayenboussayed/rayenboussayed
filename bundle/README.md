# Bundle — Screenshots + Merged Source

> Project: `rayenboussayed` — Vite + React 19 + Astryx + Motion + Three.js + React Compiler
> Generated: 2026-09-01 via Chrome DevTools MCP `vite preview` on http://127.0.0.1:4174 (commit 06c8536)

## Contents in `bundle/`

| File | What | Source file path |
|---|---|---|
| `00-PROJECT-MERGED.md` | **Single merged file** — all project sources concatenated with `## File: path` headers + fenced code (122K, 2423 lines) | See file list inside |
| `01-header-nav.png` | Header / TopNav (sticky nav, RYNBSD + links) | `src/components/TopNav.tsx:1-48` `src/App.tsx:24` `AppShell variant wash` `src/data/ui.json:2-7` `src/data/profile.json:19-28` |
| `02-hero.png` | Hero `#hero` — name/role/tagline/CTAs + glowing bubbles + avatar | `src/components/Hero.tsx:1-95` `src/components/GlowBubbles/*:1-106` `shaders.ts:1-55` `src/data/profile.json` `src/theme/softPopTheme.ts:6-52` |
| `03-skills.png` | Skills `#skills` grid 14 cards | `src/components/Skills.tsx:1-43` `src/data/skills.json:1-16` `src/data/ui.json:10-12` `src/types/content.ts:58-66` |
| `04-experience.png` | Experience `#experience` timeline 2 items | `src/components/Experience.tsx:1-39` `src/data/experience.json:1-18` `src/types/content.ts:68-78` |
| `05-about.png` | About `#about` blocks | `src/components/About.tsx:1-40` `src/data/about.json:1-8` `src/types/content.ts:109-118` |
| `06-projects.png` | Projects `#projects` 2 cards + tags | `src/components/Projects.tsx:1-52` `src/data/projects.json:1-20` `src/types/content.ts:80-92` |
| `07-footer.png` | Footer `contentinfo` — Let's talk + socials | `src/components/Footer.tsx:1-48` `src/data/profile.json:19-28` `src/App.tsx:40` |
| `08-fullpage.png` | Full page (1280x900) — all sections | `src/App.tsx:1-43` `src/main.tsx:1-18` `src/index.css` `public/robots.txt` `sitemap.xml` `llms.txt` |

## How the merged file was built

`bundle/00-PROJECT-MERGED.md` was built by concatenating these files in order (via `/tmp/merge.sh`):

`package.json` → `vite.config.ts` → `index.html` → `tsconfig*.json` → `src/main.tsx` → `src/App.tsx` → `src/index.css` → `src/theme/softPopTheme.ts` → `src/types/content.ts` → `src/lib/content.ts` → `src/data/*.json` → `src/components/*.tsx` + `GlowBubbles/*` → `README.md` → `PLAN.md` → `BENCHMARKS.md` → `requirements.md` → `planner.md` → `builder.md`

Each file appears as:

```
## File: `path/to/file`

```lang
content
```
```

## Verification

- Screenshots taken via `chrome-devtools_take_screenshot` with `uid` from `chrome-devtools_take_snapshot` (pageId 1, 1280x900) — one H1 (`Hero.tsx:52`), landmarks `banner/nav/main/region/footer`, all `img alt` from JSON, `whileInView viewport {once:false amount0.25 margin"-10%..."}` + parallax `-28` visible.
- Merged file checked: `2423 lines` `122K`, `grep` CMS PASS holds, build `1248 modules` `207.53kB initial` `254.97kB lazy` `LCP 1405ms CLS 0` `Lighthouse 100/100/100`.


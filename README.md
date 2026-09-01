# RYNBSD — Portfolio (Soft Pop Neobrutalist)

Live: https://rynbsd.vercel.app/ (content source, old design not copied) • New build: Vite + React 19 + Astryx + StyleX + Motion + Three.js

Image: soft-pop neobrutalist — chunky 3px borders, hard 6px offset shadows, pastel+bold palette, blobby 20px radius, pill CTAs.

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build
npm run preview      # serve dist on 4173
npm run lint         # oxlint
```

## Editing content (no code)

All visible copy is in `src/data/*.json` validated by `src/lib/content.ts` (zod). Edit JSON → refresh. See `src/data/README.md` for key→section map.

- `profile.json` → Hero + Footer + SEO JSON-LD
- `skills.json` (14) → Skills grid
- `experience.json` (2) → Timeline
- `about.json` blocks → About
- `projects.json` (2) → Project cards
- `seo.json` → `<title>`, `<meta>`, OG, canonical
- `theme.json` → baseTheme y2k, accent, bubblePalette, borderWidth, radius

Images go in `public/` (`/avatar.webp`, `/projects/*`, `/og.png` 1200×630, `/icons/*`) — reference with leading `/` and provide `imageAlt`/`iconAlt`.

## Theme

Base is `@astryxdesign/theme-y2k` (periwinkle pop). Override via `src/theme/softPopTheme.ts`:

```ts
import { defineTheme } from '@astryxdesign/core/theme'
import { y2kTheme } from '@astryxdesign/theme-y2k'
export const softPopTheme = defineTheme({ name:'soft-pop', extends: y2kTheme, tokens:{'--border-width':'3px','--shadow-med':'6px 6px 0px rgba(0,0,0,0.9)'}, components:{card:{base:{borderWidth:'3px'}}, button:{'variant:primary':{boxShadow:'var(--shadow-med)'}}} })
```

Preview theme: `npm run dev` shows soft-pop. For built artifacts: `npm run astryx -- theme build ./src/theme/softPopTheme.ts` → `softPopTheme.css/js/d.ts`.

See `PLAN.md:D` for token table and `https://astryx.atmeta.com/docs/theme`.

## Layout & Components

- `AppShell variant="wash"` wraps app (`src/App.tsx:19`) with `topNav={<TopNav/>}` (`@astryxdesign/core/AppShell`)
- `TopNav` uses `TopNavHeading`/`TopNavItem` (`src/components/TopNav.tsx:1`), motion `layoutId="nav-underline"` FLIP
- `Section` per region (`Skills.tsx:11` etc.) with `id`+`aria-labelledby` + `Layout` where needed
- Cards via `Card` + `Badge` + `Button` — do not hand-roll primitives (except 3D canvas)

## Motion & 3D

- `MotionConfig reducedMotion="user"` in `src/main.tsx:9`
- Hero stagger, scroll `whileInView`, hover `whileHover`/`whileTap`, tilt `rotateX/Y`, progress `useScroll`+`useSpring` (`src/components/ScrollProgress.tsx:1`)
- Bubbles `src/components/GlowBubbles/` lazy Canvas `dpr={[1,2]}` `frameloop="always"` + `IntersectionObserver` pause when offscreen + `prefers-reduced-motion` fallback (static gradient)

## SEO & AI

- `src/components/Seo.tsx` React 19 `<title>`/`<meta>` hoisted + JSON-LD `Person`
- `index.html` has fallback title matching `seo.json` default
- `public/robots.txt`, `sitemap.xml`, `llms.txt` (Markdown links), `og.png` 1200×630

## Benchmarks

See `BENCHMARKS.md` — Lighthouse 100/100/100 desktop/mobile, LCP 1028ms, CLS 0, initial JS 192.66kB gzip (lazy three 236kB).

## Deploy

`dist/` is static. Sync canonical `seo.json:canonical` with `robots.txt`+`sitemap.xml` `https://rynbsd.vercel.app` (or your domain) — update `lastmod` in `sitemap.xml`.

## License

MIT

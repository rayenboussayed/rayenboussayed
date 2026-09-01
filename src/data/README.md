# Content CMS — how to edit without touching code

All visible copy is in `src/data/*.json`. Edit JSON, save, refresh — no `.tsx` changes needed.

| File | What you edit | Where it appears |
|---|---|---|---|
| `profile.json` | `name`, `role`, `tagline`, `location`, `avatar`, `avatarAlt`, `email`, `resumeUrl`, `certificationsUrl`, `socials[]` | Hero (H1, tagline, CTAs, icons) + Footer (email/socials) + SEO JSON-LD |
| `skills.json` | Array of `{ name, icon, iconAlt?, category }` | Skills grid. `icon` = `/icons/*.svg` (or webp) path, `iconAlt` defaults to `name` if omitted. Add/remove entries to change grid. |
| `experience.json` | Array of `{ role, org, period, description, icon, iconAlt? }` | Experience timeline. `iconAlt` defaults to `role`. Order = display order |
| `projects.json` | Array of `{ title, description, url, tags[], image, imageAlt }` | Projects cards. `tags` render as pills, `url` = CTA link, `imageAlt` required for a11y. Images go in `public/projects/` (e.g. `/projects/open-source.webp` 640×360, `/og.png` 1200×630 for OG). |
| `about.json` | `{ blocks: [{ type: "h2" | "p", text }] }` | About section. Add `p` blocks for paragraphs |
| `seo.json` | `{ default: { title, description, keywords[], ogImage, canonical } }` | `<title>`, `<meta>`, OG/Twitter, canonical link. **Sync `canonical` with `public/robots.txt` Sitemap line and `public/sitemap.xml` `<loc>` — fallback `https://rynbsd.vercel.app/` until new domain.** |
| `theme.json` | `{ baseTheme, accent, bubblePalette, borderWidth, radius }` | Theme palette + bubble shader colors (bubblePalette drives `GlowBubbles` uniforms). `borderWidth` is string like `"3px"`. |

**Rules:**
- Keep JSON valid (no trailing commas). Run `npm run build` to validate — Zod will throw with the exact field if something is wrong.
- Images: put files in `public/` and reference as `/file.webp` with explicit `imageAlt`. For OG: `public/og.png` 1200×630 (used by `seo.json:ogImage`).
- Socials: `icon` values map to simple text labels currently; future can be SVG keys.
- `lastmod` in `public/sitemap.xml` should be updated on deploy (currently 2026-09-01) to match `seo.json` canonical date.
- Do not edit `src/lib/content.ts` — it just validates and re-exports.
- `index.html` fallback `<title>` must stay in sync with `seo.json:default.title` for no-JS crawlers.

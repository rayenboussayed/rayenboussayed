import type { VitePWAOptions } from 'vite-plugin-pwa'

// PWA installable minimum (REQUIREMENTS v14 §14, v15 §15).
// All PWA options live here so the owner-side vite.config.ts diff stays trivial:
//   import { VitePWA } from 'vite-plugin-pwa'
//   import { pwaOptions } from './pwa-options'
//   plugins: [VitePWA(pwaOptions), ...]
// Owner also adds this file to tsconfig.node.json "include".
//
// Explicit non-goals: no NLLB model/CDN precache (globIgnores below — the
// user-consented download stays exactly as-is), no push, no background sync.

const FONT_CACHE_DAYS = 365
const FONT_MAX_ENTRIES = 10

export const pwaOptions: VitePWAOptions = {
  strategies: 'generateSW',
  // Locked decision: silent auto-update (skipWaiting + clientsClaim).
  registerType: 'autoUpdate',
  // Manifest link is auto-injected at build; theme-color + apple-touch-icon
  // are explicit in index.html AND auto-injected from here (generator skips
  // tags that already exist).
  manifest: {
    // Keep in sync with src/data/seo.json:default.
    name: 'RYNBSD — Boussayed Rayen | Software Engineer',
    short_name: 'RYNBSD',
    description:
      'Boussayed Rayen (RYNBSD) — Software Engineer based in Algeria. I build full-stack products from scratch: React, Next.js, Node, PostgreSQL, Docker, and 3D web experiences.',
    display: 'standalone',
    lang: 'en',
    // Must match index.html theme-color (PWA minimal requirement).
    theme_color: '#7B61FF',
    background_color: '#FFF7F0',
    // Minimal set: 192 + 512 any + 512 maskable (purpose 'any' is the default
    // but stated explicitly so the maskable twin is not mistaken for a dup).
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  // Single-image mode: 192/512 + maskable + apple-touch-icon PNGs generated
  // at build from public/pwa-icon.svg (minimal-2023 preset default).
  pwaAssets: {
    image: 'public/pwa-icon.svg',
  },
  includeAssets: ['favicon.svg', 'robots.txt'],
  workbox: {
    // NEVER precache: translation model bytes, the translate worker chunk,
    // CV PDFs, or proof artifacts.
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
    globIgnores: ['**/*.wasm', '**/translate.worker*', '**/*.pdf', 'bundle/**'],
    navigateFallback: 'index.html',
    navigateFallbackDenylist: [/^\/api\//],
    // Google-Fonts runtime cache (Workbox recipe). Requires
    // crossorigin="anonymous" on the fonts stylesheet in index.html.
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: { maxEntries: FONT_MAX_ENTRIES, maxAgeSeconds: 60 * 60 * 24 * FONT_CACHE_DAYS },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: { maxEntries: FONT_MAX_ENTRIES, maxAgeSeconds: 60 * 60 * 24 * FONT_CACHE_DAYS },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
  // PWA is proven via `vite preview`, never dev (preview-only rule, §15).
  devOptions: { enabled: false },
}

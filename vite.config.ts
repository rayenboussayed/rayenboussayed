import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    devtools(),
    VitePWA({
      manifest: {
        background_color: '#0A0A0A',
        display: 'standalone',
        icons: [
          {
            sizes: '192x192',
            src: '/logo192.png',
            type: 'image/png',
          },
          {
            sizes: '512x512',
            src: '/logo512.png',
            type: 'image/png',
          },
        ],
        name: 'Rayen Boussayed - Portfolio',
        short_name: 'RB Portfolio',
        start_url: '/',
        theme_color: '#0A0A0A',
      },
      registerType: 'autoUpdate',
    }),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: ['liquid-glass-react'] },
})

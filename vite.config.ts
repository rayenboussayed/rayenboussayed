import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import stylex from '@stylexjs/unplugin/vite'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    {
      name: 'astryx-css-layer-order',
      transformIndexHtml() {
        return [
          {
            tag: 'style',
            children:
              '@layer reset, priority1, priority2, priority3, priority4, priority5, priority6, priority7, priority8, priority9, astryx-theme;',
            injectTo: 'head-prepend',
          },
        ]
      },
    },
    // @ts-ignore
    stylex({
      dev: process.env.NODE_ENV === 'development',
      runtimeInjection: false,
      treeshakeCompensation: true,
      useCSSLayers: true,
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: __dirname,
      },
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@astryxdesign/core/theme/tokens.stylex': path.resolve(
        __dirname,
        'node_modules/@astryxdesign/core/src/theme/tokens.stylex.ts',
      ),
      '@astryxdesign/core': path.resolve(
        __dirname,
        'node_modules/@astryxdesign/core/src',
      ),
    },
  },
  optimizeDeps: {
    exclude: ['@astryxdesign/core', '@astryxdesign/theme-neutral', '@astryxdesign/theme-y2k', '@astryxdesign/theme-butter'],
  },
})

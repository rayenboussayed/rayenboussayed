/**
 * Copies bergamot-translator's classic-Worker runtime (pinned to the
 * installed @mkljczk/bergamot-translator version) into public/bergamot/ so
 * the site can host the translation engine as static assets.
 *
 * Run automatically via the predev/prebuild npm hooks. The output is
 * git-ignored; it is derived from node_modules.
 */
import { mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const workerDir = join(dirname(require.resolve('@mkljczk/bergamot-translator/translator.js')), 'worker')
const outDir = join(root, 'public', 'bergamot')

const files = ['translator-worker.js', 'bergamot-translator-worker.js', 'bergamot-translator-worker.wasm']
mkdirSync(outDir, { recursive: true })
for (const file of files) {
  const src = join(workerDir, file)
  if (!existsSync(src)) {
    throw new Error(`Missing bergamot worker file: ${src}`)
  }
  copyFileSync(src, join(outDir, file))
  console.log(`[prepare-bergamot] copied ${file}`)
}

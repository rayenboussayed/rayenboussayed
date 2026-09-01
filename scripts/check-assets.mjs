#!/usr/bin/env node
/**
 * Check that every icon/image/avatar path referenced in src/data/*.json
 * exists under public/. Fails build if any asset 404s — prevents CMS edits
 * from silently breaking images (see requirements.md §4/§8).
 * Run: node scripts/check-assets.mjs (also as prebuild)
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const publicDir = join(root, 'public')

const files = [
  'src/data/profile.json',
  'src/data/skills.json',
  'src/data/experience.json',
  'src/data/projects.json',
  'src/data/seo.json',
]

function collectPaths(obj, out) {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    for (const v of obj) collectPaths(v, out)
    return
  }
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && (k === 'icon' || k === 'image' || k === 'avatar' || k === 'ogImage')) {
      // only absolute public paths starting with /
      if (v.startsWith('/')) out.push(v)
    } else if (v && typeof v === 'object') {
      collectPaths(v, out)
    }
  }
}

let missing = []
for (const rel of files) {
  const path = join(root, rel)
  let json
  try {
    json = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    console.error(`✗ cannot parse ${rel}: ${e.message}`)
    process.exit(1)
  }
  const paths = []
  collectPaths(json, paths)
  for (const p of paths) {
    const fsPath = join(publicDir, p)
    if (!existsSync(fsPath)) {
      missing.push(`${rel} → ${p} (missing ${fsPath})`)
    }
  }
}

if (missing.length) {
  console.error('✗ Missing assets referenced in src/data/*.json:')
  for (const m of missing) console.error('  -', m)
  console.error(`\nFix: add files under public/ (icons → public/icons/, projects → public/projects/, avatar → public/, og → public/)`)
  process.exit(1)
}

console.log(`✓ All ${files.length} JSON asset paths exist under public/`)

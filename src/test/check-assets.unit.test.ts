import { describe, expect, it } from 'vitest'
// .mjs import: collectPaths is dependency-free; the module main-guard keeps
// the CLI runner from executing on import (REQUIREMENTS v13).
import { collectPaths } from '../../scripts/check-assets.mjs'

describe('collectPaths', () => {
  it('collects /-rooted icon/image/avatar/ogImage, nested and in arrays', () => {
    const out: string[] = []
    collectPaths(
      {
        icon: '/icons/a.svg',
        label: 'nope',
        nested: { avatar: '/me.png', image: 'relative.png', ogImage: '/og.jpg' },
        list: [{ image: '/p/1.png' }, { image: '/p/2.png' }],
      },
      out,
    )
    expect(out).toEqual(['/icons/a.svg', '/me.png', '/og.jpg', '/p/1.png', '/p/2.png'])
  })

  it('ignores non-asset keys, non-strings, null and empty input', () => {
    const out: string[] = []
    collectPaths({ photo: '/x.png', icon: 42, image: null, deep: { deeper: [{ avatar: '/y.png' }] } }, out)
    expect(out).toEqual(['/y.png'])
    const empty: string[] = []
    collectPaths(null, empty)
    collectPaths('icon', empty)
    expect(empty).toEqual([])
  })
})

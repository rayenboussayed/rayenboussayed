import { describe, expect, it } from 'vitest'
import { looksDegenerate } from './guard'

describe('looksDegenerate', () => {
  it('flags empty and whitespace-only output', () => {
    expect(looksDegenerate('', 'Home')).toBe(true)
    expect(looksDegenerate('   ', 'Home')).toBe(true)
  })

  it('flags punctuation/symbol-only output (e.g. "About" -> ":")', () => {
    expect(looksDegenerate(':', 'About')).toBe(true)
    expect(looksDegenerate('!!!', 'About')).toBe(true)
  })

  it('flags runaway repetition (e.g. "Home" -> "البيت" x 200)', () => {
    const runaway = Array.from({ length: 200 }, () => 'البيت').join(' ')
    expect(looksDegenerate(runaway, 'Home')).toBe(true)
  })

  it('flags single-token spam (e.g. "Skills" -> "م م م م م م م م")', () => {
    expect(looksDegenerate('م م م م م م م م', 'Skills')).toBe(true)
  })

  it('flags CJK character collapse (e.g. "內容" repeated hundreds of times)', () => {
    expect(looksDegenerate('內容'.repeat(150), 'Home')).toBe(true)
    expect(looksDegenerate('啊'.repeat(80), 'Home')).toBe(true)
    expect(looksDegenerate('內容豐富的軟體工程專案與開源貢獻。', 'Rich in content projects')).toBe(false)
  })

  it('flags implausibly short output for the source (e.g. "Skills" -> "م")', () => {
    expect(looksDegenerate('م', 'Skills')).toBe(true)
    expect(looksDegenerate('अ', 'Experience')).toBe(true)
    expect(looksDegenerate('经验', 'Experience')).toBe(false)
    expect(looksDegenerate('Télécharger', 'Download')).toBe(false)
  })

  it('flags output wildly longer than the source', () => {
    expect(looksDegenerate('word '.repeat(40).trim(), 'Hi')).toBe(true)
  })

  it('accepts fluent short translations', () => {
    expect(looksDegenerate('Compétences', 'Skills')).toBe(false)
    expect(looksDegenerate('الخبرة', 'Experience')).toBe(false)
    expect(looksDegenerate('Télécharger', 'Download')).toBe(false)
  })

  it('accepts identical proper nouns', () => {
    expect(looksDegenerate('GitHub', 'GitHub')).toBe(false)
  })

  it('accepts fluent sentences', () => {
    expect(
      looksDegenerate(
        'Ingénieur de logiciel et créateur de contenu.',
        'Software engineer and content creator.',
      ),
    ).toBe(false)
  })

  it('accepts translations with naturally repeated tokens below the threshold', () => {
    expect(looksDegenerate('projets open source et projets from scratch', 'Open source and from-scratch projects')).toBe(false)
  })
})

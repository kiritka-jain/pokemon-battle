import { describe, expect, it } from 'vitest'

import { BOARD_ARENA_IDS } from '@/src/types/game'

import { getArenaFieldLineClass } from './arenaTheme'

describe('arena field-line colour', () => {
  it('returns a non-empty Tailwind text class for every arena', () => {
    for (const arena of BOARD_ARENA_IDS) {
      expect(getArenaFieldLineClass(arena)).toMatch(/text-/)
    }
  })

  it('includes both light and dark mode tokens for every arena', () => {
    for (const arena of BOARD_ARENA_IDS) {
      const cls = getArenaFieldLineClass(arena)
      expect(cls).toMatch(/(^|\s)text-[a-z]+-\d{2,3}\/\d{1,3}(\s|$)/)
      expect(cls).toMatch(/(^|\s)dark:text-[a-z]+-\d{2,3}\/\d{1,3}(\s|$)/)
    }
  })

  it('uses the grass field-line class for every arena input', () => {
    const classes = BOARD_ARENA_IDS.map((arena) => getArenaFieldLineClass(arena))
    const unique = new Set(classes)
    expect(unique.size).toBe(1)
    expect([...unique][0]).toBe('text-emerald-900/70 dark:text-emerald-200/55')
  })
})

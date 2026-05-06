import { afterEach, describe, expect, it, vi } from 'vitest'

import { BOARD_ARENA_IDS } from '@/src/types/game'

import { resolveArenaForMatch } from './arenaForMatch'

describe('resolveArenaForMatch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the same arena for the same non-local match id', () => {
    const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    expect(resolveArenaForMatch(id)).toBe(resolveArenaForMatch(id))
  })

  it('always resolves to grass for any match id', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    expect(resolveArenaForMatch('m1')).toBe('grass')
    expect(resolveArenaForMatch('some-other-match')).toBe('grass')
    expect(resolveArenaForMatch('')).toBe('grass')
    expect(resolveArenaForMatch('local-dev-match')).toBe(BOARD_ARENA_IDS[0])
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

import { LOCAL_AI_PRACTICE_MATCH_ID } from '@/src/lib/match/localAiPracticeMatchId'
import { LOCAL_DEV_MATCH_ID } from '@/src/lib/match/localDevMatchId'
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

  it('maps local dev match id using Math.random index', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(resolveArenaForMatch(LOCAL_DEV_MATCH_ID)).toBe(BOARD_ARENA_IDS[0])
  })

  it('uses last arena when random approaches 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    expect(resolveArenaForMatch(LOCAL_DEV_MATCH_ID)).toBe(BOARD_ARENA_IDS[BOARD_ARENA_IDS.length - 1])
  })

  it('maps local AI practice match id using Math.random index like local dev', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(resolveArenaForMatch(LOCAL_AI_PRACTICE_MATCH_ID)).toBe(BOARD_ARENA_IDS[0])
  })
})

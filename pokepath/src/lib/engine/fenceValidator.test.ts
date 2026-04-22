import { describe, expect, it } from 'vitest'

import type { Fence, GameState } from '@/src/types/game'

import { getFenceId } from './boardUtils'
import { FENCE_TRAP_OPPONENT_CODE, validateFencePlacement } from './fenceValidator'

const fence = (partial: Omit<Fence, 'placedBy'> & { placedBy?: Fence['placedBy'] }): Fence => ({
  placedBy: 'player1',
  ...partial,
})

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    matchId: 'm1',
    status: 'active',
    turn: 'player1',
    arena: 'grass',
    players: {
      player1: { id: 'a', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
      player2: { id: 'b', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
    },
    fences: [],
    pendingAction: { type: null },
    winner: null,
    error: null,
    errorCode: null,
    ...overrides,
  }
}

/** Nearly full horizontal barrier at row boundary `fy` with one missing anchor so P1 can pass */
function wallWithGapAt4(fy: number): Fence[] {
  const anchors = [0, 2, 6, 7] as const
  return anchors.map((x) =>
    fence({
      id: getFenceId(x, fy, 'H'),
      x,
      y: fy,
      orientation: 'H',
    })
  )
}

describe('validateFencePlacement', () => {
  it('accepts a legal fence on an empty board', () => {
    const s = baseState()
    expect(validateFencePlacement('player1', 3, 3, 'H', s)).toEqual({ valid: true })
  })

  it('rejects anchor x out of fence bounds', () => {
    const s = baseState()
    expect(validateFencePlacement('player1', 8, 3, 'H', s)).toEqual({
      valid: false,
      reason: 'Out of bounds',
    })
  })

  it('rejects when the player has no fences left', () => {
    const s = baseState({
      players: {
        player1: { id: 'a', pos: { x: 4, y: 8 }, fencesLeft: 0, type: 'Normal' },
        player2: { id: 'b', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
    })
    expect(validateFencePlacement('player1', 2, 2, 'V', s)).toEqual({
      valid: false,
      reason: 'No fences remaining',
    })
  })

  it('rejects an exact duplicate fence', () => {
    const s = baseState({
      fences: [
        fence({
          id: getFenceId(2, 2, 'H'),
          x: 2,
          y: 2,
          orientation: 'H',
        }),
      ],
    })
    expect(validateFencePlacement('player1', 2, 2, 'H', s)).toEqual({
      valid: false,
      reason: 'Duplicate fence',
    })
  })

  it('rejects horizontally overlapping fences', () => {
    const s = baseState({
      fences: [
        fence({
          id: getFenceId(2, 3, 'H'),
          x: 2,
          y: 3,
          orientation: 'H',
        }),
      ],
    })
    expect(validateFencePlacement('player1', 3, 3, 'H', s)).toEqual({
      valid: false,
      reason: 'Overlapping fences',
    })
  })

  it('rejects crossing an existing perpendicular fence at the same anchor', () => {
    const s = baseState({
      fences: [
        fence({
          id: getFenceId(4, 4, 'V'),
          x: 4,
          y: 4,
          orientation: 'V',
        }),
      ],
    })
    expect(validateFencePlacement('player1', 4, 4, 'H', s)).toEqual({
      valid: false,
      reason: 'Fences would cross',
    })
  })

  it('rejects placement that would seal the last gap and block Player 1', () => {
    const s = baseState({
      fences: wallWithGapAt4(6),
    })
    expect(validateFencePlacement('player1', 4, 6, 'H', s)).toEqual({
      valid: false,
      code: FENCE_TRAP_OPPONENT_CODE,
      reason: "Would block Player 1's path",
    })
  })

  it('accepts a fence that still leaves paths for both players', () => {
    const s = baseState()
    expect(validateFencePlacement('player1', 1, 4, 'H', s)).toEqual({ valid: true })
  })
})

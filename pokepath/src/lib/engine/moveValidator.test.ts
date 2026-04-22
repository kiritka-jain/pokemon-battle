import { describe, expect, it } from 'vitest'

import type { Fence, GameState } from '@/src/types/game'

import { getFenceId } from './boardUtils'
import { validateMove } from './moveValidator'

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

describe('validateMove', () => {
  it('allows a simple move up on an open board', () => {
    const s = baseState()
    expect(validateMove('player1', { x: 4, y: 7 }, s)).toEqual({ valid: true })
  })

  it('rejects a simple move blocked by a fence', () => {
    const s = baseState({
      fences: [
        fence({
          id: getFenceId(4, 7, 'H'),
          x: 4,
          y: 7,
          orientation: 'H',
        }),
      ],
    })
    expect(validateMove('player1', { x: 4, y: 7 }, s)).toEqual({
      valid: false,
      reason: 'Blocked by fence',
    })
  })

  it('rejects a target out of bounds', () => {
    const s = baseState()
    expect(validateMove('player1', { x: 4, y: -1 }, s)).toEqual({
      valid: false,
      reason: 'Out of bounds',
    })
  })

  it('rejects when it is not that player turn', () => {
    const s = baseState()
    expect(validateMove('player2', { x: 4, y: 1 }, s)).toEqual({
      valid: false,
      reason: 'Not your turn',
    })
  })

  it('allows a straight jump over the opponent', () => {
    const s = baseState({
      players: {
        player1: { id: 'a', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'b', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
      },
    })
    expect(validateMove('player1', { x: 4, y: 6 }, s)).toEqual({ valid: true })
  })

  it('when straight jump is blocked by a fence, allows diagonal dodge', () => {
    const s = baseState({
      players: {
        player1: { id: 'a', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'b', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
      },
      fences: [
        fence({
          id: getFenceId(4, 6, 'H'),
          x: 4,
          y: 6,
          orientation: 'H',
        }),
      ],
    })
    expect(validateMove('player1', { x: 3, y: 7 }, s)).toEqual({ valid: true })
    expect(validateMove('player1', { x: 5, y: 7 }, s)).toEqual({ valid: true })
  })

  it('rejects diagonal dodge when straight jump behind opponent is still open', () => {
    const s = baseState({
      players: {
        player1: { id: 'a', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'b', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
      },
    })
    expect(validateMove('player1', { x: 3, y: 7 }, s)).toEqual({
      valid: false,
      reason: 'Invalid move distance',
    })
  })

  it('rejects moving to the same tile', () => {
    const s = baseState()
    expect(validateMove('player1', { x: 4, y: 8 }, s)).toEqual({
      valid: false,
      reason: 'Invalid move distance',
    })
  })

  it('rejects moving three tiles away', () => {
    const s = baseState()
    expect(validateMove('player1', { x: 4, y: 5 }, s)).toEqual({
      valid: false,
      reason: 'Invalid move distance',
    })
  })

  it('rejects a single orthogonal step onto the opponent square', () => {
    const s = baseState({
      players: {
        player1: { id: 'a', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'b', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
      },
    })
    expect(validateMove('player1', { x: 4, y: 7 }, s)).toEqual({
      valid: false,
      reason: 'Invalid move distance',
    })
  })
})

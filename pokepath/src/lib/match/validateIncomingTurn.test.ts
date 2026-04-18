import { describe, expect, it } from 'vitest'

import { initialGameState } from '@/src/lib/store/gameStore'

import { playerKeyForUserId, validateIncomingTurn } from './validateIncomingTurn'

describe('playerKeyForUserId', () => {
  const base = {
    ...initialGameState,
    status: 'active' as const,
    turn: 'player1' as const,
    matchId: 'm',
    players: {
      player1: {
        id: 'a',
        pos: { x: 4, y: 8 },
        fencesLeft: 10,
        type: 'Normal',
      },
      player2: {
        id: 'b',
        pos: { x: 4, y: 0 },
        fencesLeft: 10,
        type: 'Normal',
      },
    },
    fences: [],
    pendingAction: { type: null },
    winner: null,
    error: null,
  }

  it('returns player1 or player2 for matching ids', () => {
    expect(playerKeyForUserId(base, 'a')).toBe('player1')
    expect(playerKeyForUserId(base, 'b')).toBe('player2')
  })

  it('returns null for unknown id', () => {
    expect(playerKeyForUserId(base, 'c')).toBeNull()
  })
})

describe('validateIncomingTurn', () => {
  it('rejects when action type is null', () => {
    const gs = {
      ...initialGameState,
      status: 'active' as const,
      turn: 'player1' as const,
      matchId: 'm',
      players: {
        player1: {
          id: 'a',
          pos: { x: 4, y: 8 },
          fencesLeft: 10,
          type: 'Normal',
        },
        player2: {
          id: 'b',
          pos: { x: 4, y: 0 },
          fencesLeft: 10,
          type: 'Normal',
        },
      },
      fences: [],
      pendingAction: { type: null },
      winner: null,
      error: null,
    }
    expect(validateIncomingTurn(gs, { type: null }, 'player1')).toBe(false)
  })

  it('accepts a legal opening move for player1', () => {
    const gs = {
      ...initialGameState,
      status: 'active' as const,
      turn: 'player1' as const,
      matchId: 'm',
      players: {
        player1: {
          id: 'a',
          pos: { x: 4, y: 8 },
          fencesLeft: 10,
          type: 'Normal',
        },
        player2: {
          id: 'b',
          pos: { x: 4, y: 0 },
          fencesLeft: 10,
          type: 'Normal',
        },
      },
      fences: [],
      pendingAction: { type: null },
      winner: null,
      error: null,
    }
    expect(
      validateIncomingTurn(gs, { type: 'move', targetPos: { x: 4, y: 7 } }, 'player1'),
    ).toBe(true)
  })
})

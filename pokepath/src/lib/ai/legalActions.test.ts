import { describe, expect, it } from 'vitest'

import type { GameState } from '@/src/types/game'

import { allLegalPendingActions, listLegalFences, listLegalMoves } from './legalActions'

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    matchId: 'test',
    status: 'active',
    turn: 'player2',
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

describe('legalActions', () => {
  it('lists at least one legal move for P2 opening', () => {
    const moves = listLegalMoves(baseState(), 'player2')
    expect(moves.some((p) => p.x === 4 && p.y === 1)).toBe(true)
  })

  it('lists no moves when it is not that player turn', () => {
    const moves = listLegalMoves(baseState({ turn: 'player1' }), 'player2')
    expect(moves).toEqual([])
  })

  it('lists many legal fences on empty board for active player', () => {
    const fences = listLegalFences(baseState(), 'player2')
    expect(fences.length).toBeGreaterThan(50)
  })

  it('allLegalPendingActions merges moves and fences', () => {
    const all = allLegalPendingActions(baseState(), 'player2')
    expect(all.some((a) => a.type === 'move')).toBe(true)
    expect(all.some((a) => a.type === 'fence')).toBe(true)
  })
})

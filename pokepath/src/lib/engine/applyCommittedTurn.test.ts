import { describe, expect, it } from 'vitest'

import { getFenceId } from '@/src/lib/engine/boardUtils'
import type { Fence, GameState } from '@/src/types/game'

import { applyCommittedTurn } from './applyCommittedTurn'

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

describe('applyCommittedTurn', () => {
  it('applies a legal move and toggles turn', () => {
    const res = applyCommittedTurn(baseState(), 'player1', {
      type: 'move',
      targetPos: { x: 4, y: 7 },
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.next.players.player1.pos).toEqual({ x: 4, y: 7 })
    expect(res.next.turn).toBe('player2')
    expect(res.next.pendingAction).toEqual({ type: null })
  })

  it('marks winner and finished status on goal row move', () => {
    const state = baseState({
      players: {
        player1: { id: 'a', pos: { x: 4, y: 1 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'b', pos: { x: 0, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
    })
    const res = applyCommittedTurn(state, 'player1', {
      type: 'move',
      targetPos: { x: 4, y: 0 },
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.next.status).toBe('finished')
    expect(res.next.winner).toBe('player1')
  })

  it('rejects if actor is not current turn', () => {
    const res = applyCommittedTurn(baseState(), 'player2', {
      type: 'move',
      targetPos: { x: 4, y: 7 },
    })
    expect(res).toEqual({
      ok: false,
      reason: 'Not actor turn',
    })
  })

  it('returns trap code when fence blocks all opponent paths', () => {
    const state = baseState({
      fences: [
        fence({ id: getFenceId(0, 6, 'H'), x: 0, y: 6, orientation: 'H' }),
        fence({ id: getFenceId(2, 6, 'H'), x: 2, y: 6, orientation: 'H' }),
        fence({ id: getFenceId(6, 6, 'H'), x: 6, y: 6, orientation: 'H' }),
        fence({ id: getFenceId(7, 6, 'H'), x: 7, y: 6, orientation: 'H' }),
      ],
    })
    const res = applyCommittedTurn(state, 'player1', {
      type: 'fence',
      targetFence: { x: 4, y: 6, orientation: 'H' },
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.errorCode).toBe('TRAP_OPPONENT')
    expect(res.reason.toLowerCase()).toContain('block')
  })
})

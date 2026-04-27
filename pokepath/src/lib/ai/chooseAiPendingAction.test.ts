import { describe, expect, it } from 'vitest'

import { validateFencePlacement } from '@/src/lib/engine/fenceValidator'
import { validateMove } from '@/src/lib/engine/moveValidator'
import type { GameState } from '@/src/types/game'

import { chooseAiPendingAction, type AiDifficulty } from './chooseAiPendingAction'

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

function assertActionValid(state: GameState, action: ReturnType<typeof chooseAiPendingAction>) {
  if (action.type === 'move' && action.targetPos) {
    expect(validateMove('player2', action.targetPos, state).valid).toBe(true)
  } else if (action.type === 'fence' && action.targetFence) {
    const { x, y, orientation } = action.targetFence
    expect(validateFencePlacement('player2', x, y, orientation, state).valid).toBe(true)
  } else {
    throw new Error('invalid action shape')
  }
}

describe('chooseAiPendingAction', () => {
  const difficulties: AiDifficulty[] = ['beginner', 'normal', 'hard']
  it.each(difficulties)('%s returns a legal pending action on P2 opening', (difficulty) => {
    const state = baseState()
    const action = chooseAiPendingAction(state, 'player2', difficulty, {
      random: () => 0.5,
    })
    assertActionValid(state, action)
  })

  it('beginner with high random skips fence branch and picks a move', () => {
    const state = baseState()
    const action = chooseAiPendingAction(state, 'player2', 'beginner', {
      random: () => 0.99,
    })
    expect(action.type).toBe('move')
    assertActionValid(state, action)
  })
})

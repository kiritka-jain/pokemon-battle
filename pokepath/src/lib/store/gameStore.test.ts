import { beforeEach, describe, expect, it } from 'vitest'

import { initialGameState, useGameStore } from './gameStore'

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.setState(initialGameState)
  })

  it('starts with ticket default initial state', () => {
    const s = useGameStore.getState()
    expect(s.matchId).toBeNull()
    expect(s.status).toBe('waiting')
    expect(s.turn).toBe('player1')
    expect(s.players.player1).toEqual({
      id: '',
      pos: { x: 4, y: 8 },
      fencesLeft: 10,
      type: 'Normal',
    })
    expect(s.players.player2).toEqual({
      id: '',
      pos: { x: 4, y: 0 },
      fencesLeft: 10,
      type: 'Normal',
    })
    expect(s.fences).toEqual([])
    expect(s.pendingAction).toEqual({ type: null })
    expect(s.winner).toBeNull()
  })

  it('initMatch → setPendingAction(move) → commitAction toggles turn and clears pending', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')

    let s = useGameStore.getState()
    expect(s.matchId).toBe('m1')
    expect(s.status).toBe('active')
    expect(s.turn).toBe('player1')
    expect(s.players.player1.id).toBe('uuid-a')
    expect(s.players.player2.id).toBe('uuid-b')

    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 7 },
    })
    s = useGameStore.getState()
    expect(s.pendingAction.type).toBe('move')

    useGameStore.getState().commitAction()
    s = useGameStore.getState()
    expect(s.turn).toBe('player2')
    expect(s.pendingAction).toEqual({ type: null })
  })
})

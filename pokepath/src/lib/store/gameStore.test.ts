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
    expect(s.error).toBeNull()
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
    expect(s.error).toBeNull()
    expect(s.players.player1.pos).toEqual({ x: 4, y: 7 })
  })

  it('commitAction on invalid move sets error and keeps state', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')
    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 5 },
    })
    useGameStore.getState().commitAction()
    const s = useGameStore.getState()
    expect(s.error).toBe('Invalid move distance')
    expect(s.turn).toBe('player1')
    expect(s.players.player1.pos).toEqual({ x: 4, y: 8 })
  })

  it('commitAction: move then fence updates positions, fences, and turns', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')

    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 7 },
    })
    useGameStore.getState().commitAction()
    expect(useGameStore.getState().turn).toBe('player2')

    useGameStore.getState().setPendingAction({
      type: 'fence',
      targetFence: { x: 2, y: 3, orientation: 'H' },
    })
    useGameStore.getState().commitAction()

    const s = useGameStore.getState()
    expect(s.turn).toBe('player1')
    expect(s.players.player2.fencesLeft).toBe(9)
    expect(s.fences).toHaveLength(1)
    expect(s.fences[0]).toMatchObject({
      x: 2,
      y: 3,
      orientation: 'H',
      placedBy: 'player2',
    })
    expect(s.error).toBeNull()
  })

  it('commitAction: winning move sets winner and status finished', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')
    useGameStore.setState({
      players: {
        player1: {
          id: 'uuid-a',
          pos: { x: 4, y: 1 },
          fencesLeft: 10,
          type: 'Normal',
        },
        player2: {
          id: 'uuid-b',
          pos: { x: 0, y: 0 },
          fencesLeft: 10,
          type: 'Normal',
        },
      },
    })

    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 0 },
    })
    useGameStore.getState().commitAction()

    const s = useGameStore.getState()
    expect(s.winner).toBe('player1')
    expect(s.status).toBe('finished')
    expect(s.turn).toBe('player1')
  })
})

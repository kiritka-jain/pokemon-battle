import { beforeEach, describe, expect, it } from 'vitest'

import { getFenceId } from '@/src/lib/engine/boardUtils'
import type { Fence } from '@/src/types/game'

import { initialGameState, LOCAL_DEV_MATCH_ID, useGameStore } from './gameStore'

const fence = (partial: Omit<Fence, 'placedBy'> & { placedBy?: Fence['placedBy'] }): Fence => ({
  placedBy: 'player1',
  ...partial,
})

/** Nearly full horizontal barrier at row `fy` with gap at column 4 (same shape as fenceValidator tests). */
function wallWithGapAt4(fy: number): Fence[] {
  const anchors = [0, 2, 6, 7] as const
  return anchors.map((x) =>
    fence({
      id: getFenceId(x, fy, 'H'),
      x,
      y: fy,
      orientation: 'H',
    }),
  )
}

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
    expect(s.errorCode).toBeNull()
  })

  it('initMatch → setPendingAction(move) → commitAction toggles turn and clears pending', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')

    let s = useGameStore.getState()
    expect(s.matchId).toBe('m1')
    expect(s.status).toBe('active')
    expect(s.turn).toBe('player1')
    expect(s.players.player1.id).toBe('uuid-a')
    expect(s.players.player2.id).toBe('uuid-b')
    expect(s.players.player1.username).toBe('Trainer_uuida')
    expect(s.players.player2.username).toBe('Trainer_uuidb')

    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 7 },
    })
    s = useGameStore.getState()
    expect(s.pendingAction.type).toBe('move')

    useGameStore.getState().commitAction({ actingUserId: 'uuid-a' })
    s = useGameStore.getState()
    expect(s.turn).toBe('player2')
    expect(s.pendingAction).toEqual({ type: null })
    expect(s.error).toBeNull()
    expect(s.errorCode).toBeNull()
    expect(s.players.player1.pos).toEqual({ x: 4, y: 7 })
  })

  it('initMatch uses provided display usernames when set', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b', {
      player1Username: 'RedRival',
      player2Username: 'BlueRival',
    })
    const s = useGameStore.getState()
    expect(s.players.player1.username).toBe('RedRival')
    expect(s.players.player2.username).toBe('BlueRival')
  })

  it('commitAction on invalid move sets error and keeps state', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')
    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 5 },
    })
    useGameStore.getState().commitAction({ actingUserId: 'uuid-a' })
    const s = useGameStore.getState()
    expect(s.error).toBe('Invalid move distance')
    expect(s.errorCode).toBeNull()
    expect(s.turn).toBe('player1')
    expect(s.players.player1.pos).toEqual({ x: 4, y: 8 })
  })

  it('commitAction on path-blocking fence sets TRAP_OPPONENT without inline error string', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')
    useGameStore.setState({
      fences: wallWithGapAt4(6),
    })
    useGameStore.getState().setPendingAction({
      type: 'fence',
      targetFence: { x: 4, y: 6, orientation: 'H' },
    })
    useGameStore.getState().commitAction({ actingUserId: 'uuid-a' })
    const s = useGameStore.getState()
    expect(s.error).toBeNull()
    expect(s.errorCode).toBe('TRAP_OPPONENT')
    expect(s.fences).toHaveLength(4)
    expect(s.players.player1.fencesLeft).toBe(10)
  })

  it('commitAction: move then fence updates positions, fences, and turns', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')

    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 7 },
    })
    useGameStore.getState().commitAction({ actingUserId: 'uuid-a' })
    expect(useGameStore.getState().turn).toBe('player2')

    useGameStore.getState().setPendingAction({
      type: 'fence',
      targetFence: { x: 2, y: 3, orientation: 'H' },
    })
    useGameStore.getState().commitAction({ actingUserId: 'uuid-b' })

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
    expect(s.errorCode).toBeNull()
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
    useGameStore.getState().commitAction({ actingUserId: 'uuid-a' })

    const s = useGameStore.getState()
    expect(s.winner).toBe('player1')
    expect(s.status).toBe('finished')
    expect(s.turn).toBe('player1')
  })

  it('commitAction rejects wrong actingUserId with no state change', () => {
    useGameStore.getState().initMatch('m1', 'uuid-a', 'uuid-b')
    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 7 },
    })
    useGameStore.getState().commitAction({ actingUserId: 'uuid-b' })
    const s = useGameStore.getState()
    expect(s.error).toBe('Not your turn')
    expect(s.turn).toBe('player1')
    expect(s.players.player1.pos).toEqual({ x: 4, y: 8 })
    expect(s.pendingAction.type).toBe('move')
  })

  it('commitAction skips actingUserId check for local-dev match id', () => {
    useGameStore.getState().initMatch(LOCAL_DEV_MATCH_ID, 'p1', 'p2')
    useGameStore.getState().setPendingAction({
      type: 'move',
      targetPos: { x: 4, y: 7 },
    })
    useGameStore.getState().commitAction({ actingUserId: 'someone-else' })
    const s = useGameStore.getState()
    expect(s.error).toBeNull()
    expect(s.turn).toBe('player2')
    expect(s.players.player1.pos).toEqual({ x: 4, y: 7 })
  })
})

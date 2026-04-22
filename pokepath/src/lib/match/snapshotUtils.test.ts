import { describe, expect, it } from 'vitest'

import type { GameState } from '@/src/types/game'

import { normalizedTurnSnapshotJson, pickTurnSnapshot } from './snapshotUtils'

function stateWithDisplay(): GameState {
  return {
    matchId: 'm1',
    status: 'active',
    turn: 'player1',
    players: {
      player1: {
        id: 'p1',
        pos: { x: 4, y: 8 },
        fencesLeft: 10,
        type: 'Normal',
        username: 'Ash',
        elo: 1500,
      },
      player2: {
        id: 'p2',
        pos: { x: 4, y: 0 },
        fencesLeft: 9,
        type: 'Normal',
        username: 'Misty',
        elo: 1450,
      },
    },
    fences: [{ id: 'h-3-3', x: 3, y: 3, orientation: 'H', placedBy: 'player1' }],
    pendingAction: { type: 'move', targetPos: { x: 4, y: 7 } },
    winner: null,
    error: null,
    errorCode: null,
  }
}

describe('snapshotUtils', () => {
  it('pickTurnSnapshot returns a detached clone', () => {
    const original = stateWithDisplay()
    const snapshot = pickTurnSnapshot(original)

    original.players.player1.pos.y = 7
    original.fences[0].x = 1

    expect(snapshot.players.player1.pos.y).toBe(8)
    expect(snapshot.fences[0].x).toBe(3)
  })

  it('normalizedTurnSnapshotJson ignores username and elo fields', () => {
    const a = stateWithDisplay()
    const b = stateWithDisplay()
    b.players.player1.username = 'DifferentName'
    b.players.player1.elo = 9999
    b.players.player2.username = 'SomeoneElse'
    b.players.player2.elo = 1200

    const normA = normalizedTurnSnapshotJson(pickTurnSnapshot(a))
    const normB = normalizedTurnSnapshotJson(pickTurnSnapshot(b))
    expect(normA).toBe(normB)
  })
})

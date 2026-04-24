import { describe, expect, it } from 'vitest'

import { resolveArenaForMatch } from '@/src/lib/board/arenaForMatch'

import { parsePersistedMatchState } from './parsePersistedMatchState'

const match = {
  id: 'm1',
  player1_id: 'p1',
  player2_id: 'p2',
}

describe('parsePersistedMatchState', () => {
  it('parses a valid persisted state payload', () => {
    const raw = {
      turn: 'player2',
      status: 'active',
      players: {
        player1: { id: 'p1', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'p2', pos: { x: 4, y: 1 }, fencesLeft: 9, type: 'Normal' },
      },
      fences: [{ id: 'h-3-3', x: 3, y: 3, orientation: 'H', placedBy: 'player1' }],
      pendingAction: { type: null },
      winner: null,
    }

    const parsed = parsePersistedMatchState(raw, match)
    expect(parsed).not.toBeNull()
    expect(parsed?.matchId).toBe('m1')
    expect(parsed?.turn).toBe('player2')
    expect(parsed?.arena).toBe(resolveArenaForMatch('m1'))
    expect(parsed?.players.player2.fencesLeft).toBe(9)
    expect(parsed?.fences).toHaveLength(1)
  })

  it('reads persisted arena when valid', () => {
    const raw = {
      turn: 'player1',
      arena: 'water',
      players: {
        player1: { id: 'p1', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'p2', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
    }
    expect(parsePersistedMatchState(raw, match)?.arena).toBe('water')
  })

  it('falls back to resolveArenaForMatch when arena is invalid', () => {
    const raw = {
      turn: 'player1',
      arena: 'not-an-arena',
      players: {
        player1: { id: 'p1', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'p2', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
    }
    expect(parsePersistedMatchState(raw, match)?.arena).toBe(resolveArenaForMatch('m1'))
  })

  it('returns null when persisted player ids do not match match row', () => {
    const raw = {
      turn: 'player1',
      players: {
        player1: { id: 'other', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'p2', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
    }
    expect(parsePersistedMatchState(raw, match)).toBeNull()
  })

  it('parses valid pawnSpeciesId when present on players', () => {
    const raw = {
      turn: 'player1',
      players: {
        player1: {
          id: 'p1',
          pos: { x: 4, y: 8 },
          fencesLeft: 10,
          type: 'Normal',
          pawnSpeciesId: 'charmander',
        },
        player2: {
          id: 'p2',
          pos: { x: 4, y: 0 },
          fencesLeft: 10,
          type: 'Normal',
          pawnSpeciesId: 'pikachu',
        },
      },
    }
    const parsed = parsePersistedMatchState(raw, match)
    expect(parsed?.players.player1.pawnSpeciesId).toBe('charmander')
    expect(parsed?.players.player2.pawnSpeciesId).toBe('pikachu')
  })

  it('omits invalid pawnSpeciesId from persisted payload', () => {
    const raw = {
      turn: 'player1',
      players: {
        player1: {
          id: 'p1',
          pos: { x: 4, y: 8 },
          fencesLeft: 10,
          type: 'Normal',
          pawnSpeciesId: 'fake-mon',
        },
        player2: { id: 'p2', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
    }
    const parsed = parsePersistedMatchState(raw, match)
    expect(parsed?.players.player1.pawnSpeciesId).toBeUndefined()
  })

  it('defaults status and pending action when optional fields are malformed', () => {
    const raw = {
      turn: 'player1',
      status: 'weird-value',
      players: {
        player1: { id: 'p1', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'p2', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
      pendingAction: { type: 'nonsense' },
    }
    const parsed = parsePersistedMatchState(raw, match)
    expect(parsed).not.toBeNull()
    expect(parsed?.status).toBe('active')
    expect(parsed?.pendingAction).toEqual({ type: null })
  })
})

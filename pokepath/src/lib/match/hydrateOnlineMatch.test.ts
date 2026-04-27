import { beforeEach, describe, expect, it } from 'vitest'

import { resolveArenaForMatch } from '@/src/lib/board/arenaForMatch'

import { hydrateOnlineMatchFromRow } from './hydrateOnlineMatch'
import { initialGameState, useGameStore } from '@/src/lib/store/gameStore'

describe('hydrateOnlineMatchFromRow', () => {
  beforeEach(() => {
    useGameStore.setState(initialGameState)
  })

  it('preserves prior board Pokemon species id when persisted JSON omits it for the same user id', () => {
    const matchId = 'match-hydrate-1'
    const p1Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    const p2Id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

    useGameStore.getState().initMatch(matchId, p1Id, p2Id, {})
    useGameStore.getState().setPokemonSpecies('player1', 'charmander')

    const gameState = {
      turn: 'player1' as const,
      status: 'active' as const,
      arena: resolveArenaForMatch(matchId),
      players: {
        player1: { id: p1Id, pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: p2Id, pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
      fences: [],
      pendingAction: { type: null },
      winner: null,
    }

    hydrateOnlineMatchFromRow({
      matchId,
      player1Id: p1Id,
      player2Id: p2Id,
      gameState,
      display: {},
    })

    expect(useGameStore.getState().players.player1.pawnSpeciesId).toBe('charmander')
    expect(useGameStore.getState().players.player2.pawnSpeciesId).toBeUndefined()
  })

  it('uses DB board Pokemon species when present over stale prior value', () => {
    const matchId = 'match-hydrate-2'
    const p1Id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
    const p2Id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'

    useGameStore.getState().initMatch(matchId, p1Id, p2Id, {})
    useGameStore.getState().setPokemonSpecies('player1', 'oddish')

    const gameState = {
      turn: 'player1' as const,
      status: 'active' as const,
      arena: resolveArenaForMatch(matchId),
      players: {
        player1: {
          id: p1Id,
          pos: { x: 4, y: 8 },
          fencesLeft: 10,
          type: 'Normal',
          pawnSpeciesId: 'pikachu',
        },
        player2: { id: p2Id, pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
      fences: [],
      pendingAction: { type: null },
      winner: null,
    }

    hydrateOnlineMatchFromRow({
      matchId,
      player1Id: p1Id,
      player2Id: p2Id,
      gameState,
      display: {},
    })

    expect(useGameStore.getState().players.player1.pawnSpeciesId).toBe('pikachu')
  })

  it('does not carry prior board Pokemon when seat user id changed', () => {
    const matchId = 'match-hydrate-3'
    const oldP1 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
    const p2Id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'

    useGameStore.getState().initMatch(matchId, oldP1, p2Id, {})
    useGameStore.getState().setPokemonSpecies('player1', 'charmander')

    const newP1 = '99999999-9999-9999-9999-999999999999'
    const gameState = {
      turn: 'player1' as const,
      status: 'active' as const,
      arena: resolveArenaForMatch(matchId),
      players: {
        player1: { id: newP1, pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: p2Id, pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
      fences: [],
      pendingAction: { type: null },
      winner: null,
    }

    hydrateOnlineMatchFromRow({
      matchId,
      player1Id: newP1,
      player2Id: p2Id,
      gameState,
      display: {},
    })

    expect(useGameStore.getState().players.player1.pawnSpeciesId).toBeUndefined()
  })

  it('does not carry prior board Pokemon when hydrating a different match id', () => {
    const oldMatchId = 'match-old-aaaa'
    const newMatchId = 'match-new-bbbb'
    const p1Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    const p2Id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

    useGameStore.getState().initMatch(oldMatchId, p1Id, p2Id, {})
    useGameStore.getState().setPokemonSpecies('player1', 'charmander')

    const gameState = {
      turn: 'player1' as const,
      status: 'active' as const,
      arena: resolveArenaForMatch(newMatchId),
      players: {
        player1: { id: p1Id, pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: p2Id, pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
      },
      fences: [],
      pendingAction: { type: null },
      winner: null,
    }

    hydrateOnlineMatchFromRow({
      matchId: newMatchId,
      player1Id: p1Id,
      player2Id: p2Id,
      gameState,
      display: {},
    })

    expect(useGameStore.getState().matchId).toBe(newMatchId)
    expect(useGameStore.getState().players.player1.pawnSpeciesId).toBeUndefined()
  })
})

import { describe, expect, it } from 'vitest'

import { resolveArenaForMatch } from '@/src/lib/board/arenaForMatch'
import type { GameState } from '@/src/types/game'

import { mergeBoardPokemonAfterCommit } from './mergeBoardPokemonAfterCommit'

const arena = resolveArenaForMatch('m1')

function baseState(p2PokemonSpecies?: string): GameState {
  return {
    matchId: 'm1',
    status: 'active',
    turn: 'player1',
    arena,
    players: {
      player1: {
        id: 'p1',
        pos: { x: 4, y: 8 },
        fencesLeft: 10,
        type: 'Normal',
      },
      player2: {
        id: 'p2',
        pos: { x: 4, y: 0 },
        fencesLeft: 10,
        type: 'Normal',
        ...(p2PokemonSpecies ? { pawnSpeciesId: p2PokemonSpecies } : {}),
      },
    },
    fences: [],
    pendingAction: { type: null },
    winner: null,
    error: null,
    errorCode: null,
  }
}

describe('mergeBoardPokemonAfterCommit', () => {
  it('takes actor board Pokemon species from newState when valid', () => {
    const base = baseState()
    const appliedNext: GameState = {
      ...base,
      turn: 'player2',
      players: {
        player1: { ...base.players.player1, pos: { x: 4, y: 7 } },
        player2: { ...base.players.player2 },
      },
    }
    const newState = {
      players: {
        player1: {
          ...appliedNext.players.player1,
          pawnSpeciesId: 'charmander',
        },
        player2: { ...appliedNext.players.player2 },
      },
    }
    const merged = mergeBoardPokemonAfterCommit(appliedNext, newState, base, 'player1')
    expect(merged.players.player1.pawnSpeciesId).toBe('charmander')
    expect(merged.players.player2.pawnSpeciesId).toBeUndefined()
  })

  it('keeps opponent board Pokemon from base, ignoring forged value in newState', () => {
    const base = baseState('pikachu')
    const appliedNext: GameState = {
      ...base,
      turn: 'player2',
      players: {
        player1: { ...base.players.player1, pos: { x: 4, y: 7 } },
        player2: { ...base.players.player2 },
      },
    }
    const newState = {
      players: {
        player1: { ...appliedNext.players.player1, pawnSpeciesId: 'Bulbasaur' },
        player2: {
          ...appliedNext.players.player2,
          pawnSpeciesId: 'charmander',
        },
      },
    }
    const merged = mergeBoardPokemonAfterCommit(appliedNext, newState, base, 'player1')
    expect(merged.players.player1.pawnSpeciesId).toBe('Bulbasaur')
    expect(merged.players.player2.pawnSpeciesId).toBe('pikachu')
  })

  it('drops invalid actor species id from newState and falls back to base', () => {
    const base = baseState()
    const baseWithBoardPokemon: GameState = {
      ...base,
      players: {
        player1: { ...base.players.player1, pawnSpeciesId: 'oddish' },
        player2: { ...base.players.player2 },
      },
    }
    const appliedNext: GameState = {
      ...baseWithBoardPokemon,
      turn: 'player2',
      players: {
        player1: { ...baseWithBoardPokemon.players.player1, pos: { x: 4, y: 7 } },
        player2: { ...baseWithBoardPokemon.players.player2 },
      },
    }
    const newState = {
      players: {
        player1: {
          ...appliedNext.players.player1,
          pawnSpeciesId: 'not-a-real-starter',
        },
        player2: { ...appliedNext.players.player2 },
      },
    }
    const merged = mergeBoardPokemonAfterCommit(appliedNext, newState, baseWithBoardPokemon, 'player1')
    expect(merged.players.player1.pawnSpeciesId).toBe('oddish')
  })

  it('fills opponent board Pokemon from newState when base has none', () => {
    const base = baseState()
    const appliedNext: GameState = {
      ...base,
      turn: 'player2',
      players: {
        player1: { ...base.players.player1, pos: { x: 4, y: 7 } },
        player2: { ...base.players.player2 },
      },
    }
    const newState = {
      players: {
        player1: {
          ...appliedNext.players.player1,
          pawnSpeciesId: 'charmander',
        },
        player2: {
          ...appliedNext.players.player2,
          pawnSpeciesId: 'pikachu',
        },
      },
    }
    const merged = mergeBoardPokemonAfterCommit(appliedNext, newState, base, 'player1')
    expect(merged.players.player1.pawnSpeciesId).toBe('charmander')
    expect(merged.players.player2.pawnSpeciesId).toBe('pikachu')
  })
})

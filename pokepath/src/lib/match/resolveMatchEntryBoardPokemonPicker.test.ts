import { describe, expect, it } from 'vitest'

import type { BoardPokemonPickStored } from '@/src/lib/pokemon/boardPokemonPickStorage'
import type { PokemonTeamPickPayload } from '@/src/lib/pokemon/pokemonTeamPickStorage'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'

import { resolveMatchEntryBoardPokemonPicker } from './resolveMatchEntryBoardPokemonPicker'

const charm = starterSpeciesById('charmander')!
const pika = starterSpeciesById('pikachu')!
const oddish = starterSpeciesById('oddish')!

const teamPayload: PokemonTeamPickPayload = {
  speciesIds: ['charmander', 'pikachu'],
  pickedAt: 1,
}

describe('resolveMatchEntryBoardPokemonPicker', () => {
  const trainerKey = 'user-1:match-1'

  it('applies stored pick when key matches and species is on the Pokemon team', () => {
    const stored: BoardPokemonPickStored = { trainerKey, speciesId: 'charmander' }
    const d = resolveMatchEntryBoardPokemonPicker({
      trainerStorageKey: trainerKey,
      boardPickStored: stored,
      parsedPokemonTeam: teamPayload,
      optionA: charm,
      optionB: pika,
      seatBoardPokemonSpeciesId: undefined,
    })
    expect(d).toEqual({ kind: 'applyStored', speciesId: 'charmander' })
  })

  it('trusts hydrated seat Pokemon when no valid stored pick', () => {
    const d = resolveMatchEntryBoardPokemonPicker({
      trainerStorageKey: trainerKey,
      boardPickStored: null,
      parsedPokemonTeam: teamPayload,
      optionA: charm,
      optionB: pika,
      seatBoardPokemonSpeciesId: 'pikachu',
    })
    expect(d).toEqual({ kind: 'trustSeat' })
  })

  it('opens picker and clears seat when seat Pokemon is not on the current team', () => {
    const d = resolveMatchEntryBoardPokemonPicker({
      trainerStorageKey: trainerKey,
      boardPickStored: null,
      parsedPokemonTeam: teamPayload,
      optionA: charm,
      optionB: pika,
      seatBoardPokemonSpeciesId: 'oddish',
    })
    expect(d).toEqual({
      kind: 'openPicker',
      options: [charm, pika],
      clearSeat: true,
    })
  })

  it('opens picker without clear when team is ready and seat is empty', () => {
    const d = resolveMatchEntryBoardPokemonPicker({
      trainerStorageKey: trainerKey,
      boardPickStored: null,
      parsedPokemonTeam: teamPayload,
      optionA: charm,
      optionB: pika,
      seatBoardPokemonSpeciesId: undefined,
    })
    expect(d).toEqual({
      kind: 'openPicker',
      options: [charm, pika],
      clearSeat: false,
    })
  })

  it('does not apply stored pick when species is not on the Pokemon team', () => {
    const stored: BoardPokemonPickStored = { trainerKey, speciesId: 'oddish' }
    const d = resolveMatchEntryBoardPokemonPicker({
      trainerStorageKey: trainerKey,
      boardPickStored: stored,
      parsedPokemonTeam: teamPayload,
      optionA: charm,
      optionB: pika,
      seatBoardPokemonSpeciesId: undefined,
    })
    expect(d).toEqual({
      kind: 'openPicker',
      options: [charm, pika],
      clearSeat: false,
    })
  })

  it('closes picker when team payload is missing', () => {
    const d = resolveMatchEntryBoardPokemonPicker({
      trainerStorageKey: trainerKey,
      boardPickStored: null,
      parsedPokemonTeam: null,
      optionA: undefined,
      optionB: undefined,
      seatBoardPokemonSpeciesId: undefined,
    })
    expect(d).toEqual({ kind: 'closePicker' })
  })

  it('trusts seat when team list missing but seat has a Pokemon (e.g. mid-game)', () => {
    const d = resolveMatchEntryBoardPokemonPicker({
      trainerStorageKey: trainerKey,
      boardPickStored: null,
      parsedPokemonTeam: null,
      optionA: undefined,
      optionB: undefined,
      seatBoardPokemonSpeciesId: oddish.id,
    })
    expect(d).toEqual({ kind: 'trustSeat' })
  })
})

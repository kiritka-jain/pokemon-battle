import { describe, expect, it, vi } from 'vitest'

import {
  isPokemonTeamPickReadyForStarters,
  parsePokemonTeamPickJson,
  persistPokemonTeamPick,
  POKEMON_TEAM_PICK_STORAGE_KEY,
  pokemonTeamPickLabel,
  serializePokemonTeamPick,
} from '@/src/lib/pokemon/pokemonTeamPickStorage'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'

describe('pokemon team pick storage', () => {
  it('round-trips payload through JSON', () => {
    const payload = { speciesIds: ['charmander', 'pikachu'] as [string, string], pickedAt: 1 }
    expect(parsePokemonTeamPickJson(serializePokemonTeamPick(payload))).toEqual(payload)
  })

  it('round-trips payload with openedBallIndices', () => {
    const payload = {
      speciesIds: ['charmander', 'pikachu'] as [string, string],
      openedBallIndices: [0, 2] as [number, number],
    }
    expect(parsePokemonTeamPickJson(serializePokemonTeamPick(payload))).toEqual(payload)
  })

  it('returns null for invalid JSON', () => {
    expect(parsePokemonTeamPickJson('not json')).toBe(null)
  })

  it('returns null for wrong speciesIds shape', () => {
    expect(parsePokemonTeamPickJson(JSON.stringify({ speciesIds: ['a'] }))).toBe(null)
    expect(parsePokemonTeamPickJson(JSON.stringify({ speciesIds: [1, 2] }))).toBe(null)
    expect(parsePokemonTeamPickJson(JSON.stringify({ speciesIds: ['', 'b'] }))).toBe(null)
  })

  it('returns null when pickedAt is wrong type', () => {
    expect(
      parsePokemonTeamPickJson(
        JSON.stringify({ speciesIds: ['a', 'b'], pickedAt: 'x' }),
      ),
    ).toBe(null)
  })

  it('pokemonTeamPickLabel uses roster names', () => {
    const label = pokemonTeamPickLabel(
      { speciesIds: ['charmander', 'pikachu'] },
      starterSpeciesById,
    )
    expect(label).toContain('Charmander')
    expect(label).toContain('Pikachu')
  })

  it('persistPokemonTeamPick writes serialized payload to storage', () => {
    const setItem = vi.fn()
    const payload = { speciesIds: ['charmander', 'pikachu'] as [string, string] }
    const ok = persistPokemonTeamPick(payload, { setItem })
    expect(ok).toBe(true)
    expect(setItem).toHaveBeenCalledWith(
      POKEMON_TEAM_PICK_STORAGE_KEY,
      serializePokemonTeamPick(payload),
    )
  })

  it('persistPokemonTeamPick returns false when storage throws', () => {
    const setItem = vi.fn(() => {
      throw new Error('quota')
    })
    const ok = persistPokemonTeamPick({ speciesIds: ['charmander', 'Horsea'] }, { setItem })
    expect(ok).toBe(false)
  })

  it('isPokemonTeamPickReadyForStarters requires parsed team and roster ids', () => {
    expect(isPokemonTeamPickReadyForStarters(null, starterSpeciesById)).toBe(false)
    expect(
      isPokemonTeamPickReadyForStarters(
        parsePokemonTeamPickJson(JSON.stringify({ speciesIds: ['nope', 'pikachu'] })),
        starterSpeciesById,
      ),
    ).toBe(false)
    expect(
      isPokemonTeamPickReadyForStarters(
        parsePokemonTeamPickJson(JSON.stringify({ speciesIds: ['charmander', 'pikachu'] })),
        starterSpeciesById,
      ),
    ).toBe(true)
  })
})

import type { BoardPokemonPickStored } from '@/src/lib/pokemon/boardPokemonPickStorage'
import type { PokemonTeamPickPayload } from '@/src/lib/pokemon/pokemonTeamPickStorage'
import type { StarterSpecies } from '@/src/lib/pokemon/starterRoster'

export type MatchEntryBoardPokemonPickerDecision =
  | { kind: 'applyStored'; speciesId: string }
  | { kind: 'trustSeat' }
  | { kind: 'openPicker'; options: [StarterSpecies, StarterSpecies]; clearSeat: boolean }
  | { kind: 'closePicker' }

export function speciesInPokemonTeam(
  speciesId: string,
  pokemonTeam: PokemonTeamPickPayload | null,
): boolean {
  if (!pokemonTeam) return false
  const [a, b] = pokemonTeam.speciesIds
  return speciesId === a || speciesId === b
}

/**
 * Pure helper for `/match/[matchId]` board Pokemon picker: session restore, stale team list,
 * hydrated seat species, or opening the picker from the current two-Pokemon team list.
 */
export function resolveMatchEntryBoardPokemonPicker(args: {
  trainerStorageKey: string
  boardPickStored: BoardPokemonPickStored | null
  parsedPokemonTeam: PokemonTeamPickPayload | null
  optionA: StarterSpecies | undefined
  optionB: StarterSpecies | undefined
  seatBoardPokemonSpeciesId: string | undefined
}): MatchEntryBoardPokemonPickerDecision {
  const {
    trainerStorageKey,
    boardPickStored,
    parsedPokemonTeam,
    optionA,
    optionB,
    seatBoardPokemonSpeciesId,
  } = args

  const teamReady = Boolean(parsedPokemonTeam && optionA && optionB)

  if (
    boardPickStored &&
    boardPickStored.trainerKey === trainerStorageKey &&
    boardPickStored.speciesId &&
    speciesInPokemonTeam(boardPickStored.speciesId, parsedPokemonTeam)
  ) {
    return { kind: 'applyStored', speciesId: boardPickStored.speciesId }
  }

  if (
    teamReady &&
    seatBoardPokemonSpeciesId &&
    !speciesInPokemonTeam(seatBoardPokemonSpeciesId, parsedPokemonTeam)
  ) {
    return {
      kind: 'openPicker',
      options: [optionA!, optionB!],
      clearSeat: true,
    }
  }

  if (seatBoardPokemonSpeciesId) {
    return { kind: 'trustSeat' }
  }

  if (teamReady) {
    return { kind: 'openPicker', options: [optionA!, optionB!], clearSeat: false }
  }

  return { kind: 'closePicker' }
}

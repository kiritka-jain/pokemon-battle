/** Local `/play` board Pokemon choice (trainerKey: session user id or `p1`). Key string unchanged for compatibility. */
export const BOARD_POKEMON_PICK_LOCAL_STORAGE_KEY = 'pokepath_board_pawn_local_v1'

/** Online match board Pokemon choice (trainerKey: `${userId}:${matchId}`). Key string unchanged for compatibility. */
export const BOARD_POKEMON_PICK_MATCH_STORAGE_KEY = 'pokepath_board_pawn_match_v1'

export type BoardPokemonPickStored = {
  trainerKey: string
  speciesId: string
}

export function parseBoardPokemonPickJson(raw: string | null): BoardPokemonPickStored | null {
  if (raw == null || raw === '') return null
  try {
    const v: unknown = JSON.parse(raw)
    if (typeof v !== 'object' || v === null) return null
    const trainerKey = (v as { trainerKey?: unknown }).trainerKey
    const speciesId = (v as { speciesId?: unknown }).speciesId
    if (typeof trainerKey !== 'string' || trainerKey.length === 0) return null
    if (typeof speciesId !== 'string' || speciesId.length === 0) return null
    return { trainerKey, speciesId }
  } catch {
    return null
  }
}

export function serializeBoardPokemonPick(payload: BoardPokemonPickStored): string {
  return JSON.stringify(payload)
}

/** Local `/play` pawn choice (trainerKey: session user id or `p1`). */
export const PAWN_PICK_STORAGE_KEY = 'pokepath_board_pawn_local_v1'

/** Online match pawn choice (trainerKey: `${userId}:${matchId}`). */
export const PAWN_PICK_MATCH_STORAGE_KEY = 'pokepath_board_pawn_match_v1'

export type PawnPickStored = {
  trainerKey: string
  speciesId: string
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0
}

export function parsePawnPickJson(raw: string | null): PawnPickStored | null {
  if (raw == null || raw === '') return null
  try {
    const v: unknown = JSON.parse(raw)
    if (typeof v !== 'object' || v === null) return null
    const trainerKey = (v as { trainerKey?: unknown }).trainerKey
    const speciesId = (v as { speciesId?: unknown }).speciesId
    if (!isNonEmptyString(trainerKey) || !isNonEmptyString(speciesId)) return null
    return { trainerKey, speciesId }
  } catch {
    return null
  }
}

export function serializePawnPick(payload: PawnPickStored): string {
  return JSON.stringify(payload)
}

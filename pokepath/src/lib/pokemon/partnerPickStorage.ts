import type { StarterSpecies } from '@/src/lib/pokemon/starterRoster'

export const PARTNER_PICK_STORAGE_KEY = 'pokepath_partner_pick_v1'

export type PartnerPickPayload = {
  speciesIds: [string, string]
  pickedAt?: number
  /** Ball indices (0–2) in the order the player opened them. */
  openedBallIndices?: [number, number]
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0
}

function isBallIndex(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 2
}

export function parsePartnerPickJson(raw: string | null): PartnerPickPayload | null {
  if (raw == null || raw === '') return null
  try {
    const v: unknown = JSON.parse(raw)
    if (typeof v !== 'object' || v === null) return null
    const speciesIds = (v as { speciesIds?: unknown }).speciesIds
    if (!Array.isArray(speciesIds) || speciesIds.length !== 2) return null
    const [a, b] = speciesIds
    if (!isNonEmptyString(a) || !isNonEmptyString(b)) return null
    const pickedAt = (v as { pickedAt?: unknown }).pickedAt
    if (pickedAt !== undefined && typeof pickedAt !== 'number') return null

    const openedBallIndices = (v as { openedBallIndices?: unknown }).openedBallIndices
    if (openedBallIndices !== undefined) {
      if (!Array.isArray(openedBallIndices) || openedBallIndices.length !== 2) return null
      const [i0, i1] = openedBallIndices
      if (!isBallIndex(i0) || !isBallIndex(i1)) return null
    }

    const base: PartnerPickPayload = { speciesIds: [a, b] }
    if (typeof pickedAt === 'number') base.pickedAt = pickedAt
    if (Array.isArray(openedBallIndices) && openedBallIndices.length === 2) {
      const [i0, i1] = openedBallIndices
      if (isBallIndex(i0) && isBallIndex(i1)) {
        base.openedBallIndices = [i0, i1]
      }
    }
    return base
  } catch {
    return null
  }
}

export function serializePartnerPick(payload: PartnerPickPayload): string {
  return JSON.stringify(payload)
}

export function partnerPickLabel(
  payload: PartnerPickPayload,
  rosterLookup: (id: string) => StarterSpecies | undefined,
): string {
  const [a, b] = payload.speciesIds
  const na = rosterLookup(a)?.displayName ?? a
  const nb = rosterLookup(b)?.displayName ?? b
  return `${na} · ${nb}`
}

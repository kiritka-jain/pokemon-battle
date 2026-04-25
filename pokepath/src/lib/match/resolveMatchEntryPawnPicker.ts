import type { PartnerPickPayload } from '@/src/lib/pokemon/partnerPickStorage'
import type { PawnPickStored } from '@/src/lib/pokemon/pawnPickStorage'
import type { StarterSpecies } from '@/src/lib/pokemon/starterRoster'

export type MatchEntryPawnPickerDecision =
  | { kind: 'applyStored'; speciesId: string }
  | { kind: 'trustSeat' }
  | { kind: 'openPicker'; options: [StarterSpecies, StarterSpecies]; clearSeat: boolean }
  | { kind: 'closePicker' }

export function speciesInPartnerList(speciesId: string, partner: PartnerPickPayload | null): boolean {
  if (!partner) return false
  const [a, b] = partner.speciesIds
  return speciesId === a || speciesId === b
}

/**
 * Pure helper for `/match/[matchId]` pawn picker: session restore, stale partner list,
 * hydrated seat pawn, or opening the picker from the current two-partner list.
 */
export function resolveMatchEntryPawnPicker(args: {
  trainerStorageKey: string
  pawnStored: PawnPickStored | null
  parsedPartner: PartnerPickPayload | null
  optionA: StarterSpecies | undefined
  optionB: StarterSpecies | undefined
  seatPawnSpeciesId: string | undefined
}): MatchEntryPawnPickerDecision {
  const { trainerStorageKey, pawnStored, parsedPartner, optionA, optionB, seatPawnSpeciesId } = args

  const partnersReady = Boolean(parsedPartner && optionA && optionB)

  if (
    pawnStored &&
    pawnStored.trainerKey === trainerStorageKey &&
    pawnStored.speciesId &&
    speciesInPartnerList(pawnStored.speciesId, parsedPartner)
  ) {
    return { kind: 'applyStored', speciesId: pawnStored.speciesId }
  }

  if (partnersReady && seatPawnSpeciesId && !speciesInPartnerList(seatPawnSpeciesId, parsedPartner)) {
    return {
      kind: 'openPicker',
      options: [optionA!, optionB!],
      clearSeat: true,
    }
  }

  if (seatPawnSpeciesId) {
    return { kind: 'trustSeat' }
  }

  if (partnersReady) {
    return { kind: 'openPicker', options: [optionA!, optionB!], clearSeat: false }
  }

  return { kind: 'closePicker' }
}

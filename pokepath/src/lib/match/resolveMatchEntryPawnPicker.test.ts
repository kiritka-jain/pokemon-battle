import { describe, expect, it } from 'vitest'

import type { PartnerPickPayload } from '@/src/lib/pokemon/partnerPickStorage'
import type { PawnPickStored } from '@/src/lib/pokemon/pawnPickStorage'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'

import { resolveMatchEntryPawnPicker } from './resolveMatchEntryPawnPicker'

const charm = starterSpeciesById('charmander')!
const pika = starterSpeciesById('pikachu')!
const oddish = starterSpeciesById('oddish')!

const partnerPayload: PartnerPickPayload = {
  speciesIds: ['charmander', 'pikachu'],
  pickedAt: 1,
}

describe('resolveMatchEntryPawnPicker', () => {
  const trainerKey = 'user-1:match-1'

  it('applies stored pick when key matches and species is in partner list', () => {
    const stored: PawnPickStored = { trainerKey, speciesId: 'charmander' }
    const d = resolveMatchEntryPawnPicker({
      trainerStorageKey: trainerKey,
      pawnStored: stored,
      parsedPartner: partnerPayload,
      optionA: charm,
      optionB: pika,
      seatPawnSpeciesId: undefined,
    })
    expect(d).toEqual({ kind: 'applyStored', speciesId: 'charmander' })
  })

  it('trusts hydrated seat pawn when no valid stored pick', () => {
    const d = resolveMatchEntryPawnPicker({
      trainerStorageKey: trainerKey,
      pawnStored: null,
      parsedPartner: partnerPayload,
      optionA: charm,
      optionB: pika,
      seatPawnSpeciesId: 'pikachu',
    })
    expect(d).toEqual({ kind: 'trustSeat' })
  })

  it('opens picker and clears seat when seat pawn is not in current partner list', () => {
    const d = resolveMatchEntryPawnPicker({
      trainerStorageKey: trainerKey,
      pawnStored: null,
      parsedPartner: partnerPayload,
      optionA: charm,
      optionB: pika,
      seatPawnSpeciesId: 'oddish',
    })
    expect(d).toEqual({
      kind: 'openPicker',
      options: [charm, pika],
      clearSeat: true,
    })
  })

  it('opens picker without clear when partners are ready and seat is empty', () => {
    const d = resolveMatchEntryPawnPicker({
      trainerStorageKey: trainerKey,
      pawnStored: null,
      parsedPartner: partnerPayload,
      optionA: charm,
      optionB: pika,
      seatPawnSpeciesId: undefined,
    })
    expect(d).toEqual({
      kind: 'openPicker',
      options: [charm, pika],
      clearSeat: false,
    })
  })

  it('does not apply stored pick when species is not in partner list', () => {
    const stored: PawnPickStored = { trainerKey, speciesId: 'oddish' }
    const d = resolveMatchEntryPawnPicker({
      trainerStorageKey: trainerKey,
      pawnStored: stored,
      parsedPartner: partnerPayload,
      optionA: charm,
      optionB: pika,
      seatPawnSpeciesId: undefined,
    })
    expect(d).toEqual({
      kind: 'openPicker',
      options: [charm, pika],
      clearSeat: false,
    })
  })

  it('closes picker when partner payload is missing', () => {
    const d = resolveMatchEntryPawnPicker({
      trainerStorageKey: trainerKey,
      pawnStored: null,
      parsedPartner: null,
      optionA: undefined,
      optionB: undefined,
      seatPawnSpeciesId: undefined,
    })
    expect(d).toEqual({ kind: 'closePicker' })
  })

  it('trusts seat when partner list missing but seat has pawn (e.g. mid-game)', () => {
    const d = resolveMatchEntryPawnPicker({
      trainerStorageKey: trainerKey,
      pawnStored: null,
      parsedPartner: null,
      optionA: undefined,
      optionB: undefined,
      seatPawnSpeciesId: oddish.id,
    })
    expect(d).toEqual({ kind: 'trustSeat' })
  })
})

import { describe, expect, it, vi } from 'vitest'

import {
  parsePartnerPickJson,
  persistPartnerPick,
  serializePartnerPick,
  partnerPickLabel,
} from '@/src/lib/pokemon/partnerPickStorage'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'

describe('partnerPickStorage', () => {
  it('round-trips a valid payload', () => {
    const payload = {
      speciesIds: ['charmander', 'Horsea'] as [string, string],
      pickedAt: 1_700_000_000_000,
      openedBallIndices: [0, 2] as [number, number],
    }
    expect(parsePartnerPickJson(serializePartnerPick(payload))).toEqual(payload)
  })

  it('round-trips minimal payload', () => {
    const payload = { speciesIds: ['charmander', 'Horsea'] as [string, string] }
    expect(parsePartnerPickJson(serializePartnerPick(payload))).toEqual(payload)
  })

  it('returns null for invalid JSON', () => {
    expect(parsePartnerPickJson('not json')).toBe(null)
  })

  it('returns null when speciesIds is not a pair of strings', () => {
    expect(parsePartnerPickJson(JSON.stringify({ speciesIds: ['a'] }))).toBe(null)
    expect(parsePartnerPickJson(JSON.stringify({ speciesIds: [1, 2] }))).toBe(null)
    expect(parsePartnerPickJson(JSON.stringify({ speciesIds: ['', 'b'] }))).toBe(null)
  })

  it('returns null for invalid openedBallIndices', () => {
    expect(
      parsePartnerPickJson(
        JSON.stringify({ speciesIds: ['a', 'b'], openedBallIndices: [0, 3] }),
      ),
    ).toBe(null)
  })

  it('partnerPickLabel uses roster names', () => {
    const label = partnerPickLabel(
      { speciesIds: ['charmander', 'Horsea'] },
      starterSpeciesById,
    )
    expect(label).toBe('Charmander · Horsea')
  })

  it('persistPartnerPick writes serialized payload to storage', () => {
    const payload = {
      speciesIds: ['charmander', 'Horsea'] as [string, string],
      pickedAt: 1_700_000_000_000,
      openedBallIndices: [0, 2] as [number, number],
    }
    const setItem = vi.fn()
    const ok = persistPartnerPick(payload, { setItem })
    expect(ok).toBe(true)
    expect(setItem).toHaveBeenCalledWith(
      'pokepath_partner_pick_v1',
      '{"speciesIds":["charmander","Horsea"],"pickedAt":1700000000000,"openedBallIndices":[0,2]}',
    )
  })

  it('persistPartnerPick returns false when storage throws', () => {
    const setItem = vi.fn(() => {
      throw new Error('quota')
    })
    const ok = persistPartnerPick({ speciesIds: ['charmander', 'Horsea'] }, { setItem })
    expect(ok).toBe(false)
  })
})

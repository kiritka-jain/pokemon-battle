import { describe, expect, it } from 'vitest'

import {
  parsePartnerPickJson,
  serializePartnerPick,
  partnerPickLabel,
} from '@/src/lib/pokemon/partnerPickStorage'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'

describe('partnerPickStorage', () => {
  it('round-trips a valid payload', () => {
    const payload = {
      speciesIds: ['charmander', 'tidekit'] as [string, string],
      pickedAt: 1_700_000_000_000,
      openedBallIndices: [0, 2] as [number, number],
    }
    expect(parsePartnerPickJson(serializePartnerPick(payload))).toEqual(payload)
  })

  it('round-trips minimal payload', () => {
    const payload = { speciesIds: ['charmander', 'tidekit'] as [string, string] }
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
      { speciesIds: ['charmander', 'tidekit'] },
      starterSpeciesById,
    )
    expect(label).toBe('Charmander · Horsea')
  })
})

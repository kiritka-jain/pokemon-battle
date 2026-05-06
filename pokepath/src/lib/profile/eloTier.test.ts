import { describe, expect, it } from 'vitest'

import { eloTierLabel } from '@/src/lib/profile/eloTier'

describe('eloTierLabel', () => {
  it('returns Unrated for non-finite values', () => {
    expect(eloTierLabel(Number.NaN)).toBe('Unrated')
    expect(eloTierLabel(Number.POSITIVE_INFINITY)).toBe('Unrated')
  })

  it('uses boundary-inclusive upper tiers', () => {
    expect(eloTierLabel(999)).toBe('Rookie')
    expect(eloTierLabel(1000)).toBe('Bronze')
    expect(eloTierLabel(1199)).toBe('Bronze')
    expect(eloTierLabel(1200)).toBe('Silver')
    expect(eloTierLabel(1399)).toBe('Silver')
    expect(eloTierLabel(1400)).toBe('Gold')
    expect(eloTierLabel(1599)).toBe('Gold')
    expect(eloTierLabel(1600)).toBe('Platinum')
    expect(eloTierLabel(1799)).toBe('Platinum')
    expect(eloTierLabel(1800)).toBe('Master')
    expect(eloTierLabel(2400)).toBe('Master')
  })
})

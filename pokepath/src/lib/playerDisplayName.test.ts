import { describe, expect, it } from 'vitest'

import { displayNameForSeat } from './playerDisplayName'

describe('displayNameForSeat', () => {
  it('returns trimmed username when present', () => {
    expect(
      displayNameForSeat({ username: '  Ash  ', userId: 'any-id' }),
    ).toBe('Ash')
  })

  it('treats whitespace-only username as missing', () => {
    expect(displayNameForSeat({ username: '   ', userId: 'abc-def-12' })).toBe('Trainer_abcdef12')
  })

  it('uses Trainer_<8 hex-ish prefix> when username missing', () => {
    expect(
      displayNameForSeat({
        username: undefined,
        userId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    ).toBe('Trainer_550e8400')
  })

  it('returns Trainer when userId empty and no username', () => {
    expect(displayNameForSeat({ username: undefined, userId: '' })).toBe('Trainer')
  })
})

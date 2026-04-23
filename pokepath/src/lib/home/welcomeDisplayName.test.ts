import { describe, expect, it } from 'vitest'

import { welcomeDisplayName } from './welcomeDisplayName'

describe('welcomeDisplayName', () => {
  it('returns Trainer when not signed in', () => {
    expect(
      welcomeDisplayName({ sessionUserId: null, profileUsername: undefined }),
    ).toBe('Trainer')
  })

  it('returns Trainer while profile is loading', () => {
    expect(
      welcomeDisplayName({
        sessionUserId: '550e8400-e29b-41d4-a716-446655440000',
        profileUsername: undefined,
      }),
    ).toBe('Trainer')
  })

  it('returns trimmed username when profile loaded', () => {
    expect(
      welcomeDisplayName({
        sessionUserId: '550e8400-e29b-41d4-a716-446655440000',
        profileUsername: '  Ash  ',
      }),
    ).toBe('Ash')
  })

  it('delegates to displayNameForSeat when username missing after load', () => {
    expect(
      welcomeDisplayName({
        sessionUserId: '550e8400-e29b-41d4-a716-446655440000',
        profileUsername: null,
      }),
    ).toBe('Trainer_550e8400')
  })
})

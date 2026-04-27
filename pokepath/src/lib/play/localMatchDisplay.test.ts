import { describe, expect, it } from 'vitest'

import { buildAiPracticeMatchDisplay, buildLocalMatchDisplay } from './localMatchDisplay'

describe('buildLocalMatchDisplay', () => {
  it('returns undefined when not signed in', () => {
    expect(buildLocalMatchDisplay(null, undefined)).toBeUndefined()
  })

  it('uses profile username for seat 1 and Guest for seat 2 when signed in', () => {
    expect(buildLocalMatchDisplay('550e8400-e29b-41d4-a716-446655440000', 'Ash')).toEqual({
      player1Username: 'Ash',
      player2Username: 'Guest',
    })
  })

  it('falls back to Trainer_<id prefix> when profile username not loaded yet', () => {
    expect(
      buildLocalMatchDisplay('550e8400-e29b-41d4-a716-446655440000', undefined),
    ).toEqual({
      player1Username: 'Trainer_550e8400',
      player2Username: 'Guest',
    })
  })

  it('uses Trainer_<id> when profile row has no username (null)', () => {
    expect(
      buildLocalMatchDisplay('550e8400-e29b-41d4-a716-446655440000', null),
    ).toEqual({
      player1Username: 'Trainer_550e8400',
      player2Username: 'Guest',
    })
  })
})

describe('buildAiPracticeMatchDisplay', () => {
  it('returns undefined when not signed in', () => {
    expect(buildAiPracticeMatchDisplay(null, undefined)).toBeUndefined()
  })

  it('labels seat 2 as Computer when signed in', () => {
    expect(buildAiPracticeMatchDisplay('550e8400-e29b-41d4-a716-446655440000', 'Ash')).toEqual({
      player1Username: 'Ash',
      player2Username: 'Computer',
    })
  })
})

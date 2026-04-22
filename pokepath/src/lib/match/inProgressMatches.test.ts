import { describe, expect, it } from 'vitest'

import {
  mapInProgressMatches,
  type InProgressMatchRow,
  type ProfileUsernameRow,
} from './inProgressMatches'

describe('mapInProgressMatches', () => {
  it('maps active matches with opponent username on player1 seat', () => {
    const matches: InProgressMatchRow[] = [
      {
        id: 'match-1',
        player1_id: 'me',
        player2_id: 'opp',
        created_at: '2026-04-22T12:00:00.000Z',
      },
    ]
    const profiles: ProfileUsernameRow[] = [{ id: 'opp', username: 'Misty' }]

    const result = mapInProgressMatches({
      sessionUserId: 'me',
      matches,
      profiles,
    })

    expect(result).toEqual([
      {
        matchId: 'match-1',
        opponentId: 'opp',
        opponentLabel: 'Misty',
        createdAt: '2026-04-22T12:00:00.000Z',
      },
    ])
  })

  it('maps active matches with opponent username on player2 seat', () => {
    const matches: InProgressMatchRow[] = [
      {
        id: 'match-2',
        player1_id: 'opp',
        player2_id: 'me',
        created_at: '2026-04-22T12:00:00.000Z',
      },
    ]
    const profiles: ProfileUsernameRow[] = [{ id: 'opp', username: 'Brock' }]

    const result = mapInProgressMatches({
      sessionUserId: 'me',
      matches,
      profiles,
    })

    expect(result[0]?.opponentLabel).toBe('Brock')
    expect(result[0]?.opponentId).toBe('opp')
  })

  it('falls back to short opponent user id when profile is missing', () => {
    const matches: InProgressMatchRow[] = [
      {
        id: 'match-3',
        player1_id: 'me',
        player2_id: 'abcdefghi',
        created_at: '2026-04-22T12:00:00.000Z',
      },
    ]

    const result = mapInProgressMatches({
      sessionUserId: 'me',
      matches,
      profiles: [],
    })

    expect(result[0]?.opponentLabel).toBe('User abcdefgh')
  })

  it('sorts matches by newest created_at first', () => {
    const matches: InProgressMatchRow[] = [
      {
        id: 'older',
        player1_id: 'me',
        player2_id: 'opp-1',
        created_at: '2026-04-22T10:00:00.000Z',
      },
      {
        id: 'newer',
        player1_id: 'me',
        player2_id: 'opp-2',
        created_at: '2026-04-22T11:00:00.000Z',
      },
    ]
    const profiles: ProfileUsernameRow[] = [
      { id: 'opp-1', username: 'Older' },
      { id: 'opp-2', username: 'Newer' },
    ]

    const result = mapInProgressMatches({
      sessionUserId: 'me',
      matches,
      profiles,
    })

    expect(result.map((item) => item.matchId)).toEqual(['newer', 'older'])
  })
})

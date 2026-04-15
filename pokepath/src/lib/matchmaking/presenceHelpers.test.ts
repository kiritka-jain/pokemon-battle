import { describe, expect, it } from 'vitest'

import { parsePresencePlayers, searchingUserIds } from './presenceHelpers'

describe('parsePresencePlayers', () => {
  it('merges metas and dedupes by userId', () => {
    const state = {
      k1: [{ userId: 'a', username: 'A', elo: 1200, searching: true }],
      k2: [{ userId: 'b', username: 'B', elo: 1100, searching: false }],
    }
    const list = parsePresencePlayers(state as Record<string, unknown[] | undefined>)
    expect(list).toHaveLength(2)
    expect(list.find((p) => p.userId === 'a')?.searching).toBe(true)
  })
})

describe('searchingUserIds', () => {
  it('returns sorted ids of searchers only', () => {
    expect(
      searchingUserIds([
        { userId: 'z', username: '', elo: 1200, searching: false },
        { userId: 'a', username: '', elo: 1200, searching: true },
        { userId: 'm', username: '', elo: 1200, searching: true },
      ]),
    ).toEqual(['a', 'm'])
  })
})

import { describe, expect, it } from 'vitest'

import { splitLeaderboardRows } from './splitLeaderboardRows'

describe('splitLeaderboardRows', () => {
  it('returns empty podium and rest for empty input', () => {
    expect(splitLeaderboardRows([])).toEqual({ podium: [], rest: [] })
  })

  it('puts a single row on the podium only', () => {
    expect(splitLeaderboardRows(['a'])).toEqual({ podium: ['a'], rest: [] })
  })

  it('puts two rows on the podium only', () => {
    expect(splitLeaderboardRows(['a', 'b'])).toEqual({ podium: ['a', 'b'], rest: [] })
  })

  it('splits three rows into full podium and empty rest', () => {
    expect(splitLeaderboardRows(['a', 'b', 'c'])).toEqual({
      podium: ['a', 'b', 'c'],
      rest: [],
    })
  })

  it('sends rank 4+ to rest in order', () => {
    expect(splitLeaderboardRows(['a', 'b', 'c', 'd', 'e'])).toEqual({
      podium: ['a', 'b', 'c'],
      rest: ['d', 'e'],
    })
  })
})

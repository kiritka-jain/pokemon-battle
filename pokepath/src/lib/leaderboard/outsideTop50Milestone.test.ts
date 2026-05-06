import { describe, expect, it } from 'vitest'

import { outsideTop50Milestone } from './outsideTop50Milestone'

function rows(elos: number[]) {
  return elos.map((elo_rating) => ({ elo_rating }))
}

describe('outsideTop50Milestone', () => {
  it('returns pool_under_50 when fewer than 50 rows', () => {
    expect(outsideTop50Milestone(rows(Array(30).fill(1200)), 1100)).toEqual({
      type: 'pool_under_50',
      playerCount: 30,
    })
  })

  it('returns zero eloBehind when myElo matches rank 50', () => {
    const top = rows([...Array(49).fill(1300), 1200])
    expect(outsideTop50Milestone(top, 1200)).toEqual({
      type: 'behind_cutoff',
      rank50Elo: 1200,
      eloBehind: 0,
    })
  })

  it('returns positive eloBehind below rank 50 Elo', () => {
    const top = rows([...Array(49).fill(1300), 1200])
    expect(outsideTop50Milestone(top, 1000)).toEqual({
      type: 'behind_cutoff',
      rank50Elo: 1200,
      eloBehind: 200,
    })
  })

  it('never returns negative eloBehind if myElo exceeds rank 50 (tie edge)', () => {
    const top = rows([...Array(49).fill(1300), 1200])
    expect(outsideTop50Milestone(top, 1250)).toEqual({
      type: 'behind_cutoff',
      rank50Elo: 1200,
      eloBehind: 0,
    })
  })
})

import { describe, expect, it } from 'vitest'

import { calculateElo } from './calculateElo'

describe('calculateElo', () => {
  it('updates ratings when favorite wins', () => {
    const { newWinnerElo, newLoserElo } = calculateElo(1600, 1400)
    expect(newWinnerElo).toBeLessThanOrEqual(1600 + 32)
    expect(newWinnerElo).toBeGreaterThan(1600)
    expect(newLoserElo).toBeLessThan(1400)
  })

  it('is symmetric in expectation for equal ratings', () => {
    const { newWinnerElo, newLoserElo } = calculateElo(1500, 1500)
    expect(newWinnerElo).toBe(1516)
    expect(newLoserElo).toBe(1484)
  })
})

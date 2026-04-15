import { describe, expect, it } from 'vitest'

import type { Fence } from '@/src/types/game'

import {
  getFenceId,
  getNeighbors,
  isBlockedByFence,
  isInBounds,
} from './boardUtils'

const fence = (partial: Omit<Fence, 'placedBy'> & { placedBy?: Fence['placedBy'] }): Fence => ({
  placedBy: 'player1',
  ...partial,
})

describe('isInBounds', () => {
  it('returns true for positions on the 9x9 board', () => {
    expect(isInBounds({ x: 0, y: 0 })).toBe(true)
    expect(isInBounds({ x: 8, y: 8 })).toBe(true)
    expect(isInBounds({ x: 4, y: 4 })).toBe(true)
  })

  it('returns false when x or y is outside 0–8', () => {
    expect(isInBounds({ x: -1, y: 4 })).toBe(false)
    expect(isInBounds({ x: 4, y: 9 })).toBe(false)
  })
})

describe('getFenceId', () => {
  it('formats horizontal and vertical ids', () => {
    expect(getFenceId(3, 3, 'H')).toBe('h-3-3')
    expect(getFenceId(5, 2, 'V')).toBe('v-5-2')
  })
})

describe('isBlockedByFence', () => {
  it('returns false when there is no fence on the edge', () => {
    const from = { x: 4, y: 4 }
    const to = { x: 4, y: 3 }
    expect(isBlockedByFence(from, to, [])).toBe(false)
  })

  it('blocks an upward step with a horizontal fence at (x, y-1)', () => {
    const from = { x: 4, y: 4 }
    const to = { x: 4, y: 3 }
    const fences: Fence[] = [
      fence({
        id: getFenceId(4, 3, 'H'),
        x: 4,
        y: 3,
        orientation: 'H',
      }),
    ]
    expect(isBlockedByFence(from, to, fences)).toBe(true)
  })

  it('blocks a rightward step with a vertical fence at (x, y)', () => {
    const from = { x: 4, y: 4 }
    const to = { x: 5, y: 4 }
    const fences: Fence[] = [
      fence({
        id: getFenceId(4, 4, 'V'),
        x: 4,
        y: 4,
        orientation: 'V',
      }),
    ]
    expect(isBlockedByFence(from, to, fences)).toBe(true)
  })

  it('does not treat a vertical fence as blocking vertical movement', () => {
    const from = { x: 4, y: 4 }
    const to = { x: 4, y: 3 }
    const fences: Fence[] = [
      fence({
        id: getFenceId(4, 3, 'V'),
        x: 4,
        y: 3,
        orientation: 'V',
      }),
    ]
    expect(isBlockedByFence(from, to, fences)).toBe(false)
  })

  it('returns false for non-adjacent positions', () => {
    expect(
      isBlockedByFence({ x: 0, y: 0 }, { x: 2, y: 0 }, [])
    ).toBe(false)
  })
})

describe('getNeighbors', () => {
  it('returns four neighbors in the center with no fences', () => {
    const n = getNeighbors({ x: 4, y: 4 }, [])
    expect(n).toHaveLength(4)
    expect(n).toEqual(
      expect.arrayContaining([
        { x: 4, y: 3 },
        { x: 4, y: 5 },
        { x: 3, y: 4 },
        { x: 5, y: 4 },
      ])
    )
  })

  it('returns two neighbors in a corner with no fences', () => {
    const n = getNeighbors({ x: 0, y: 0 }, [])
    expect(n).toHaveLength(2)
    expect(n).toEqual(
      expect.arrayContaining([
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ])
    )
  })

  it('omits one neighbor when a horizontal fence blocks that direction', () => {
    const fences: Fence[] = [
      fence({
        id: getFenceId(4, 3, 'H'),
        x: 4,
        y: 3,
        orientation: 'H',
      }),
    ]
    const n = getNeighbors({ x: 4, y: 4 }, fences)
    expect(n).toHaveLength(3)
    expect(n).not.toContainEqual({ x: 4, y: 3 })
    expect(n).toEqual(
      expect.arrayContaining([
        { x: 4, y: 5 },
        { x: 3, y: 4 },
        { x: 5, y: 4 },
      ])
    )
  })
})

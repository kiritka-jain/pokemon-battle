import { describe, expect, it } from 'vitest'

import { getConfirmActionLabel } from './pendingActionLabels'

describe('getConfirmActionLabel', () => {
  it('returns Confirm Move for pending move', () => {
    expect(getConfirmActionLabel({ type: 'move', targetPos: { x: 1, y: 1 } })).toBe(
      'Confirm Move',
    )
  })

  it('returns Confirm Fence for pending fence', () => {
    expect(
      getConfirmActionLabel({
        type: 'fence',
        targetFence: { x: 0, y: 0, orientation: 'H' },
      }),
    ).toBe('Confirm Fence')
  })

  it('returns generic Confirm when nothing pending', () => {
    expect(getConfirmActionLabel({ type: null })).toBe('Confirm')
  })
})

import { describe, expect, it } from 'vitest'

import { FENCE_TRAP_OPPONENT_CODE } from '@/src/lib/engine/fenceValidator'

import { fenceValidationSummary } from './validationFeedback'

describe('fenceValidationSummary', () => {
  it('explains legal fences', () => {
    expect(fenceValidationSummary({ valid: true })).toBe(
      'Legal fence: both trainers still have a route to the goal.',
    )
  })

  it('explains path-blocking traps with learnable copy', () => {
    expect(
      fenceValidationSummary({
        valid: false,
        code: FENCE_TRAP_OPPONENT_CODE,
        reason: "Would block Player 1's path",
      }),
    ).toBe('Illegal fence: every trainer must keep at least one open route to the goal.')
  })

  it('maps common geometry failures', () => {
    expect(fenceValidationSummary({ valid: false, reason: 'Duplicate fence' })).toBe(
      'Illegal fence: that exact fence is already on the board.',
    )
    expect(fenceValidationSummary({ valid: false, reason: 'Fences would cross' })).toBe(
      'Illegal fence: fences cannot cross at the same anchor.',
    )
  })
})

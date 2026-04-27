import type { FenceValidationResult } from '@/src/lib/engine/fenceValidator'

export function fenceValidationSummary(result: FenceValidationResult): string {
  if (result.valid) {
    return 'Legal fence: both trainers still have a route to the goal.'
  }

  if (result.code === 'TRAP_OPPONENT') {
    return 'Illegal fence: every trainer must keep at least one open route to the goal.'
  }

  switch (result.reason) {
    case 'No fences remaining':
      return 'Illegal fence: this trainer has no fences left.'
    case 'Duplicate fence':
      return 'Illegal fence: that exact fence is already on the board.'
    case 'Overlapping fences':
      return 'Illegal fence: fences cannot overlap end-to-end.'
    case 'Fences would cross':
      return 'Illegal fence: fences cannot cross at the same anchor.'
    case 'Out of bounds':
      return 'Illegal fence: place fences on gaps inside the board.'
    case 'Not your turn':
      return 'Illegal fence: wait until it is your turn.'
    default:
      return result.reason ? `Illegal fence: ${result.reason}.` : 'Illegal fence placement.'
  }
}

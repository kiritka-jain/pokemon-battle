import type { PendingAction } from '@/src/types/game'

/** Label for the primary confirm button in the mobile action tray. */
export function getConfirmActionLabel(pending: PendingAction): string {
  if (pending.type === 'move') return 'Confirm Move'
  if (pending.type === 'fence') return 'Confirm Fence'
  return 'Confirm'
}

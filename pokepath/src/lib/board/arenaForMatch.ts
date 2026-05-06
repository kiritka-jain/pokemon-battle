import type { BoardArenaId } from '@/src/types/game'
import { BOARD_ARENA_IDS } from '@/src/types/game'

/** True if `v` is a valid `BoardArenaId`. */
export function isBoardArenaId(v: unknown): v is BoardArenaId {
  return typeof v === 'string' && (BOARD_ARENA_IDS as readonly string[]).includes(v)
}

/** Every match uses the grass arena. */
export function resolveArenaForMatch(_matchId: string): BoardArenaId {
  return BOARD_ARENA_IDS[0]!
}

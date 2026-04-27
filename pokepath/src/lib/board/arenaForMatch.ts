import { LOCAL_AI_PRACTICE_MATCH_ID } from '@/src/lib/match/localAiPracticeMatchId'
import { LOCAL_DEV_MATCH_ID } from '@/src/lib/match/localDevMatchId'
import type { BoardArenaId } from '@/src/types/game'
import { BOARD_ARENA_IDS } from '@/src/types/game'

function fnv1a32(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** True if `v` is a valid `BoardArenaId`. */
export function isBoardArenaId(v: unknown): v is BoardArenaId {
  return typeof v === 'string' && (BOARD_ARENA_IDS as readonly string[]).includes(v)
}

/**
 * Local hot-seat: random arena each init. Online UUID: deterministic index so both clients match
 * before `game_state` exists.
 */
export function resolveArenaForMatch(matchId: string): BoardArenaId {
  if (matchId === LOCAL_DEV_MATCH_ID || matchId === LOCAL_AI_PRACTICE_MATCH_ID) {
    const i = Math.floor(Math.random() * BOARD_ARENA_IDS.length)
    return BOARD_ARENA_IDS[i]!
  }
  const h = fnv1a32(matchId)
  return BOARD_ARENA_IDS[h % BOARD_ARENA_IDS.length]!
}

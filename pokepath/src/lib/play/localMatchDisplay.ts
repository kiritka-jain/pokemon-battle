import { displayNameForSeat } from '@/src/lib/playerDisplayName'
import type { InitMatchDisplay } from '@/src/lib/store/gameStore'

/**
 * `/play` labels: signed-in seat 1 uses profile username when known, else `Trainer_<id>`;
 * seat 2 is always `Guest`. Unsigned-in uses store defaults from synthetic ids `p1`/`p2`.
 */
export function buildLocalMatchDisplay(
  sessionUserId: string | null,
  profileUsername: string | null | undefined,
): InitMatchDisplay | undefined {
  if (!sessionUserId) {
    return undefined
  }
  const player1Username =
    profileUsername ??
    displayNameForSeat({ username: undefined, userId: sessionUserId })
  return {
    player1Username,
    player2Username: 'Guest',
  }
}

/** Labels for `/play/vs-computer`: human vs AI opponent. */
export function buildAiPracticeMatchDisplay(
  sessionUserId: string | null,
  profileUsername: string | null | undefined,
): InitMatchDisplay | undefined {
  if (!sessionUserId) {
    return undefined
  }
  const player1Username =
    profileUsername ??
    displayNameForSeat({ username: undefined, userId: sessionUserId })
  return {
    player1Username,
    player2Username: 'Computer',
  }
}

/** One client entry from Supabase Realtime `presenceState()`. */
export type PresencePlayer = {
  userId: string
  username: string
  elo: number
  searching: boolean
}

/**
 * Parse merged presence state into unique users (latest meta wins per userId).
 * Supabase shape: { [presenceKey]: [{ userId, username, ... }] }
 */
export function parsePresencePlayers(
  state: Record<string, unknown[] | undefined>,
): PresencePlayer[] {
  const byUser = new Map<string, PresencePlayer>()

  for (const metas of Object.values(state)) {
    if (!Array.isArray(metas)) continue
    for (const meta of metas) {
      if (!meta || typeof meta !== 'object') continue
      const m = meta as Record<string, unknown>
      const userId = typeof m.userId === 'string' ? m.userId : null
      if (!userId) continue
      byUser.set(userId, {
        userId,
        username: typeof m.username === 'string' ? m.username : userId.slice(0, 8),
        elo: typeof m.elo === 'number' ? m.elo : 1200,
        searching: Boolean(m.searching),
      })
    }
  }

  return [...byUser.values()].sort((a, b) => a.username.localeCompare(b.username))
}

/** User ids currently in “searching for match” state, sorted lexicographically. */
export function searchingUserIds(players: PresencePlayer[]): string[] {
  return [...new Set(players.filter((p) => p.searching).map((p) => p.userId))].sort((a, b) =>
    a.localeCompare(b),
  )
}

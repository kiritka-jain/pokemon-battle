/** Splits ordered leaderboard rows into top 3 (podium) and the remainder (rank 4+). */
export function splitLeaderboardRows<T>(rows: T[]): { podium: T[]; rest: T[] } {
  return {
    podium: rows.slice(0, 3),
    rest: rows.slice(3),
  }
}

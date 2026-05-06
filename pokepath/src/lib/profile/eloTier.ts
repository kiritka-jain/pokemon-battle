/**
 * Display tier from numeric Elo (fixed bands; no DB).
 */
export function eloTierLabel(elo: number): string {
  if (!Number.isFinite(elo)) return 'Unrated'
  if (elo < 1000) return 'Rookie'
  if (elo < 1200) return 'Bronze'
  if (elo < 1400) return 'Silver'
  if (elo < 1600) return 'Gold'
  if (elo < 1800) return 'Platinum'
  return 'Master'
}

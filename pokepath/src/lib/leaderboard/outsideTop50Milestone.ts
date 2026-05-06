export type OutsideTop50Milestone =
  | { type: 'pool_under_50'; playerCount: number }
  | { type: 'behind_cutoff'; rank50Elo: number; eloBehind: number }

/**
 * When the viewer is not in the loaded top-N list, describe how far they are from
 * the #50 slot using the Elo of the last row in a full top-50 fetch (ordered by Elo desc).
 */
export function outsideTop50Milestone(
  topRowsOrderedByEloDesc: { elo_rating: number }[],
  myElo: number,
): OutsideTop50Milestone | null {
  if (topRowsOrderedByEloDesc.length < 50) {
    return { type: 'pool_under_50', playerCount: topRowsOrderedByEloDesc.length }
  }
  const rank50 = topRowsOrderedByEloDesc[49]
  const eloBehind = rank50.elo_rating - myElo
  return {
    type: 'behind_cutoff',
    rank50Elo: rank50.elo_rating,
    eloBehind: Math.max(0, eloBehind),
  }
}

export type InProgressMatchRow = {
  id: string
  player1_id: string | null
  player2_id: string | null
  created_at: string | null
}

export type ProfileUsernameRow = {
  id: string
  username: string | null
}

export type InProgressMatchListItem = {
  matchId: string
  opponentId: string
  opponentLabel: string
  createdAt: string | null
}

function parseCreatedAt(createdAt: string | null): number {
  if (!createdAt) return 0
  const parsed = Date.parse(createdAt)
  return Number.isFinite(parsed) ? parsed : 0
}

function fallbackOpponentLabel(opponentId: string): string {
  return `User ${opponentId.slice(0, 8)}`
}

export function mapInProgressMatches(args: {
  sessionUserId: string
  matches: InProgressMatchRow[]
  profiles: ProfileUsernameRow[]
}): InProgressMatchListItem[] {
  const profilesById = new Map(args.profiles.map((profile) => [profile.id, profile.username]))

  return args.matches
    .flatMap((match) => {
      const player1Id = match.player1_id
      const player2Id = match.player2_id
      if (!player1Id || !player2Id) return []
      if (player1Id !== args.sessionUserId && player2Id !== args.sessionUserId) return []

      const opponentId = player1Id === args.sessionUserId ? player2Id : player1Id
      const opponentUsername = profilesById.get(opponentId)

      return [
        {
          matchId: match.id,
          opponentId,
          opponentLabel:
            typeof opponentUsername === 'string' && opponentUsername.trim().length > 0
              ? opponentUsername
              : fallbackOpponentLabel(opponentId),
          createdAt: match.created_at,
        },
      ]
    })
    .sort((a, b) => parseCreatedAt(b.createdAt) - parseCreatedAt(a.createdAt))
}

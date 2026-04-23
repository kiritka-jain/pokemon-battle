import { displayNameForSeat } from '@/src/lib/playerDisplayName'

export function welcomeDisplayName(input: {
  sessionUserId: string | null
  profileUsername: string | null | undefined
}): string {
  if (!input.sessionUserId) return 'Trainer'
  if (input.profileUsername === undefined) return 'Trainer'
  return displayNameForSeat({
    userId: input.sessionUserId,
    username: input.profileUsername,
  })
}

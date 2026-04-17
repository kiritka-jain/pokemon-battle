/**
 * UI-facing trainer name: prefer profile username; otherwise align with DB trigger
 * (`Trainer_<first 8 chars of id without hyphens>`) or plain `Trainer` when id is missing.
 */
export function displayNameForSeat(input: { username?: string | null; userId: string }): string {
  const trimmed = input.username?.trim()
  if (trimmed) return trimmed

  const compact = input.userId.replace(/-/g, '')
  if (!compact) return 'Trainer'
  return `Trainer_${compact.slice(0, 8)}`
}

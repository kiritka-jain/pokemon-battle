/** Aligned with product expectations; DB is `TEXT` without a length CHECK. */
export const USERNAME_MAX_LENGTH = 32

export type UsernameValidationResult =
  | { ok: true; username: string }
  | { ok: false; error: string }

export function validateUsernameForSave(value: string): UsernameValidationResult {
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: false, error: 'Username cannot be empty.' }
  }
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Username must be at most ${USERNAME_MAX_LENGTH} characters.`,
    }
  }
  return { ok: true, username: trimmed }
}

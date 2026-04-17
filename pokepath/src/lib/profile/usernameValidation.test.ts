import { describe, expect, it } from 'vitest'

import { USERNAME_MAX_LENGTH, validateUsernameForSave } from './usernameValidation'

describe('validateUsernameForSave', () => {
  it('rejects empty and whitespace-only', () => {
    expect(validateUsernameForSave('')).toEqual({
      ok: false,
      error: 'Username cannot be empty.',
    })
    expect(validateUsernameForSave('   \t')).toEqual({
      ok: false,
      error: 'Username cannot be empty.',
    })
  })

  it('rejects over max length', () => {
    const long = 'a'.repeat(USERNAME_MAX_LENGTH + 1)
    const r = validateUsernameForSave(long)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error).toContain(String(USERNAME_MAX_LENGTH))
    }
  })

  it('accepts valid trimmed username', () => {
    expect(validateUsernameForSave('  PikachuFan  ')).toEqual({
      ok: true,
      username: 'PikachuFan',
    })
  })

  it('accepts username at max length', () => {
    const s = 'a'.repeat(USERNAME_MAX_LENGTH)
    expect(validateUsernameForSave(s)).toEqual({ ok: true, username: s })
  })
})

import { describe, expect, it } from 'vitest'

import { derivedProfileUsername } from './ensureProfileForAuthUser'

describe('ensureProfileForAuthUser', () => {
  it('derivedProfileUsername uses full_name and uuid suffix', () => {
    const u = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      user_metadata: { full_name: '  Ash  ' },
    } as Parameters<typeof derivedProfileUsername>[0]
    expect(derivedProfileUsername(u)).toBe('Ash_a1b2c3d4e5f67890abcdef1234567890')
  })

  it('derivedProfileUsername falls back to name then Trainer prefix', () => {
    const u = {
      id: '00000000-0000-4000-8000-000000000001',
      user_metadata: { name: 'Misty' },
    } as Parameters<typeof derivedProfileUsername>[0]
    expect(derivedProfileUsername(u)).toBe('Misty_00000000000040008000000000000001')
  })

  it('derivedProfileUsername uses Trainer_ when no metadata names', () => {
    const u = {
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      user_metadata: {},
    } as Parameters<typeof derivedProfileUsername>[0]
    expect(derivedProfileUsername(u)).toBe(
      'Trainer_aaaaaaaa_aaaaaaaabbbbccccddddeeeeeeeeeeee',
    )
  })
})

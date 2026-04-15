import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

import { supabase } from './client'
import {
  getSession,
  onAuthStateChange,
  signInWithGoogle,
  signOut,
} from './auth'

describe('auth helpers', () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.signInWithOAuth).mockReset()
    vi.mocked(supabase.auth.signOut).mockReset()
    vi.mocked(supabase.auth.getSession).mockReset()
    vi.mocked(supabase.auth.onAuthStateChange).mockReset()
  })

  it('signInWithGoogle uses default redirect to /lobby in the browser', async () => {
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } })
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: 'google', url: 'https://example.com/oauth' },
      error: null,
    })

    await signInWithGoogle()

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost:3000/lobby' },
    })

    vi.unstubAllGlobals()
  })

  it('signInWithGoogle respects explicit redirectTo', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: 'google', url: 'https://example.com/oauth' },
      error: null,
    })

    await signInWithGoogle('https://example.com/custom')

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://example.com/custom' },
    })
  })

  it('signInWithGoogle throws without window and without redirectTo', () => {
    expect(() => signInWithGoogle()).toThrow(
      'signInWithGoogle: redirectTo is required outside the browser'
    )
  })

  it('signOut delegates to supabase.auth.signOut', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

    await signOut()

    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
  })

  it('getSession delegates to supabase.auth.getSession', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })

    await getSession()

    expect(supabase.auth.getSession).toHaveBeenCalledTimes(1)
  })

  it('onAuthStateChange delegates and returns subscription', () => {
    const unsub = vi.fn()
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: unsub } },
    } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>)

    const cb = vi.fn()
    const result = onAuthStateChange(cb)

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(cb)
    expect(result.data.subscription.unsubscribe).toBe(unsub)
  })
})

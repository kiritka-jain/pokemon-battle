import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserFromBearerMock = vi.fn()
const fromMock = vi.fn()

vi.mock('@/src/lib/supabase/routeAuth', () => ({
  getUserFromBearer: getUserFromBearerMock,
}))

vi.mock('@/src/lib/supabase/server', () => ({
  supabaseServer: {
    from: fromMock,
  },
}))

function makeBuilder(result: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    update: vi.fn(),
    maybeSingle: vi.fn(),
  }
  chain.select.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.update.mockReturnValue(chain)
  chain.maybeSingle.mockResolvedValue(result)
  return chain
}

describe('POST /api/match/board-pokemon', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without authenticated user', async () => {
    getUserFromBearerMock.mockResolvedValue({ user: null })
    const { POST } = await import('./route')
    const res = await POST(
      new Request('http://localhost/api/match/board-pokemon', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ matchId: 'm1', speciesId: 'charmander' }),
      }),
    )
    expect(res.status).toBe(401)
  })

  it('persists board Pokemon for caller seat without incrementing state_version', async () => {
    getUserFromBearerMock.mockResolvedValue({ user: { id: 'p1' } })

    const matchLookup = makeBuilder({
      data: {
        id: 'm1',
        status: 'in_progress',
        player1_id: 'p1',
        player2_id: 'p2',
        game_state: null,
        state_version: 0,
      },
      error: null,
    })
    const matchUpdate = makeBuilder({
      data: { state_version: 0 },
      error: null,
    })
    fromMock.mockReturnValueOnce(matchLookup).mockReturnValueOnce(matchUpdate)

    const { POST } = await import('./route')
    const res = await POST(
      new Request('http://localhost/api/match/board-pokemon', {
        method: 'POST',
        headers: {
          authorization: 'Bearer token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ matchId: 'm1', speciesId: 'charmander' }),
      }),
    )

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, stateVersion: 0 })
    expect(matchUpdate.update).toHaveBeenCalled()
    const payload = matchUpdate.update.mock.calls[0]?.[0] as {
      game_state?: { players?: { player1?: { pawnSpeciesId?: string } } }
    }
    expect(payload?.game_state?.players?.player1?.pawnSpeciesId).toBe('charmander')
  })
})

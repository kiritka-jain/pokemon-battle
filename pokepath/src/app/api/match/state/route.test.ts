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

describe('POST /api/match/state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 without authenticated user', async () => {
    getUserFromBearerMock.mockResolvedValue({ user: null })
    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/match/state', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toMatchObject({ error: 'Unauthorized' })
  })

  it('persists valid move state and increments version', async () => {
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
      data: { state_version: 1 },
      error: null,
    })
    fromMock.mockReturnValueOnce(matchLookup).mockReturnValueOnce(matchUpdate)

    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/match/state', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        matchId: 'm1',
        baseVersion: 0,
        committedAction: { type: 'move', targetPos: { x: 4, y: 7 } },
        newState: {
          turn: 'player2',
          players: {
            player1: { id: 'p1', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
            player2: { id: 'p2', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
          },
          fences: [],
          winner: null,
          status: 'active',
          pendingAction: { type: null },
        },
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true, stateVersion: 1 })
    expect(fromMock).toHaveBeenCalledTimes(2)
    expect(fromMock).toHaveBeenNthCalledWith(1, 'matches')
    expect(fromMock).toHaveBeenNthCalledWith(2, 'matches')
  })

  it('returns 409 conflict when client base version is stale', async () => {
    getUserFromBearerMock.mockResolvedValue({ user: { id: 'p1' } })

    const matchLookup = makeBuilder({
      data: {
        id: 'm1',
        status: 'in_progress',
        player1_id: 'p1',
        player2_id: 'p2',
        game_state: { turn: 'player1' },
        state_version: 3,
      },
      error: null,
    })
    const freshLookup = makeBuilder({
      data: {
        state_version: 3,
        game_state: { turn: 'player1' },
      },
      error: null,
    })
    fromMock.mockReturnValueOnce(matchLookup).mockReturnValueOnce(freshLookup)

    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/match/state', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        matchId: 'm1',
        baseVersion: 2,
        committedAction: { type: 'move', targetPos: { x: 4, y: 7 } },
        newState: {
          turn: 'player2',
          players: {
            player1: { id: 'p1', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
            player2: { id: 'p2', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
          },
          fences: [],
          winner: null,
          status: 'active',
          pendingAction: { type: null },
        },
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toMatchObject({
      error: 'conflict',
      stateVersion: 3,
    })
  })

  it('returns 409 conflict and fresh state when computed state mismatches client payload', async () => {
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
    const freshLookup = makeBuilder({
      data: {
        state_version: 0,
        game_state: null,
      },
      error: null,
    })
    fromMock.mockReturnValueOnce(matchLookup).mockReturnValueOnce(freshLookup)

    const { POST } = await import('./route')
    const req = new Request('http://localhost/api/match/state', {
      method: 'POST',
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        matchId: 'm1',
        baseVersion: 0,
        committedAction: { type: 'move', targetPos: { x: 4, y: 7 } },
        newState: {
          // Intentionally wrong (actor move not applied), should trigger state_mismatch conflict.
          turn: 'player1',
          players: {
            player1: { id: 'p1', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
            player2: { id: 'p2', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
          },
          fences: [],
          winner: null,
          status: 'active',
          pendingAction: { type: null },
        },
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toMatchObject({
      error: 'conflict',
      reason: 'state_mismatch',
      stateVersion: 0,
    })
  })
})

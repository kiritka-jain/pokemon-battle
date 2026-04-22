import { NextResponse } from 'next/server'

import { applyCommittedTurn } from '@/src/lib/engine/applyCommittedTurn'
import { initialGameStateForMatch } from '@/src/lib/match/initialGameStateForMatch'
import { parsePersistedMatchState } from '@/src/lib/match/parsePersistedMatchState'
import { normalizedTurnSnapshotJson } from '@/src/lib/match/snapshotUtils'
import { playerKeyForUserId } from '@/src/lib/match/validateIncomingTurn'
import { getUserFromBearer } from '@/src/lib/supabase/routeAuth'
import { supabaseServer } from '@/src/lib/supabase/server'
import type { GameState, PendingAction } from '@/src/types/game'

type StateBody = {
  matchId?: string
  baseVersion?: number
  committedAction?: PendingAction
  newState?: Pick<GameState, 'turn' | 'players' | 'fences' | 'winner' | 'status' | 'pendingAction'>
}

function serializePersistedState(state: GameState): object {
  return JSON.parse(normalizedTurnSnapshotJson(state)) as object
}

export async function POST(request: Request) {
  const { user } = await getUserFromBearer(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: StateBody
  try {
    body = (await request.json()) as StateBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const matchId = body.matchId?.trim()
  if (!matchId) {
    return NextResponse.json({ error: 'matchId required' }, { status: 400 })
  }

  const baseVersion = body.baseVersion
  if (typeof baseVersion !== 'number' || baseVersion < 0 || !Number.isInteger(baseVersion)) {
    return NextResponse.json({ error: 'baseVersion must be a non-negative integer' }, { status: 400 })
  }

  const action = body.committedAction
  const newState = body.newState
  if (!action || action.type === null || !newState) {
    return NextResponse.json({ error: 'committedAction and newState required' }, { status: 400 })
  }

  const { data: match, error: matchError } = await supabaseServer
    .from('matches')
    .select('id, status, player1_id, player2_id, game_state, state_version')
    .eq('id', matchId)
    .maybeSingle()

  if (matchError || !match?.player1_id || !match.player2_id) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  if (match.status !== 'in_progress') {
    return NextResponse.json({ error: 'Match is not in progress' }, { status: 400 })
  }

  const p1 = match.player1_id as string
  const p2 = match.player2_id as string
  if (user.id !== p1 && user.id !== p2) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const currentVersion = Number(match.state_version ?? 0)
  if (baseVersion !== currentVersion) {
    const { data: fresh } = await supabaseServer
      .from('matches')
      .select('state_version, game_state')
      .eq('id', matchId)
      .maybeSingle()
    return NextResponse.json(
      {
        error: 'conflict',
        stateVersion: fresh?.state_version ?? currentVersion,
        gameState: fresh?.game_state ?? null,
      },
      { status: 409 },
    )
  }

  const base =
    parsePersistedMatchState(match.game_state, { id: matchId, player1_id: p1, player2_id: p2 }) ??
    initialGameStateForMatch({ id: matchId, player1_id: p1, player2_id: p2 })

  const actorKey = playerKeyForUserId(base, user.id)
  if (actorKey === null) {
    return NextResponse.json({ error: 'Player mapping failed' }, { status: 500 })
  }

  const applied = applyCommittedTurn(base, actorKey, action)
  if (!applied.ok) {
    return NextResponse.json({ error: applied.reason, code: applied.errorCode }, { status: 400 })
  }

  const serverNorm = normalizedTurnSnapshotJson(applied.next)
  const clientNorm = normalizedTurnSnapshotJson(newState)
  if (serverNorm !== clientNorm) {
    const { data: fresh } = await supabaseServer
      .from('matches')
      .select('state_version, game_state')
      .eq('id', matchId)
      .maybeSingle()
    return NextResponse.json(
      {
        error: 'conflict',
        reason: 'state_mismatch',
        stateVersion: fresh?.state_version ?? currentVersion,
        gameState: fresh?.game_state ?? match.game_state ?? null,
      },
      { status: 409 },
    )
  }

  const persisted = serializePersistedState(applied.next)

  const { data: updated, error: updateError } = await supabaseServer
    .from('matches')
    .update({
      game_state: persisted,
      state_version: currentVersion + 1,
    })
    .eq('id', matchId)
    .eq('state_version', currentVersion)
    .eq('status', 'in_progress')
    .select('state_version')
    .maybeSingle()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (!updated) {
    const { data: fresh } = await supabaseServer
      .from('matches')
      .select('state_version, game_state')
      .eq('id', matchId)
      .maybeSingle()
    return NextResponse.json(
      {
        error: 'conflict',
        stateVersion: fresh?.state_version ?? currentVersion,
        gameState: fresh?.game_state ?? null,
      },
      { status: 409 },
    )
  }

  return NextResponse.json({ ok: true, stateVersion: updated.state_version as number })
}

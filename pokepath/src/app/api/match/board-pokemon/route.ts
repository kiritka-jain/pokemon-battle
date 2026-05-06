import { NextResponse } from 'next/server'

import { initialGameStateForMatch } from '@/src/lib/match/initialGameStateForMatch'
import { parsePersistedMatchState } from '@/src/lib/match/parsePersistedMatchState'
import { normalizedTurnSnapshotJson } from '@/src/lib/match/snapshotUtils'
import { playerKeyForUserId } from '@/src/lib/match/validateIncomingTurn'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import { getUserFromBearer } from '@/src/lib/supabase/routeAuth'
import { supabaseServer } from '@/src/lib/supabase/server'
import type { GameState } from '@/src/types/game'

type Body = {
  matchId?: string
  speciesId?: string
}

export async function POST(request: Request) {
  const { user } = await getUserFromBearer(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const matchId = body.matchId?.trim()
  const speciesId = body.speciesId?.trim()
  if (!matchId || !speciesId) {
    return NextResponse.json({ error: 'matchId and speciesId required' }, { status: 400 })
  }
  if (!starterSpeciesById(speciesId)) {
    return NextResponse.json({ error: 'Invalid speciesId' }, { status: 400 })
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
  const base =
    parsePersistedMatchState(match.game_state, { id: matchId, player1_id: p1, player2_id: p2 }) ??
    initialGameStateForMatch({ id: matchId, player1_id: p1, player2_id: p2 })

  const actorKey = playerKeyForUserId(base, user.id)
  if (actorKey === null) {
    return NextResponse.json({ error: 'Player mapping failed' }, { status: 500 })
  }

  const next: GameState = {
    ...base,
    players: {
      ...base.players,
      [actorKey]: {
        ...base.players[actorKey],
        pawnSpeciesId: speciesId,
      },
    },
  }

  const persisted = JSON.parse(normalizedTurnSnapshotJson(next)) as object

  const { data: updated, error: updateError } = await supabaseServer
    .from('matches')
    .update({ game_state: persisted })
    .eq('id', matchId)
    .eq('state_version', currentVersion)
    .eq('status', 'in_progress')
    .select('state_version')
    .maybeSingle()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (!updated) {
    return NextResponse.json({ error: 'conflict', code: 'version_changed' }, { status: 409 })
  }

  return NextResponse.json({ ok: true, stateVersion: updated.state_version as number })
}

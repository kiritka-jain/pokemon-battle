import { NextResponse } from 'next/server'

import { calculateElo } from '@/src/lib/elo/calculateElo'
import { getUserFromBearer } from '@/src/lib/supabase/routeAuth'
import { supabaseServer } from '@/src/lib/supabase/server'

type EndBody = {
  matchId: string
  winnerId: string
  loserId: string
  totalTurns: number
  durationSeconds: number
  finalBoardState: object
}

export async function POST(request: Request) {
  const { user } = await getUserFromBearer(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: EndBody
  try {
    body = (await request.json()) as EndBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { matchId, winnerId, loserId, totalTurns, durationSeconds, finalBoardState } = body
  if (!matchId || !winnerId || !loserId || winnerId === loserId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (user.id !== winnerId && user.id !== loserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: match, error: matchError } = await supabaseServer
    .from('matches')
    .select(
      'id, status, player1_id, player2_id, winner_id, loser_id, total_turns, duration_seconds',
    )
    .eq('id', matchId)
    .maybeSingle()

  if (matchError || !match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  const participants =
    match.player1_id && match.player2_id
      ? [match.player1_id, match.player2_id]
      : ([] as string[])
  if (participants.length !== 2 || !participants.includes(winnerId) || !participants.includes(loserId)) {
    return NextResponse.json({ error: 'Players do not match this match' }, { status: 400 })
  }

  if (match.status === 'finished') {
    return NextResponse.json({
      ok: true,
      alreadyFinished: true,
      winnerElo: null,
      loserElo: null,
    })
  }

  const { data: winnerProfile, error: wErr } = await supabaseServer
    .from('profiles')
    .select('id, elo_rating, total_wins')
    .eq('id', winnerId)
    .single()

  const { data: loserProfile, error: lErr } = await supabaseServer
    .from('profiles')
    .select('id, elo_rating, total_losses')
    .eq('id', loserId)
    .single()

  if (wErr || lErr || !winnerProfile || !loserProfile) {
    return NextResponse.json({ error: 'Could not load profiles' }, { status: 500 })
  }

  const { newWinnerElo, newLoserElo } = calculateElo(winnerProfile.elo_rating, loserProfile.elo_rating)

  const { error: updateWinnerErr } = await supabaseServer
    .from('profiles')
    .update({
      elo_rating: newWinnerElo,
      total_wins: (winnerProfile.total_wins ?? 0) + 1,
    })
    .eq('id', winnerId)

  if (updateWinnerErr) {
    return NextResponse.json({ error: updateWinnerErr.message }, { status: 500 })
  }

  const { error: updateLoserErr } = await supabaseServer
    .from('profiles')
    .update({
      elo_rating: newLoserElo,
      total_losses: (loserProfile.total_losses ?? 0) + 1,
    })
    .eq('id', loserId)

  if (updateLoserErr) {
    return NextResponse.json({ error: updateLoserErr.message }, { status: 500 })
  }

  const { error: matchUpdateErr } = await supabaseServer
    .from('matches')
    .update({
      status: 'finished',
      winner_id: winnerId,
      loser_id: loserId,
      total_turns: totalTurns,
      duration_seconds: durationSeconds,
      final_board_state: finalBoardState as object,
    })
    .eq('id', matchId)

  if (matchUpdateErr) {
    return NextResponse.json({ error: matchUpdateErr.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    winnerElo: newWinnerElo,
    loserElo: newLoserElo,
  })
}

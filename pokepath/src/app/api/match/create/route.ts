import { NextResponse } from 'next/server'

import { ensureProfileForUserId } from '@/src/lib/match/ensureProfileForAuthUser'
import { getUserFromBearer } from '@/src/lib/supabase/routeAuth'
import { supabaseServer } from '@/src/lib/supabase/server'

export async function POST(request: Request) {
  const { user } = await getUserFromBearer(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { player1Id?: string; player2Id?: string }
  try {
    body = (await request.json()) as { player1Id?: string; player2Id?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const rawA = body.player1Id?.trim()
  const rawB = body.player2Id?.trim()
  if (!rawA || !rawB || rawA === rawB) {
    return NextResponse.json({ error: 'Invalid players' }, { status: 400 })
  }

  const [player1Id, player2Id] = [rawA, rawB].sort((x, y) => x.localeCompare(y))
  if (user.id !== player1Id && user.id !== player2Id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: existing, error: findError } = await supabaseServer
    .from('matches')
    .select('id')
    .eq('status', 'in_progress')
    .eq('player1_id', player1Id)
    .eq('player2_id', player2Id)
    .maybeSingle()

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 })
  }

  if (existing?.id) {
    return NextResponse.json({ matchId: existing.id })
  }

  for (const uid of [player1Id, player2Id]) {
    const ensured = await ensureProfileForUserId(supabaseServer, uid)
    if (!ensured.ok) {
      return NextResponse.json(
        { error: `Could not ensure profile for player: ${ensured.error}` },
        { status: 500 },
      )
    }
  }

  const { data: created, error: insertError } = await supabaseServer
    .from('matches')
    .insert({
      player1_id: player1Id,
      player2_id: player2Id,
      status: 'in_progress',
    })
    .select('id')
    .single()

  if (String(insertError?.code) === '23505') {
    const { data: retry } = await supabaseServer
      .from('matches')
      .select('id')
      .eq('status', 'in_progress')
      .eq('player1_id', player1Id)
      .eq('player2_id', player2Id)
      .maybeSingle()
    if (retry?.id) {
      return NextResponse.json({ matchId: retry.id })
    }
  }

  if (insertError || !created) {
    return NextResponse.json(
      { error: insertError?.message ?? 'Failed to create match' },
      { status: 500 },
    )
  }

  return NextResponse.json({ matchId: created.id })
}

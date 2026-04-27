import { isBoardArenaId, resolveArenaForMatch } from '@/src/lib/board/arenaForMatch'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import type { GameState, GameStatus } from '@/src/types/game'

function parseBoardPokemonSpeciesId(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || raw === '') return undefined
  return starterSpeciesById(raw) ? raw : undefined
}

function parseBoardPosition(raw: unknown): { x: number; y: number } | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const x = Number(r.x)
  const y = Number(r.y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x, y }
}

function parsePendingAction(raw: unknown): GameState['pendingAction'] {
  if (!raw || typeof raw !== 'object') return { type: null }
  const pa = raw as Record<string, unknown>
  if (pa.type === null || pa.type === undefined) return { type: null }

  if (pa.type === 'move') {
    const targetPos = parseBoardPosition(pa.targetPos)
    if (!targetPos) return { type: null }
    return { type: 'move', targetPos }
  }

  if (pa.type === 'fence') {
    if (!pa.targetFence || typeof pa.targetFence !== 'object') return { type: null }
    const tf = pa.targetFence as Record<string, unknown>
    const x = Number(tf.x)
    const y = Number(tf.y)
    const orientation = tf.orientation
    if (!Number.isFinite(x) || !Number.isFinite(y)) return { type: null }
    if (orientation !== 'H' && orientation !== 'V') return { type: null }
    return { type: 'fence', targetFence: { x, y, orientation } }
  }

  return { type: null }
}

export function parsePersistedMatchState(
  raw: unknown,
  match: { id: string; player1_id: string; player2_id: string },
): GameState | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (o.turn !== 'player1' && o.turn !== 'player2') return null
  if (!o.players || typeof o.players !== 'object') return null
  const pl = o.players as Record<string, unknown>
  const p1 = pl.player1 as Record<string, unknown> | undefined
  const p2 = pl.player2 as Record<string, unknown> | undefined
  if (!p1?.id || !p2?.id) return null
  if (String(p1.id) !== match.player1_id || String(p2.id) !== match.player2_id) {
    return null
  }

  const pos = (p: Record<string, unknown>) => parseBoardPosition(p.pos)
  const pos1 = pos(p1)
  const pos2 = pos(p2)
  if (!pos1 || !pos2) return null

  const p1FencesLeft = Number(p1.fencesLeft)
  const p2FencesLeft = Number(p2.fencesLeft)
  if (!Number.isFinite(p1FencesLeft) || !Number.isFinite(p2FencesLeft)) return null

  let status: GameStatus = 'active'
  if (o.status === 'active' || o.status === 'finished' || o.status === 'waiting') {
    status = o.status
  }

  const fences = Array.isArray(o.fences) ? (o.fences as GameState['fences']) : []
  const pendingAction = parsePendingAction(o.pendingAction)

  let winner: GameState['winner'] = null
  if (o.winner === 'player1' || o.winner === 'player2') {
    winner = o.winner
  }

  const arena = isBoardArenaId(o.arena) ? o.arena : resolveArenaForMatch(match.id)

  const species1 = parseBoardPokemonSpeciesId(p1.pawnSpeciesId)
  const species2 = parseBoardPokemonSpeciesId(p2.pawnSpeciesId)

  return {
    matchId: match.id,
    status,
    turn: o.turn,
    arena,
    players: {
      player1: {
        id: String(p1.id),
        pos: pos1,
        fencesLeft: p1FencesLeft,
        type: String(p1.type ?? 'Normal'),
        ...(species1 !== undefined ? { pawnSpeciesId: species1 } : {}),
      },
      player2: {
        id: String(p2.id),
        pos: pos2,
        fencesLeft: p2FencesLeft,
        type: String(p2.type ?? 'Normal'),
        ...(species2 !== undefined ? { pawnSpeciesId: species2 } : {}),
      },
    },
    fences,
    pendingAction,
    winner,
    error: null,
    errorCode: null,
  }
}

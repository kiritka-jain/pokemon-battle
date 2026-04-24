import { isBoardArenaId, resolveArenaForMatch } from '@/src/lib/board/arenaForMatch'
import { starterSpeciesById } from '@/src/lib/pokemon/starterRoster'
import type { GameState, GameStatus } from '@/src/types/game'

function parsePawnSpeciesId(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || raw === '') return undefined
  return starterSpeciesById(raw) ? raw : undefined
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

  const pos = (p: Record<string, unknown>) => {
    const posRaw = p.pos as Record<string, unknown> | undefined
    if (!posRaw) return null
    const x = Number(posRaw.x)
    const y = Number(posRaw.y)
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null
    return { x, y }
  }
  const pos1 = pos(p1)
  const pos2 = pos(p2)
  if (!pos1 || !pos2) return null

  let status: GameStatus = 'active'
  if (o.status === 'active' || o.status === 'finished' || o.status === 'waiting') {
    status = o.status
  }

  const fences = Array.isArray(o.fences) ? (o.fences as GameState['fences']) : []

  let pendingAction: GameState['pendingAction'] = { type: null }
  if (o.pendingAction && typeof o.pendingAction === 'object') {
    const pa = o.pendingAction as Record<string, unknown>
    if (pa.type === null || pa.type === undefined) {
      pendingAction = { type: null }
    } else if (pa.type === 'move' || pa.type === 'fence') {
      pendingAction = pa as unknown as GameState['pendingAction']
    }
  }

  let winner: GameState['winner'] = null
  if (o.winner === 'player1' || o.winner === 'player2') {
    winner = o.winner
  }

  const arena = isBoardArenaId(o.arena) ? o.arena : resolveArenaForMatch(match.id)

  const pawn1 = parsePawnSpeciesId(p1.pawnSpeciesId)
  const pawn2 = parsePawnSpeciesId(p2.pawnSpeciesId)

  return {
    matchId: match.id,
    status,
    turn: o.turn,
    arena,
    players: {
      player1: {
        id: String(p1.id),
        pos: pos1,
        fencesLeft: Number(p1.fencesLeft),
        type: String(p1.type ?? 'Normal'),
        ...(pawn1 !== undefined ? { pawnSpeciesId: pawn1 } : {}),
      },
      player2: {
        id: String(p2.id),
        pos: pos2,
        fencesLeft: Number(p2.fencesLeft),
        type: String(p2.type ?? 'Normal'),
        ...(pawn2 !== undefined ? { pawnSpeciesId: pawn2 } : {}),
      },
    },
    fences,
    pendingAction,
    winner,
    error: null,
    errorCode: null,
  }
}

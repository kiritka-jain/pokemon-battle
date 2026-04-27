import { getFenceId } from '@/src/lib/engine/boardUtils'
import { validateFencePlacement } from '@/src/lib/engine/fenceValidator'
import type { GameState, PendingAction, PlayerKey } from '@/src/types/game'

import { allLegalPendingActions, listLegalFences, listLegalMoves } from './legalActions'
import { pathLengthForPlayer, pathLengthFromState } from './pathMetrics'

export type AiDifficulty = 'beginner' | 'normal' | 'hard'

export type ChooseAiOptions = {
  /** Injected for deterministic tests; defaults to `Math.random`. */
  random?: () => number
}

function opponentOf(pk: PlayerKey): PlayerKey {
  return pk === 'player1' ? 'player2' : 'player1'
}

function pickRandom<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)]!
}

function scoreState(
  ownKey: PlayerKey,
  fences: GameState['fences'],
  ownPos: GameState['players'][PlayerKey]['pos'],
  oppPos: GameState['players'][PlayerKey]['pos'],
  oppWeight: number,
): number {
  const own = pathLengthForPlayer(ownPos, ownKey, fences)
  const opp = pathLengthForPlayer(oppPos, opponentOf(ownKey), fences)
  if (own === null || opp === null) {
    return Number.POSITIVE_INFINITY
  }
  return own - oppWeight * opp
}

function scoreAfterPending(state: GameState, playerKey: PlayerKey, action: PendingAction, oppWeight: number): number {
  const oppKey = opponentOf(playerKey)
  if (action.type === 'move' && action.targetPos) {
    const ownPos = action.targetPos
    const oppPos = state.players[oppKey].pos
    return scoreState(playerKey, state.fences, ownPos, oppPos, oppWeight)
  }
  if (action.type === 'fence' && action.targetFence) {
    const { x, y, orientation } = action.targetFence
    const v = validateFencePlacement(playerKey, x, y, orientation, state)
    if (!v.valid) {
      return Number.POSITIVE_INFINITY
    }
    const fence = {
      id: getFenceId(x, y, orientation),
      x,
      y,
      orientation,
      placedBy: playerKey,
    }
    const fences = [...state.fences, fence]
    return scoreState(playerKey, fences, state.players[playerKey].pos, state.players[oppKey].pos, oppWeight)
  }
  return Number.POSITIVE_INFINITY
}

function bestOf(
  actions: PendingAction[],
  scoreFn: (a: PendingAction) => number,
  rnd: () => number,
  topPool: number,
): PendingAction {
  const scored = actions.map((a) => ({ a, s: scoreFn(a) }))
  scored.sort((u, v) => u.s - v.s)
  const bestScore = scored[0]?.s ?? Number.POSITIVE_INFINITY
  const pool = scored.filter((x) => x.s < Number.POSITIVE_INFINITY && x.s <= bestScore + 1e-6).slice(0, topPool)
  if (pool.length === 0) {
    return actions[0]!
  }
  return pickRandom(pool, rnd).a
}

/**
 * Choose a legal pending action for `state.turn` (must match `playerKey` when called from the AI seat).
 */
export function chooseAiPendingAction(
  state: GameState,
  playerKey: PlayerKey,
  difficulty: AiDifficulty,
  options: ChooseAiOptions = {},
): PendingAction {
  const rnd = options.random ?? Math.random

  const moves = listLegalMoves(state, playerKey)
  const fences = listLegalFences(state, playerKey)
  const any = allLegalPendingActions(state, playerKey)
  if (any.length === 0) {
    return { type: 'move', targetPos: { x: 4, y: 4 } }
  }

  const ownBefore = pathLengthFromState(state, playerKey)

  if (difficulty === 'beginner') {
    if (fences.length > 0 && state.players[playerKey].fencesLeft > 0 && rnd() < 0.15) {
      return pickRandom(
        fences.map((f) => ({ type: 'fence' as const, targetFence: f })),
        rnd,
      )
    }
    if (moves.length > 0) {
      const moveActions: PendingAction[] = moves.map((targetPos) => ({ type: 'move', targetPos }))
      return bestOf(
        moveActions,
        (a) => {
          if (a.type !== 'move' || !a.targetPos || ownBefore === null) {
            return Number.POSITIVE_INFINITY
          }
          const len = pathLengthForPlayer(a.targetPos, playerKey, state.fences)
          return len ?? Number.POSITIVE_INFINITY
        },
        rnd,
        5,
      )
    }
    return pickRandom(any, rnd)
  }

  if (difficulty === 'normal') {
    const oppWeight = 0.55
    const moveActions: PendingAction[] = moves.map((targetPos) => ({ type: 'move', targetPos }))
    const fenceActions: PendingAction[] = fences.map((targetFence) => ({ type: 'fence', targetFence }))
    const scoredFences = fenceActions
      .map((a) => ({ a, s: scoreAfterPending(state, playerKey, a, oppWeight) }))
      .filter((x) => Number.isFinite(x.s))
      .sort((u, v) => u.s - v.s)
    const topFences = scoredFences.slice(0, 6).map((x) => x.a)
    const pool = [...moveActions, ...topFences]
    if (pool.length === 0) {
      return pickRandom(any, rnd)
    }
    return bestOf(pool, (a) => scoreAfterPending(state, playerKey, a, oppWeight), rnd, 4)
  }

  // hard — same score family as normal, stronger opponent weight and more fence candidates
  const oppWeight = 0.85
  const moveActions: PendingAction[] = moves.map((targetPos) => ({ type: 'move', targetPos }))
  const fenceActions: PendingAction[] = fences.map((targetFence) => ({ type: 'fence', targetFence }))
  const scoredFences = fenceActions
    .map((a) => ({ a, s: scoreAfterPending(state, playerKey, a, oppWeight) }))
    .filter((x) => Number.isFinite(x.s))
    .sort((u, v) => u.s - v.s)
  const topFences = scoredFences.slice(0, 14).map((x) => x.a)
  const pool = [...moveActions, ...topFences]
  if (pool.length === 0) {
    return pickRandom(any, rnd)
  }
  return bestOf(pool, (a) => scoreAfterPending(state, playerKey, a, oppWeight), rnd, 5)
}

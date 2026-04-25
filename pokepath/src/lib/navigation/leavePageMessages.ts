import type { GameState } from '@/src/types/game'

type MatchLeaveState = Pick<GameState, 'status' | 'winner'>

export function matchLeaveMessage() {
  return 'Leave this match? You can rejoin with the same link while it is in progress.'
}

export function playLeaveMessage() {
  return 'Leave practice mode? Your current local board progress will be lost.'
}

export function isMatchRoute(pathname: string) {
  return /^\/match\/[^/]+$/.test(pathname)
}

export function requiresLeaveConfirmation(pathname: string, state?: MatchLeaveState) {
  if (pathname === '/play') {
    return true
  }

  if (!isMatchRoute(pathname)) {
    return false
  }

  if (!state) {
    return false
  }

  return state.status === 'active' && !state.winner
}

export function leaveConfirmationMessage(pathname: string, state?: MatchLeaveState) {
  if (!requiresLeaveConfirmation(pathname, state)) {
    return null
  }

  if (pathname === '/play') {
    return playLeaveMessage()
  }

  return matchLeaveMessage()
}

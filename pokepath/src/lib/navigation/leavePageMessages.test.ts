import { describe, expect, it } from 'vitest'

import {
  isMatchRoute,
  leaveConfirmationMessage,
  matchLeaveMessage,
  playLeaveMessage,
  requiresLeaveConfirmation,
  vsComputerLeaveMessage,
} from './leavePageMessages'

describe('leavePageMessages', () => {
  it('detects match routes', () => {
    expect(isMatchRoute('/match/abc123')).toBe(true)
    expect(isMatchRoute('/match/abc123/details')).toBe(false)
    expect(isMatchRoute('/lobby')).toBe(false)
  })

  it('requires confirmation on play page', () => {
    expect(requiresLeaveConfirmation('/play')).toBe(true)
    expect(leaveConfirmationMessage('/play')).toBe(playLeaveMessage())
  })

  it('requires confirmation on vs-computer page', () => {
    expect(requiresLeaveConfirmation('/play/vs-computer')).toBe(true)
    expect(leaveConfirmationMessage('/play/vs-computer')).toBe(vsComputerLeaveMessage())
  })

  it('requires confirmation on active match without winner', () => {
    expect(requiresLeaveConfirmation('/match/abc123', { status: 'active', winner: null })).toBe(true)
    expect(leaveConfirmationMessage('/match/abc123', { status: 'active', winner: null })).toBe(
      matchLeaveMessage(),
    )
  })

  it('skips confirmation on finished match', () => {
    expect(requiresLeaveConfirmation('/match/abc123', { status: 'finished', winner: 'player1' })).toBe(false)
    expect(leaveConfirmationMessage('/match/abc123', { status: 'finished', winner: 'player1' })).toBeNull()
  })

  it('skips confirmation for non-game pages', () => {
    expect(requiresLeaveConfirmation('/leaderboard')).toBe(false)
    expect(leaveConfirmationMessage('/leaderboard')).toBeNull()
  })
})

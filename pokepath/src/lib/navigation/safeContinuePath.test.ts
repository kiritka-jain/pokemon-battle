import { describe, expect, it } from 'vitest'

import { safeInternalContinuePath } from './safeContinuePath'

describe('safeInternalContinuePath', () => {
  it('allows /play, /play/vs-computer, /lobby', () => {
    expect(safeInternalContinuePath('/play')).toBe('/play')
    expect(safeInternalContinuePath('/play/vs-computer')).toBe('/play/vs-computer')
    expect(safeInternalContinuePath('/lobby')).toBe('/lobby')
  })

  it('allows /match/:id with one segment', () => {
    expect(safeInternalContinuePath('/match/abc-123')).toBe('/match/abc-123')
  })

  it('normalizes trailing slash on allowed exact paths', () => {
    expect(safeInternalContinuePath('/play/')).toBe('/play')
    expect(safeInternalContinuePath('/lobby/')).toBe('/lobby')
  })

  it('rejects protocol-relative, backslash, and non-allowed paths', () => {
    expect(safeInternalContinuePath('//evil.com')).toBeNull()
    expect(safeInternalContinuePath('https://evil.com')).toBeNull()
    expect(safeInternalContinuePath('/\\evil')).toBeNull()
    expect(safeInternalContinuePath('/admin')).toBeNull()
    expect(safeInternalContinuePath('play')).toBeNull()
    expect(safeInternalContinuePath('')).toBeNull()
    expect(safeInternalContinuePath(null)).toBeNull()
  })

  it('rejects /match without id or with extra segments', () => {
    expect(safeInternalContinuePath('/match')).toBeNull()
    expect(safeInternalContinuePath('/match/')).toBeNull()
    expect(safeInternalContinuePath('/match/a/b')).toBeNull()
  })

  it('strips query and hash from input before validating', () => {
    expect(safeInternalContinuePath('/play?x=1')).toBe('/play')
    expect(safeInternalContinuePath('/lobby#frag')).toBe('/lobby')
  })
})

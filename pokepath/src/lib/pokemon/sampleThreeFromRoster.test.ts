import { describe, expect, it } from 'vitest'

import { STARTER_SPECIES } from '@/src/lib/pokemon/starterRoster'

import { sampleThreeFromRoster } from './sampleThreeFromRoster'

function rngFromSeed(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('sampleThreeFromRoster', () => {
  it('returns three distinct items from the roster', () => {
    const rng = rngFromSeed(42)
    const [a, b, c] = sampleThreeFromRoster(STARTER_SPECIES, rng)
    expect(new Set([a.id, b.id, c.id]).size).toBe(3)
    const ids = new Set(STARTER_SPECIES.map((s) => s.id))
    expect(ids.has(a.id)).toBe(true)
    expect(ids.has(b.id)).toBe(true)
    expect(ids.has(c.id)).toBe(true)
  })

  it('is deterministic for a fixed RNG', () => {
    const first = sampleThreeFromRoster(STARTER_SPECIES, rngFromSeed(7))
    const second = sampleThreeFromRoster(STARTER_SPECIES, rngFromSeed(7))
    expect(first.map((s) => s.id)).toEqual(second.map((s) => s.id))
  })

  it('throws when roster has fewer than three entries', () => {
    expect(() => sampleThreeFromRoster([1, 2], () => 0)).toThrow(/at least 3/)
  })
})

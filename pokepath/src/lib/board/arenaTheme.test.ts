import { describe, expect, it } from 'vitest'

import {
  getArenaBoardBackdropClass,
  getArenaBoardOuterRingClass,
  getArenaFenceSolidBarClass,
  getArenaTileClasses,
  getArenaValidMoveDotClass,
  getArenaValidRingClass,
} from './arenaTheme'

describe('arenaTheme', () => {
  it('uses distinct tile classes for high contrast vs standard', () => {
    const std = getArenaTileClasses('grass', true, {})
    const hc = getArenaTileClasses('grass', true, { highContrast: true })
    expect(std).not.toBe(hc)
    expect(hc).toContain('ring-inset')
  })

  it('unifies valid-move accent in high contrast mode', () => {
    const std = getArenaValidMoveDotClass('water', {})
    const hcWater = getArenaValidMoveDotClass('water', { highContrast: true })
    const hcFire = getArenaValidMoveDotClass('fire', { highContrast: true })
    expect(hcWater).toBe(hcFire)
    expect(std).not.toBe(hcWater)
    expect(getArenaValidRingClass('grass', { highContrast: true })).toContain('cyan')
  })

  it('uses blue vs orange fences in high contrast mode regardless of arena', () => {
    const p1w = getArenaFenceSolidBarClass('water', 'player1', { highContrast: true })
    const p1g = getArenaFenceSolidBarClass('grass', 'player1', { highContrast: true })
    const p2w = getArenaFenceSolidBarClass('water', 'player2', { highContrast: true })
    expect(p1w).toBe(p1g)
    expect(p1w).toContain('blue')
    expect(p2w).toContain('orange')
  })

  it('adds route gradients when mood is route and not high contrast', () => {
    const route = getArenaTileClasses('water', false, { mood: 'route' })
    expect(route).toContain('gradient')
    const hcRoute = getArenaTileClasses('water', false, { mood: 'route', highContrast: true })
    expect(hcRoute).not.toContain('gradient')
  })

  it('strengthens outer ring in gym mood', () => {
    const base = getArenaBoardOuterRingClass('fire', {})
    const gym = getArenaBoardOuterRingClass('fire', { mood: 'gym' })
    expect(gym.length).toBeGreaterThan(base.length)
    expect(gym).toContain('ring-2')
  })

  it('provides backdrop for route, gym, battleNight, and high contrast', () => {
    expect(getArenaBoardBackdropClass('grass', { mood: 'route' })).toContain('radial-gradient')
    expect(getArenaBoardBackdropClass('grass', { mood: 'gym' })).toContain('inset')
    expect(getArenaBoardBackdropClass('grass', { mood: 'battleNight' })).toContain('radial-gradient')
    expect(getArenaBoardBackdropClass('grass', { highContrast: true })).toContain('radial-gradient')
    expect(getArenaBoardBackdropClass('grass', {})).toBe('')
  })
})

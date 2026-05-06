import { describe, expect, it } from 'vitest'

import { homeActionTiles } from './homeActionTiles'

describe('homeActionTiles', () => {
  it('returns three tiles for guests with login redirect on lobby only', () => {
    const tiles = homeActionTiles(false)
    expect(tiles).toHaveLength(3)
    expect(tiles[0]).toMatchObject({
      href: '/tutorial',
      title: 'Know the rules',
    })
    expect(tiles[1]).toMatchObject({
      href: '/pick?continue=/play/vs-computer',
      title: 'Play with computer',
    })
    expect(tiles[2]).toMatchObject({
      href: '/login?redirect=/lobby',
      title: 'Sign in to challenge a friend',
    })
  })

  it('returns three tiles for signed-in users with direct lobby link', () => {
    const tiles = homeActionTiles(true)
    expect(tiles).toHaveLength(3)
    expect(tiles[2]).toMatchObject({
      href: '/lobby',
      title: 'Challenge a friend',
    })
  })
})

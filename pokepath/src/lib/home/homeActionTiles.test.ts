import { describe, expect, it } from 'vitest'

import { homeActionTiles } from './homeActionTiles'

describe('homeActionTiles', () => {
  it('returns four tiles for guests with login redirect on lobby only', () => {
    const tiles = homeActionTiles(false)
    expect(tiles).toHaveLength(4)
    expect(tiles[0]).toMatchObject({
      href: '/tutorial',
      title: 'Know the rules',
    })
    expect(tiles[1]).toMatchObject({
      href: '/pick?continue=/play/vs-computer',
      title: 'Play with computer',
    })
    expect(tiles[2]).toMatchObject({
      href: '/pick',
      title: 'Choose your Pokémon',
    })
    expect(tiles[3]).toMatchObject({
      href: '/login?redirect=/lobby',
      title: 'Sign in to challenge a friend',
    })
  })

  it('returns four tiles for signed-in users with direct pick and lobby links', () => {
    const tiles = homeActionTiles(true)
    expect(tiles).toHaveLength(4)
    expect(tiles[2]).toMatchObject({
      href: '/pick',
      title: 'Choose your Pokémon',
    })
    expect(tiles[3]).toMatchObject({
      href: '/lobby',
      title: 'Challenge a friend',
    })
  })
})

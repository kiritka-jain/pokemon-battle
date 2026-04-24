import { describe, expect, it } from 'vitest'

import { BOARD_ARENA_IDS } from '@/src/types/game'

import {
  getArenaTileShadeLayerClasses,
  getArenaTileTextureLayerClasses,
  getArenaTileTextureUrl,
} from './arenaTheme'

describe('arena tile textures', () => {
  it('maps each arena to a distinct /board-tiles/*.png URL', () => {
    const urls = BOARD_ARENA_IDS.map((arena) => getArenaTileTextureUrl(arena))
    const unique = new Set(urls)
    expect(unique.size).toBe(BOARD_ARENA_IDS.length)
    for (const u of urls) {
      expect(u).toMatch(/^\/board-tiles\/[a-z]+\.png$/)
    }
  })

  it('uses different texture layer classes for light vs dark squares', () => {
    expect(getArenaTileTextureLayerClasses(true)).not.toBe(
      getArenaTileTextureLayerClasses(false)
    )
  })

  it('uses different shade layer classes for light vs dark squares', () => {
    expect(getArenaTileShadeLayerClasses(true)).not.toBe(getArenaTileShadeLayerClasses(false))
  })
})

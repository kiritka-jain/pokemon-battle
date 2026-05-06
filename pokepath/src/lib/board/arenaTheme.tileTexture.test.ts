import { describe, expect, it } from 'vitest'

import { BOARD_ARENA_IDS } from '@/src/types/game'

import {
  getArenaTileShadeLayerClasses,
  getArenaTileTextureLayerClasses,
  getArenaTileTextureUrl,
} from './arenaTheme'

describe('arena tile textures', () => {
  it('maps every arena input to the grass tile texture URL', () => {
    const urls = BOARD_ARENA_IDS.map((arena) => getArenaTileTextureUrl(arena))
    const unique = new Set(urls)
    expect(unique.size).toBe(1)
    for (const u of urls) {
      expect(u).toBe('/board-tiles/grass-arena-texture.png')
    }
  })

  it('uses the light texture classes for uniform board tiles', () => {
    expect(getArenaTileTextureLayerClasses(true)).toContain('brightness-105')
  })

  it('uses the light shade classes for uniform board tiles', () => {
    expect(getArenaTileShadeLayerClasses(true)).toContain('bg-transparent')
  })
})

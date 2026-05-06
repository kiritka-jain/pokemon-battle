import { describe, expect, it } from 'vitest'

import { GAME_RULE_SLIDES } from './gameRules'

describe('GAME_RULE_SLIDES', () => {
  it('has alt text and tutorial paths for every slide with an image', () => {
    for (const slide of GAME_RULE_SLIDES) {
      if (slide.imageSrc != null) {
        expect(slide.imageAlt?.trim().length).toBeGreaterThan(0)
        expect(slide.imageSrc.startsWith('/tutorial/')).toBe(true)
      }
    }
  })
})

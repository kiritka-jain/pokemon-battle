import { describe, expect, it } from 'vitest'

import { GUIDED_PRACTICE_LESSONS, validateGuidedPracticeChoice } from './guidedPractice'

describe('guided practice lessons', () => {
  it('keeps lesson ids unique', () => {
    const ids = GUIDED_PRACTICE_LESSONS.map((lesson) => lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('validates every scripted choice against its expected engine outcome', () => {
    for (const lesson of GUIDED_PRACTICE_LESSONS) {
      for (const choice of lesson.choices) {
        const result = validateGuidedPracticeChoice(lesson.id, choice.id)
        expect(result.valid, `${lesson.id}/${choice.id}`).toBe(choice.expectedValid)
      }
    }
  })

  it('marks the intended answer as correct for each lesson', () => {
    for (const lesson of GUIDED_PRACTICE_LESSONS) {
      const answers = lesson.choices.filter((choice) => choice.isAnswer)
      expect(answers, lesson.id).toHaveLength(1)

      const result = validateGuidedPracticeChoice(lesson.id, answers[0]!.id)
      expect(result.isCorrect, lesson.id).toBe(true)
    }
  })

  it('teaches the trap rule through an invalid fence outcome', () => {
    const result = validateGuidedPracticeChoice('trap-rule', 'seal-gap')

    expect(result.valid).toBe(false)
    expect(result.isCorrect).toBe(true)
    expect(result.feedback).toContain('every trainer must keep at least one open route')
  })

  it('handles unknown choices without throwing', () => {
    expect(validateGuidedPracticeChoice('missing', 'choice')).toEqual({
      valid: false,
      isCorrect: false,
      feedback: 'Professor Oak cannot find that practice prompt.',
      reason: 'Unknown guided practice choice',
    })
  })
})

import { getFenceId } from '@/src/lib/engine/boardUtils'
import { validateFencePlacement } from '@/src/lib/engine/fenceValidator'
import { validateMove } from '@/src/lib/engine/moveValidator'
import type { Fence, FenceOrientation, GameState, Position } from '@/src/types/game'

import { fenceValidationSummary } from './validationFeedback'

type TutorialAction =
  | { type: 'move'; targetPos: Position }
  | { type: 'fence'; x: number; y: number; orientation: FenceOrientation }

export type GuidedPracticeChoice = {
  id: string
  label: string
  action: TutorialAction
  isAnswer: boolean
  expectedValid: boolean
  successText: string
  mistakeText: string
}

export type GuidedPracticeLesson = {
  id: string
  eyebrow: string
  title: string
  setup: string
  prompt: string
  state: GameState
  choices: readonly GuidedPracticeChoice[]
}

export type GuidedPracticeResult = {
  valid: boolean
  isCorrect: boolean
  feedback: string
  reason?: string
}

const fence = (partial: Omit<Fence, 'placedBy'> & { placedBy?: Fence['placedBy'] }): Fence => ({
  placedBy: 'player1',
  ...partial,
})

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    matchId: 'tutorial',
    status: 'active',
    turn: 'player1',
    arena: 'grass',
    players: {
      player1: { id: 'oak-student', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
      player2: { id: 'oak-rival', pos: { x: 4, y: 0 }, fencesLeft: 10, type: 'Normal' },
    },
    fences: [],
    pendingAction: { type: null },
    winner: null,
    error: null,
    errorCode: null,
    ...overrides,
  }
}

function wallWithGapAt4(fy: number): Fence[] {
  const anchors = [0, 2, 6, 7] as const
  return anchors.map((x) =>
    fence({
      id: getFenceId(x, fy, 'H'),
      x,
      y: fy,
      orientation: 'H',
    }),
  )
}

export const GUIDED_PRACTICE_LESSONS = [
  {
    id: 'first-step',
    eyebrow: 'Lesson 1',
    title: 'Take the shortest legal step',
    setup: 'Your pawn starts near the bottom edge and races upward.',
    prompt: 'Which move advances toward the goal without breaking movement rules?',
    state: baseState(),
    choices: [
      {
        id: 'forward',
        label: 'Move to column 5, row 8',
        action: { type: 'move', targetPos: { x: 4, y: 7 } },
        isAnswer: true,
        expectedValid: true,
        successText: 'Correct. A one-square orthogonal step toward the goal is legal.',
        mistakeText: 'That should have been legal. Check the pawn position and target square.',
      },
      {
        id: 'double-step',
        label: 'Move two squares forward',
        action: { type: 'move', targetPos: { x: 4, y: 6 } },
        isAnswer: false,
        expectedValid: false,
        successText: 'The engine rejects this because you cannot move two squares unless you are jumping a rival.',
        mistakeText: 'That move should be rejected because no rival is being jumped.',
      },
    ],
  },
  {
    id: 'place-fence',
    eyebrow: 'Lesson 2',
    title: 'Place a legal fence',
    setup: 'A fence crosses two gaps and can slow a rival route.',
    prompt: 'Which fence placement is legal on this board?',
    state: baseState({
      fences: [fence({ id: getFenceId(2, 3, 'V'), x: 2, y: 3, orientation: 'V' })],
    }),
    choices: [
      {
        id: 'open-anchor',
        label: 'Horizontal fence at 4, 5',
        action: { type: 'fence', x: 4, y: 5, orientation: 'H' },
        isAnswer: true,
        expectedValid: true,
        successText: 'Correct. The fence fits and both goals remain reachable.',
        mistakeText: 'That fence should be legal because it does not overlap, cross, or trap.',
      },
      {
        id: 'cross-anchor',
        label: 'Horizontal fence crossing the existing fence',
        action: { type: 'fence', x: 2, y: 3, orientation: 'H' },
        isAnswer: false,
        expectedValid: false,
        successText: 'The engine rejects this because fences cannot cross at the same anchor.',
        mistakeText: 'That should be rejected because it crosses an existing vertical fence.',
      },
    ],
  },
  {
    id: 'jump-rival',
    eyebrow: 'Lesson 3',
    title: 'Jump when face to face',
    setup: 'Your rival is directly in front of you and the space behind them is open.',
    prompt: 'Which move uses the jump rule?',
    state: baseState({
      players: {
        player1: { id: 'oak-student', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'oak-rival', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
      },
    }),
    choices: [
      {
        id: 'straight-jump',
        label: 'Jump to the square behind the rival',
        action: { type: 'move', targetPos: { x: 4, y: 6 } },
        isAnswer: true,
        expectedValid: true,
        successText: 'Correct. A straight jump is legal when the landing square is open.',
        mistakeText: 'That jump should be legal because the rival is adjacent and the lane is open.',
      },
      {
        id: 'step-onto-rival',
        label: 'Step onto the rival square',
        action: { type: 'move', targetPos: { x: 4, y: 7 } },
        isAnswer: false,
        expectedValid: false,
        successText: 'The engine rejects this because you jump over rivals; you never land on them.',
        mistakeText: 'That should be rejected because pawns cannot share a square.',
      },
    ],
  },
  {
    id: 'dodge-rival',
    eyebrow: 'Lesson 4',
    title: 'Dodge when the jump is blocked',
    setup: 'A fence blocks the square behind the rival, so the straight jump is unavailable.',
    prompt: 'Which diagonal dodge is legal?',
    state: baseState({
      players: {
        player1: { id: 'oak-student', pos: { x: 4, y: 8 }, fencesLeft: 10, type: 'Normal' },
        player2: { id: 'oak-rival', pos: { x: 4, y: 7 }, fencesLeft: 10, type: 'Normal' },
      },
      fences: [fence({ id: getFenceId(4, 6, 'H'), x: 4, y: 6, orientation: 'H' })],
    }),
    choices: [
      {
        id: 'left-dodge',
        label: 'Dodge diagonally left',
        action: { type: 'move', targetPos: { x: 3, y: 7 } },
        isAnswer: true,
        expectedValid: true,
        successText: 'Correct. A diagonal dodge is legal because the straight jump is blocked.',
        mistakeText: 'That dodge should be legal in this blocked-jump setup.',
      },
      {
        id: 'blocked-straight',
        label: 'Try the blocked straight jump',
        action: { type: 'move', targetPos: { x: 4, y: 6 } },
        isAnswer: false,
        expectedValid: false,
        successText: 'The engine rejects this because the fence blocks the straight jump landing.',
        mistakeText: 'That should be rejected because the fence blocks the jump.',
      },
    ],
  },
  {
    id: 'trap-rule',
    eyebrow: 'Lesson 5',
    title: 'Respect the open path rule',
    setup: 'A wall is almost closed. One gap still lets Player 1 reach the goal.',
    prompt: 'What happens if you close the final gap?',
    state: baseState({
      fences: wallWithGapAt4(6),
    }),
    choices: [
      {
        id: 'seal-gap',
        label: 'Place the fence that seals the last gap',
        action: { type: 'fence', x: 4, y: 6, orientation: 'H' },
        isAnswer: true,
        expectedValid: false,
        successText: 'Correct. That fence is illegal because it removes the last route.',
        mistakeText: 'That should be rejected by the path-preservation rule.',
      },
      {
        id: 'different-fence',
        label: 'Place a fence away from the wall',
        action: { type: 'fence', x: 1, y: 4, orientation: 'H' },
        isAnswer: false,
        expectedValid: true,
        successText: 'The engine accepts this, but it does not test the final-gap trap.',
        mistakeText: 'That fence should be legal because it does not seal the final gap.',
      },
    ],
  },
] as const satisfies readonly GuidedPracticeLesson[]

export function validateGuidedPracticeChoice(
  lessonId: string,
  choiceId: string,
): GuidedPracticeResult {
  const lesson = GUIDED_PRACTICE_LESSONS.find((candidate) => candidate.id === lessonId)
  const choice = lesson?.choices.find((candidate) => candidate.id === choiceId)

  if (!lesson || !choice) {
    return {
      valid: false,
      isCorrect: false,
      feedback: 'Professor Oak cannot find that practice prompt.',
      reason: 'Unknown guided practice choice',
    }
  }

  if (choice.action.type === 'move') {
    const result = validateMove(lesson.state.turn, choice.action.targetPos, lesson.state)
    const matchesExpectedValidity = result.valid === choice.expectedValid
    return {
      valid: result.valid,
      isCorrect: matchesExpectedValidity && choice.isAnswer,
      feedback: matchesExpectedValidity ? choice.successText : choice.mistakeText,
      reason: result.reason,
    }
  }

  const result = validateFencePlacement(
    lesson.state.turn,
    choice.action.x,
    choice.action.y,
    choice.action.orientation,
    lesson.state,
  )

  const matchesExpectedValidity = result.valid === choice.expectedValid

  return {
    valid: result.valid,
    isCorrect: matchesExpectedValidity && choice.isAnswer,
    feedback:
      matchesExpectedValidity
        ? `${choice.successText} ${fenceValidationSummary(result)}`
        : `${choice.mistakeText} ${fenceValidationSummary(result)}`,
    reason: result.reason,
  }
}

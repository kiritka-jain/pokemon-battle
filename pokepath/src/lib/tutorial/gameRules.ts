/** One rule per swipeable slide (Quoridor-style path game). */
export const GAME_RULE_SLIDES = [
  'Reach the opposite side of the board before your opponent.',
  'On your turn, move your pawn to an adjacent valid square.',
  'Or place a fence to slow your opponent — if you still have fences left.',
  'A legal path to each goal must always remain open.',
] as const

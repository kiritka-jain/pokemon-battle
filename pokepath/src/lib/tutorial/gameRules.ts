export type GameRuleSlide = {
  title: string
  body: string
}

/** One rule per swipeable slide (Quoridor-style path game). */
export const GAME_RULE_SLIDES = [
  {
    title: 'Win The Route Race',
    body: 'Reach the opposite side of the board before your opponent reaches yours. Player 1 races upward; Player 2 races downward.',
  },
  {
    title: 'Move One Safe Step',
    body: 'Most turns are a one-square move up, down, left, or right. Blue dots on the board show legal destinations when it is your turn.',
  },
  {
    title: 'Spend Fences Carefully',
    body: 'Instead of moving, you may place one fence across two gaps. Fences slow routes, but each trainer only gets ten.',
  },
  {
    title: 'Jump Over Rivals',
    body: 'When Pokemon stand face to face and the space behind the rival is open, jump straight over them.',
  },
  {
    title: 'Dodge Around Blocks',
    body: 'If the rival is beside you and a fence blocks the straight jump, you may dodge diagonally around them.',
  },
  {
    title: 'Never Seal The Board',
    body: 'Every fence must leave at least one path to each goal. A fence that traps either player is illegal.',
  },
] as const satisfies readonly GameRuleSlide[]

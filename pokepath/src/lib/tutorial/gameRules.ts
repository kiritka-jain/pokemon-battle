export type GameRuleSlide = {
  title: string
  body: string
  takeaway: string
}

export type StrategyGuideItem = {
  title: string
  body: string
}

/** One rule per swipeable slide (Quoridor-style path game). */
export const GAME_RULE_SLIDES = [
  {
    title: 'Win The Route Race',
    body: 'Reach the opposite side of the board before your opponent reaches yours. Player 1 races upward; Player 2 races downward.',
    takeaway: 'Keep your shortest path in mind every turn.',
  },
  {
    title: 'Move One Safe Step',
    body: 'Most turns are a one-square move up, down, left, or right. Blue dots on the board show legal destinations when it is your turn.',
    takeaway: 'If a fence blocks the gap, that square is not reachable.',
  },
  {
    title: 'Spend Fences Carefully',
    body: 'Instead of moving, you may place one fence across two gaps. Fences slow routes, but each trainer only gets ten.',
    takeaway: 'A fence is strongest when it lengthens your rival route more than yours.',
  },
  {
    title: 'Jump Over Rivals',
    body: 'When pawns stand face to face and the space behind the rival is open, jump straight over them.',
    takeaway: 'A jump can turn a blocked lane into a fast lane.',
  },
  {
    title: 'Dodge Around Blocks',
    body: 'If the rival is beside you and a fence blocks the straight jump, you may dodge diagonally around them.',
    takeaway: 'Diagonal moves are special jump dodges, not normal movement.',
  },
  {
    title: 'Never Seal The Board',
    body: 'Every fence must leave at least one path to each goal. A fence that traps either player is illegal.',
    takeaway: 'Blocking is allowed; trapping every route is not.',
  },
  {
    title: 'Confirm The Turn',
    body: 'Choose a move or fence, check the preview, then confirm it. You can change your pending action before confirming.',
    takeaway: 'Preview first, commit when the route looks right.',
  },
] as const satisfies readonly GameRuleSlide[]

export const STRATEGY_GUIDE = [
  {
    title: 'Count shortest paths',
    body: 'Before spending a fence, compare your quickest route with your rival quickest route.',
  },
  {
    title: 'Do not panic fence',
    body: 'A late fence is valuable only if it changes the race. Sometimes moving keeps tempo better.',
  },
  {
    title: 'Avoid walling yourself in',
    body: 'Fences affect both trainers. Leave yourself a clean exit before building a long wall.',
  },
  {
    title: 'Watch jump threats',
    body: 'Standing directly in front of a rival can give them a free jump unless a fence changes the lane.',
  },
] as const satisfies readonly StrategyGuideItem[]

export type GameRuleSlide = {
  title: string
  body: string
  caption?: string
  imageSrc?: string
  imageAlt?: string
}

/** One rule per swipeable slide (Quoridor-style path game). */
export const GAME_RULE_SLIDES = [
  {
    title: 'Win the race',
    body: 'Reach your far row before your opponent reaches theirs.',
    caption: 'Player 1 races up; Player 2 races down.',
  },
  {
    title: 'Move one step',
    body: 'Each turn, step one square up, down, left, or right.',
    caption: 'Dots show where you can step.',
    imageSrc: '/tutorial/rules/move-orthogonal.png',
    imageAlt:
      'Top-down grid with a Pokémon in the middle and green dots on the four side squares only.',
  },
  {
    title: 'Place fences',
    body: 'Instead of moving, place one fence across two gaps—you each have ten.',
  },
  {
    title: 'Jump over',
    body: 'If you face an opponent and the square behind them is empty, jump straight over.',
  },
  {
    title: 'Dodge around',
    body: 'If a fence blocks the straight jump, step diagonally around them instead.',
  },
  {
    title: 'Keep paths open',
    body: 'Your fence cannot cut off every path to a goal.',
    caption: 'Both players must always have a way to reach their goal row.',
    imageSrc: '/tutorial/rules/board-paths-overview.png',
    imageAlt:
      'Grass board with two Pokémon and bright lines along the grid showing possible routes.',
  },
] satisfies readonly GameRuleSlide[]

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
    imageSrc: '/tutorial/rules/win-the-race.png',
    imageAlt:
      'Nine-by-nine grass board with Charizard on the goal row and Snorlax below with move dots on adjacent squares.',
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
    body: 'Instead of moving, place one fence horizontally or vertically across two gaps—you each have ten.',
    imageSrc: '/tutorial/rules/place-fences.png',
    imageAlt:
      'Grass grid with Pikachu and two glowing fence segments forming a T along the grid lines.',
  },
  {
    title: 'Jump over',
    body: 'If you face an opponent and the square behind them is empty, jump straight over.',
    imageSrc: '/tutorial/rules/jump-over.png',
    imageAlt:
      'Grass grid with Bulbasaur above Diglett; green move dots include the square straight past Diglett.',
  },
  {
    title: 'Dodge around',
    body: 'If a fence blocks the straight jump, step diagonally around them instead.',
    imageSrc: '/tutorial/rules/dodge-around.png',
    imageAlt:
      'Grass board with Snorlax and Ponyta near fences; green dots show possible moves around obstacles.',
  },
  {
    title: 'Keep paths open',
    body: 'Your fence cannot cut off every path to a goal.',
    caption: 'Both players must always have a way to reach their goal row.',
    imageSrc: '/tutorial/rules/keep-paths-open.png',
    imageAlt:
      'Grass grid with Ponyta and a bright highlighted route along the grid lines.',
  },
] satisfies readonly GameRuleSlide[]

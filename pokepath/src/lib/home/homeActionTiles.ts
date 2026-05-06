export type HomeActionTileAccent = 'yellow' | 'emerald' | 'indigo'

export type HomeActionTile = {
  href: string
  title: string
  description: string
  accent: HomeActionTileAccent
}

export function homeActionTiles(isAuthed: boolean): HomeActionTile[] {
  return [
    {
      href: '/tutorial',
      title: 'Know the rules',
      description:
        'Learn the route-racing rules, fence limits, jumps, and the path-of-hope rule before your first duel.',
      accent: 'yellow',
    },
    {
      href: '/pick?continue=/play/vs-computer',
      title: 'Play with computer',
      description:
        'Choose your team, then play a full route duel against a local AI with difficulty levels and undo—no ranked impact.',
      accent: 'emerald',
    },
    {
      href: isAuthed ? '/lobby' : '/login?redirect=/lobby',
      title: isAuthed ? 'Challenge a friend' : 'Sign in to challenge a friend',
      description: isAuthed
        ? 'Enter the lobby to find opponents, track your Elo, and play online.'
        : 'Sign in to enter the lobby, find route duels, and challenge other trainers.',
      accent: 'indigo',
    },
  ]
}

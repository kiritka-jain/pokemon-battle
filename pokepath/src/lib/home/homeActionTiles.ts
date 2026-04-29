export type HomeActionTileAccent = 'yellow' | 'emerald' | 'red' | 'indigo'

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
      href: '/play/vs-computer',
      title: 'Play with computer',
      description:
        'Play a full route duel against a local AI with difficulty levels and undo—no ranked impact.',
      accent: 'emerald',
    },
    {
      href: isAuthed ? '/pick' : '/login?redirect=/pick',
      title: isAuthed ? 'Choose your Pokémon' : 'Sign in to choose your Pokémon',
      description: isAuthed
        ? 'Open two of three Pokéballs and pick the Pokémon who will represent you on the route.'
        : 'Sign in to open two of three Pokéballs and pick your Pokémon for the route.',
      accent: 'red',
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

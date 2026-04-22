export type StarterSpecies = {
  id: string
  displayName: string
  typeLabel: string
  /** Shown when `imageSrc` is absent. */
  emoji: string
  /** Optional path under `public/` (e.g. `/pokemon/charmander.png`). */
  imageSrc?: string
}

/**
 * Starter pool: stable `id` for storage, `displayName` matches bundled art where possible.
 * When `imageSrc` is set, the pick UI shows the image after opening a ball (emoji is fallback only).
 */
export const STARTER_SPECIES: readonly StarterSpecies[] = [
  {
    id: 'charmander',
    displayName: 'Charmander',
    typeLabel: 'Fire',
    emoji: '🔥',
    imageSrc: '/pokemon/charmander.png',
  },
  {
    id: 'Horsea',
    displayName: 'Horsea',
    typeLabel: 'Water',
    emoji: '💧',
    imageSrc: '/pokemon/horsea.png',
  },
  {
    id: 'Bulbasaur',
    displayName: 'Bulbasaur',
    typeLabel: 'Grass',
    emoji: '🌿',
    imageSrc: '/pokemon/bulbasaur.png',
  },
  {
    id: 'pidgey',
    displayName: 'Pidgey',
    typeLabel: 'Air',
    emoji: '🌪️',
    imageSrc: '/pokemon/pidgey.png',
  },
  {
    id: 'pikachu',
    displayName: 'Pikachu',
    typeLabel: 'Electric',
    emoji: '⚡',
    imageSrc: '/pokemon/pikachu.png',
  },
  {
    id: 'onix',
    displayName: 'Onix',
    typeLabel: 'Rock',
    emoji: '🪨',
    imageSrc: '/pokemon/onix.png',
  },
  {
    id: 'jigglypuff',
    displayName: 'Jigglypuff',
    typeLabel: 'Ice',
    emoji: '❄️',
    imageSrc: '/pokemon/jigglypuff.png',
  },
  {
    id: 'oddish',
    displayName: 'Oddish',
    typeLabel: 'grass',
    emoji: '🦋',
    imageSrc: '/pokemon/oddish.png',
  },
  {
    id: 'raticate',
    displayName: 'Raticate',
    typeLabel: 'Dark',
    emoji: '🌑',
    imageSrc: '/pokemon/raticate.png',
  },
  {
    id: 'snorlax',
    displayName: 'Snorlax',
    typeLabel: 'Steel',
    emoji: '⚙️',
    imageSrc: '/pokemon/snorlax.png',
  },
  {
    id: 'meowth',
    displayName: 'Meowth',
    typeLabel: 'Fighting',
    emoji: '🥊',
    imageSrc: '/pokemon/meowth.png',
  },
  {
    id: 'psyduck',
    displayName: 'Psyduck',
    typeLabel: 'Psychic',
    emoji: '🔮',
    imageSrc: '/pokemon/psyduck.png',
  },
  {
    id: 'ponyta',
    displayName: 'Ponyta',
    typeLabel: 'Ground',
    emoji: '🏜️',
    imageSrc: '/pokemon/ponyta.png',
  },
  {
    id: 'arbok',
    displayName: 'Arbok',
    typeLabel: 'Poison',
    emoji: '☠️',
    imageSrc: '/pokemon/arbok.png',
  },
  {
    id: 'charlizard',
    displayName: 'Charizard',
    typeLabel: 'Dragon',
    emoji: '🐉',
    imageSrc: '/pokemon/charlizard.png',
  },
  {
    id: 'golduck',
    displayName: 'Golduck',
    typeLabel: 'Water',
    emoji: '💧',
    imageSrc: '/pokemon/golduck.png',
  },
  {
    id: 'zubat',
    displayName: 'Zubat',
    typeLabel: 'Poison',
    emoji: '🦇',
    imageSrc: '/pokemon/zubat.png',
  },
  {
    id: 'diglett',
    displayName: 'Diglett',
    typeLabel: 'Ground',
    emoji: '🏜️',
    imageSrc: '/pokemon/diglett.png',
  },
] as const

const byId = new Map(STARTER_SPECIES.map((s) => [s.id, s]))

export function starterSpeciesById(id: string): StarterSpecies | undefined {
  return byId.get(id)
}

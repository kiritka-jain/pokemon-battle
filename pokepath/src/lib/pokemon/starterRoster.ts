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
 * Fifteen roster entries: stable `id` for storage, `displayName` matches bundled art.
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
    id: 'tidekit',
    displayName: 'Horsea',
    typeLabel: 'Water',
    emoji: '💧',
    imageSrc: '/pokemon/tidekit.png',
  },
  {
    id: 'leaflet',
    displayName: 'Bulbasaur',
    typeLabel: 'Grass',
    emoji: '🌿',
    imageSrc: '/pokemon/leaflet.png',
  },
  {
    id: 'galewing',
    displayName: 'Pidgey',
    typeLabel: 'Air',
    emoji: '🌪️',
    imageSrc: '/pokemon/galewing.png',
  },
  {
    id: 'shockeroo',
    displayName: 'Pikachu',
    typeLabel: 'Electric',
    emoji: '⚡',
    imageSrc: '/pokemon/shockeroo.png',
  },
  {
    id: 'pebblehoof',
    displayName: 'Onix',
    typeLabel: 'Rock',
    emoji: '🪨',
    imageSrc: '/pokemon/pebblehoof.png',
  },
  {
    id: 'frostnip',
    displayName: 'Jigglypuff',
    typeLabel: 'Ice',
    emoji: '❄️',
    imageSrc: '/pokemon/frostnip.png',
  },
  {
    id: 'moonmoth',
    displayName: 'Oddish',
    typeLabel: 'Bug',
    emoji: '🦋',
    imageSrc: '/pokemon/moonmoth.png',
  },
  {
    id: 'shadekit',
    displayName: 'Raticate',
    typeLabel: 'Dark',
    emoji: '🌑',
    imageSrc: '/pokemon/shadekit.png',
  },
  {
    id: 'steelpin',
    displayName: 'Snorlax',
    typeLabel: 'Steel',
    emoji: '⚙️',
    imageSrc: '/pokemon/steelpin.png',
  },
  {
    id: 'brawnyeti',
    displayName: 'Meowth',
    typeLabel: 'Fighting',
    emoji: '🥊',
    imageSrc: '/pokemon/brawnyeti.png',
  },
  {
    id: 'mystquill',
    displayName: 'Psyduck',
    typeLabel: 'Psychic',
    emoji: '🔮',
    imageSrc: '/pokemon/mystquill.png',
  },
  {
    id: 'dustdevil',
    displayName: 'Ponyta',
    typeLabel: 'Ground',
    emoji: '🏜️',
    imageSrc: '/pokemon/dustdevil.png',
  },
  {
    id: 'toxling',
    displayName: 'Arbok',
    typeLabel: 'Poison',
    emoji: '☠️',
    imageSrc: '/pokemon/toxling.png',
  },
  {
    id: 'dragoonet',
    displayName: 'Charizard',
    typeLabel: 'Dragon',
    emoji: '🐉',
    imageSrc: '/pokemon/dragoonet.png',
  },
] as const

const byId = new Map(STARTER_SPECIES.map((s) => [s.id, s]))

export function starterSpeciesById(id: string): StarterSpecies | undefined {
  return byId.get(id)
}

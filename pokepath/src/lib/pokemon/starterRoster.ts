export type StarterSpecies = {
  id: string
  displayName: string
  typeLabel: string
  emoji: string
}

/** Fifteen original species for the three-ball draft (no third-party trademarks). */
export const STARTER_SPECIES: readonly StarterSpecies[] = [
  { id: 'cinderpaw', displayName: 'Cinderpaw', typeLabel: 'Fire', emoji: '🔥' },
  { id: 'tidekit', displayName: 'Tidekit', typeLabel: 'Water', emoji: '💧' },
  { id: 'leaflet', displayName: 'Leaflet', typeLabel: 'Grass', emoji: '🌿' },
  { id: 'galewing', displayName: 'Galewing', typeLabel: 'Air', emoji: '🌪️' },
  { id: 'shockeroo', displayName: 'Shockeroo', typeLabel: 'Electric', emoji: '⚡' },
  { id: 'pebblehoof', displayName: 'Pebblehoof', typeLabel: 'Rock', emoji: '🪨' },
  { id: 'frostnip', displayName: 'Frostnip', typeLabel: 'Ice', emoji: '❄️' },
  { id: 'moonmoth', displayName: 'Moonmoth', typeLabel: 'Bug', emoji: '🦋' },
  { id: 'shadekit', displayName: 'Shadekit', typeLabel: 'Dark', emoji: '🌑' },
  { id: 'steelpin', displayName: 'Steelpin', typeLabel: 'Steel', emoji: '⚙️' },
  { id: 'brawnyeti', displayName: 'Brawnyeti', typeLabel: 'Fighting', emoji: '🥊' },
  { id: 'mystquill', displayName: 'Mystquill', typeLabel: 'Psychic', emoji: '🔮' },
  { id: 'dustdevil', displayName: 'Dustdevil', typeLabel: 'Ground', emoji: '🏜️' },
  { id: 'toxling', displayName: 'Toxling', typeLabel: 'Poison', emoji: '☠️' },
  { id: 'dragoonet', displayName: 'Dragoonet', typeLabel: 'Dragon', emoji: '🐉' },
] as const

const byId = new Map(STARTER_SPECIES.map((s) => [s.id, s]))

export function starterSpeciesById(id: string): StarterSpecies | undefined {
  return byId.get(id)
}

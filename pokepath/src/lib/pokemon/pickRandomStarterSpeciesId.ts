import { STARTER_SPECIES } from '@/src/lib/pokemon/starterRoster'

export function pickRandomStarterSpeciesId(): string {
  const i = Math.floor(Math.random() * STARTER_SPECIES.length)
  return STARTER_SPECIES[i]?.id ?? 'charmander'
}

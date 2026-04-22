/** Unit-testable RNG: returns a float in [0, 1). */
export type Random01 = () => number

/**
 * Picks three distinct entries from `roster` using partial Fisher–Yates on a copy.
 * @throws if roster has fewer than three items
 */
export function sampleThreeFromRoster<T>(
  roster: readonly T[],
  random01: Random01 = Math.random,
): [T, T, T] {
  if (roster.length < 3) {
    throw new Error('sampleThreeFromRoster: roster must contain at least 3 items')
  }

  const copy = [...roster]
  for (let i = 0; i < 3; i++) {
    const j = i + Math.floor(random01() * (copy.length - i))
    const a = copy[i]
    const b = copy[j]
    if (a === undefined || b === undefined) {
      throw new Error('sampleThreeFromRoster: unexpected empty slot')
    }
    copy[i] = b
    copy[j] = a
  }

  const a0 = copy[0]
  const a1 = copy[1]
  const a2 = copy[2]
  if (a0 === undefined || a1 === undefined || a2 === undefined) {
    throw new Error('sampleThreeFromRoster: missing first three picks')
  }
  return [a0, a1, a2]
}

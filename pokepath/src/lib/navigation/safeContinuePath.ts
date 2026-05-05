/**
 * Validates a post-`/pick` redirect target: same-origin path only, no open redirects.
 * Allowed: `/play`, `/play/vs-computer`, `/lobby`, `/match/:id` (single path segment after match).
 */
const EXACT_ALLOWED = new Set(['/play', '/play/vs-computer', '/lobby'])

export function safeInternalContinuePath(raw: string | null | undefined): string | null {
  if (raw == null || raw === '') return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (trimmed.includes('\\')) return null

  const pathOnly = trimmed.split('?')[0]!.split('#')[0]!
  if (!pathOnly.startsWith('/') || pathOnly.startsWith('//')) return null

  const normalized = pathOnly.length > 1 && pathOnly.endsWith('/') ? pathOnly.slice(0, -1) : pathOnly

  if (EXACT_ALLOWED.has(normalized)) return normalized

  if (normalized.startsWith('/match/')) {
    const rest = normalized.slice('/match/'.length)
    if (rest.length === 0 || rest.includes('/')) return null
    return normalized
  }

  return null
}

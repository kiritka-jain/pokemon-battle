import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Derives a unique profiles.username from auth user metadata.
 * Keeps logic aligned with `handle_new_user` in supabase migrations, plus a stable id suffix
 * so UNIQUE(username) never conflicts when names duplicate.
 */
export function derivedProfileUsername(user: User): string {
  const meta = user.user_metadata ?? {}
  const fullName = typeof meta.full_name === 'string' ? meta.full_name.trim() : ''
  const name = typeof meta.name === 'string' ? meta.name.trim() : ''
  const slug = user.id.replace(/-/g, '')
  const base =
    fullName !== '' ? fullName : name !== '' ? name : `Trainer_${slug.slice(0, 8)}`
  return `${base.slice(0, 100)}_${slug}`
}

/**
 * Ensures a row exists in public.profiles for the given auth user id (service-role client).
 */
export async function ensureProfileForUserId(
  admin: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: selErr } = await admin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (selErr) {
    return { ok: false, error: selErr.message }
  }
  if (existing) {
    return { ok: true }
  }

  const { data: adminData, error: authErr } = await admin.auth.admin.getUserById(userId)
  if (authErr || !adminData.user) {
    return { ok: false, error: authErr?.message ?? 'Auth user not found' }
  }

  const username = derivedProfileUsername(adminData.user)
  const { error: insErr } = await admin.from('profiles').insert({ id: userId, username })

  if (!insErr) {
    return { ok: true }
  }

  if (String(insErr.code) === '23505') {
    const fallback = `Trainer_${userId.replace(/-/g, '')}`
    const { error: insErr2 } = await admin.from('profiles').insert({ id: userId, username: fallback })
    if (!insErr2) {
      return { ok: true }
    }
    return { ok: false, error: insErr2.message }
  }

  return { ok: false, error: insErr.message }
}

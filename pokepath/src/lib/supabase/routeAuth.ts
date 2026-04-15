import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function createBearerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Resolve the Supabase user from `Authorization: Bearer <access_token>`. */
export async function getUserFromBearer(authHeader: string | null) {
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return { user: null as null }

  const supabase = createBearerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)
  if (error || !user) return { user: null as null }
  return { user }
}

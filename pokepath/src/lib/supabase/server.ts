import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using service role key
// WARNING: Only use this in server-side code (API routes, server components)
// NEVER expose the service role key to the client

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables')
}

// Server client with elevated permissions
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function for server-side operations that require admin privileges
export const createServerSupabaseClient = (context?: any) => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
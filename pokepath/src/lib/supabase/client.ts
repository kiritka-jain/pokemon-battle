import { createClient } from '@supabase/supabase-js'

// Browser-safe Supabase client using public environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to check if Supabase is properly configured
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('_supabase_health').select('*').limit(1)
    // Missing table/relation is expected; PostgREST codes vary by version (e.g. PGRST116, PGRST205).
    const missingRelation =
      error?.code === 'PGRST116' ||
      error?.code === 'PGRST205' ||
      (error?.message?.includes('schema cache') ?? false)
    if (error && !missingRelation) {
      throw error
    }
    return { success: true, message: 'Supabase connection successful' }
  } catch (error) {
    return { success: false, message: `Supabase connection failed: ${error}` }
  }
}
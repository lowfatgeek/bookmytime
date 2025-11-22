import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create a client specifically for anonymous operations (like public bookings)
// This client doesn't use any authentication context
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'bookmytime-anon'
        }
      }
    }
  )
}

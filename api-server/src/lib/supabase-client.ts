import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let serviceClient: SupabaseClient | null = null
let anonClient: SupabaseClient | null = null

/**
 * Returns a lazily-initialized singleton Supabase client using the service role key
 * (falls back to anon key if service role key is not set).
 * Suitable for admin/backend operations that need to bypass RLS.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!serviceClient) {
    const url = process.env.VITE_SUPABASE_URL!
    const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
    serviceClient = createClient(url, key)
  }
  return serviceClient
}

/**
 * Returns a lazily-initialized singleton Supabase client using the anon key only.
 * Suitable for auth middleware use cases (token verification).
 */
export function getSupabaseAnonClient(): SupabaseClient {
  if (!anonClient) {
    const url = process.env.VITE_SUPABASE_URL!
    const key = process.env.VITE_SUPABASE_ANON_KEY!
    anonClient = createClient(url, key)
  }
  return anonClient
}

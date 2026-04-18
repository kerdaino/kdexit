import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"

export function createSupabaseClient(): SupabaseClient<Database> {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

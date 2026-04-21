import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseEnv } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"

export function createSupabaseClient(): SupabaseClient<Database> {
  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv()

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey)
}

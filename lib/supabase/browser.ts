import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

let browserClient: SupabaseClient<Database> | undefined

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createSupabaseClient()
  }

  return browserClient
}

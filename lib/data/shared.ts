import type { SupabaseClient, User } from "@supabase/supabase-js"
import { isSupabaseStrategyExecutionMode } from "@/lib/data/config"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"
import type { Database } from "@/lib/supabase/types"

export type DataAccessResult<T> = {
  data: T
  error: string | null
  isPlaceholder: boolean
}

export function buildPlaceholderResult<T>(data: T): DataAccessResult<T> {
  return {
    data,
    error: null,
    isPlaceholder: true,
  }
}

export function buildDatabaseResult<T>(data: T): DataAccessResult<T> {
  return {
    data,
    error: null,
    isPlaceholder: false,
  }
}

export function buildErrorResult<T>(data: T, error: string): DataAccessResult<T> {
  return {
    data,
    error,
    isPlaceholder: false,
  }
}

export function getRequiredBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseStrategyExecutionMode()) {
    return null
  }

  try {
    return getSupabaseBrowserClient()
  } catch {
    return null
  }
}

export async function getAuthenticatedBrowserUser(
  client: SupabaseClient<Database>
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export function getIsoTimestamp() {
  return new Date().toISOString()
}

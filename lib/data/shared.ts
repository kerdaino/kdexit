import type { SupabaseClient } from "@supabase/supabase-js"
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

export function getOptionalBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseStrategyExecutionMode()) {
    return null
  }

  try {
    return getSupabaseBrowserClient()
  } catch {
    return null
  }
}

export function createRecordId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `stub-${Date.now()}`
}

export function getIsoTimestamp() {
  return new Date().toISOString()
}

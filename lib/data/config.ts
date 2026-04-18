import { hasSupabaseEnv } from "@/lib/supabase/env"

export type StrategyExecutionDataMode = "localStorage" | "supabase"

function readDataModeFlag() {
  return process.env.NEXT_PUBLIC_STRATEGY_DATA_MODE
}

export function getStrategyExecutionDataMode(): StrategyExecutionDataMode {
  const configuredMode = readDataModeFlag()

  if (configuredMode === "supabase" && hasSupabaseEnv()) {
    return "supabase"
  }

  return "localStorage"
}

export function isSupabaseStrategyExecutionMode() {
  return getStrategyExecutionDataMode() === "supabase"
}

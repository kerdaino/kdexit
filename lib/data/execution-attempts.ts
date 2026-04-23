import {
  buildDatabaseResult,
  buildErrorResult,
  getAuthenticatedBrowserUser,
  getRequiredBrowserClient,
  type DataAccessResult,
} from "@/lib/data/shared"
import type {
  ExecutionAttemptRecord,
} from "@/types/database-records"

type ExecutionAttemptListMode = "all" | "simulation" | "live"

type ListExecutionAttemptsOptions = {
  strategyId?: string
  mode?: ExecutionAttemptListMode
}

export async function listExecutionAttempts(
  options: ListExecutionAttemptsOptions = {}
): Promise<DataAccessResult<ExecutionAttemptRecord[]>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult([], "Supabase execution attempt mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult([], "You must be signed in to load execution attempts.")
  }

  let query = client
    .from("execution_attempts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (options.strategyId) {
    query = query.eq("strategy_id", options.strategyId)
  }

  if (options.mode === "simulation") {
    query = query.eq("simulation_mode", true)
  }

  if (options.mode === "live") {
    query = query.eq("simulation_mode", false)
  }

  const { data, error } = await query

  if (error) {
    return buildErrorResult([], error.message)
  }

  return buildDatabaseResult(data)
}

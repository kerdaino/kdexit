import {
  buildDatabaseResult,
  buildErrorResult,
  getIsoTimestamp,
  getAuthenticatedBrowserUser,
  getRequiredBrowserClient,
  type DataAccessResult,
} from "@/lib/data/shared"
import type {
  ExecutionAttemptInsert,
  ExecutionAttemptRecord,
  ExecutionAttemptUpdate,
} from "@/types/database-records"

type ListExecutionAttemptsOptions = {
  strategyId?: string
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

  const { data, error } = await query

  if (error) {
    return buildErrorResult([], error.message)
  }

  return buildDatabaseResult(data)
}

export async function getExecutionAttempt(
  id: string
): Promise<DataAccessResult<ExecutionAttemptRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase execution attempt mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to load an execution attempt.")
  }

  const { data, error } = await client
    .from("execution_attempts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function createExecutionAttempt(
  input: ExecutionAttemptInsert
): Promise<DataAccessResult<ExecutionAttemptRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase execution attempt mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to create an execution attempt.")
  }

  const payload: ExecutionAttemptInsert = {
    ...input,
    user_id: user.id,
    status: input.status ?? "queued",
    simulation_mode: input.simulation_mode ?? true,
    attempt_number: input.attempt_number ?? 1,
    retry_count: input.retry_count ?? 0,
    failure_reason: input.failure_reason ?? null,
    transaction_hash: input.transaction_hash ?? null,
    updated_at: input.updated_at ?? getIsoTimestamp(),
  }

  const { data, error } = await client
    .from("execution_attempts")
    .insert(payload as never)
    .select()
    .single()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function updateExecutionAttempt(
  id: string,
  updates: ExecutionAttemptUpdate
): Promise<DataAccessResult<ExecutionAttemptRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase execution attempt mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to update an execution attempt.")
  }

  const { data, error } = await client
    .from("execution_attempts")
    .update(
      {
        ...updates,
        user_id: user.id,
        updated_at: updates.updated_at ?? getIsoTimestamp(),
      } as never
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function updateExecutionAttemptStatus(
  id: string,
  status: ExecutionAttemptUpdate["status"],
  options: Pick<ExecutionAttemptUpdate, "failure_reason" | "retry_count" | "transaction_hash"> = {}
): Promise<DataAccessResult<ExecutionAttemptRecord | null>> {
  return updateExecutionAttempt(id, {
    status,
    failure_reason: options.failure_reason,
    retry_count: options.retry_count,
    transaction_hash: options.transaction_hash,
  })
}

export async function recordExecutionAttemptFailure(
  id: string,
  failureReason: string,
  retryCount: number
): Promise<DataAccessResult<ExecutionAttemptRecord | null>> {
  return updateExecutionAttempt(id, {
    status: "failed",
    failure_reason: failureReason,
    retry_count: retryCount,
  })
}

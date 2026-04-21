import {
  buildDatabaseResult,
  buildErrorResult,
  getIsoTimestamp,
  getAuthenticatedBrowserUser,
  getRequiredBrowserClient,
  type DataAccessResult,
} from "@/lib/data/shared"
import type {
  ExecutionInsert,
  ExecutionRecord,
  ExecutionUpdate,
} from "@/types/database-records"

export async function listExecutions(): Promise<DataAccessResult<ExecutionRecord[]>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult([], "Supabase execution mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult([], "You must be signed in to load executions.")
  }

  const { data, error } = await client
    .from("executions")
    .select("*")
    .eq("user_id", user.id)
    .order("executed_at", { ascending: false })

  if (error) {
    return buildErrorResult([], error.message)
  }

  return buildDatabaseResult(data)
}

export async function getExecution(
  id: string
): Promise<DataAccessResult<ExecutionRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase execution mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to load an execution.")
  }

  const { data, error } = await client
    .from("executions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function createExecution(
  input: ExecutionInsert
): Promise<DataAccessResult<ExecutionRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase execution mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to create an execution.")
  }

  const payload: ExecutionInsert = {
    ...input,
    user_id: user.id,
    strategy_id: input.strategy_id ?? null,
    updated_at: input.updated_at ?? getIsoTimestamp(),
  }

  const { data, error } = await client
    .from("executions")
    .insert(payload as never)
    .select()
    .single()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function updateExecution(
  id: string,
  updates: ExecutionUpdate
): Promise<DataAccessResult<ExecutionRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase execution mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to update an execution.")
  }

  const { data, error } = await client
    .from("executions")
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

export async function deleteExecution(
  id: string
): Promise<DataAccessResult<{ id: string } | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase execution mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to delete an execution.")
  }

  const { error } = await client
    .from("executions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult({ id })
}

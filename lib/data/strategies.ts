import {
  buildDatabaseResult,
  buildErrorResult,
  getIsoTimestamp,
  getAuthenticatedBrowserUser,
  getRequiredBrowserClient,
  type DataAccessResult,
} from "@/lib/data/shared"
import type {
  StrategyInsert,
  StrategyRecord,
  StrategyUpdate,
} from "@/types/database-records"

export async function listStrategies(): Promise<DataAccessResult<StrategyRecord[]>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult([], "Supabase strategy mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult([], "You must be signed in to load strategies.")
  }

  const { data, error } = await client
    .from("strategies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return buildErrorResult([], error.message)
  }

  return buildDatabaseResult(data)
}

export async function getStrategy(
  id: string
): Promise<DataAccessResult<StrategyRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase strategy mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to load a strategy.")
  }

  const { data, error } = await client
    .from("strategies")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function createStrategy(
  input: StrategyInsert
): Promise<DataAccessResult<StrategyRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase strategy mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to create a strategy.")
  }

  const payload: StrategyInsert = {
    ...input,
    user_id: user.id,
    token_address: input.token_address ?? "",
    trigger_enabled: input.trigger_enabled ?? true,
    notes: input.notes ?? null,
    updated_at: input.updated_at ?? getIsoTimestamp(),
  }

  const { data, error } = await client
    .from("strategies")
    .insert(payload as never)
    .select()
    .single()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function updateStrategy(
  id: string,
  updates: StrategyUpdate
): Promise<DataAccessResult<StrategyRecord | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase strategy mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to update a strategy.")
  }

  const { data, error } = await client
    .from("strategies")
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

export async function deleteStrategy(id: string): Promise<DataAccessResult<{ id: string } | null>> {
  const client = getRequiredBrowserClient()

  if (!client) {
    return buildErrorResult(null, "Supabase strategy mode is not enabled.")
  }

  const user = await getAuthenticatedBrowserUser(client)

  if (!user) {
    return buildErrorResult(null, "You must be signed in to delete a strategy.")
  }

  const { error } = await client
    .from("strategies")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult({ id })
}

export async function pauseStrategy(
  id: string
): Promise<DataAccessResult<StrategyRecord | null>> {
  return updateStrategy(id, { status: "paused", trigger_enabled: false })
}

export async function resumeStrategy(
  id: string
): Promise<DataAccessResult<StrategyRecord | null>> {
  return updateStrategy(id, { status: "active", trigger_enabled: true })
}

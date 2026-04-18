import {
  buildDatabaseResult,
  buildErrorResult,
  buildPlaceholderResult,
  createRecordId,
  getIsoTimestamp,
  getOptionalBrowserClient,
  type DataAccessResult,
} from "@/lib/data/shared"
import type {
  ExecutionInsert,
  ExecutionRecord,
  ExecutionUpdate,
} from "@/types/database-records"

function createPlaceholderExecution(input: ExecutionInsert): ExecutionRecord {
  const createdAt = input.created_at ?? getIsoTimestamp()

  return {
    id: input.id ?? createRecordId(),
    strategy_id: input.strategy_id,
    wallet_address: input.wallet_address,
    token_symbol: input.token_symbol,
    trigger_type: input.trigger_type,
    amount_sold: input.amount_sold ?? null,
    status: input.status ?? "pending",
    transaction_hash: input.transaction_hash ?? null,
    error_message: input.error_message ?? null,
    executed_at: input.executed_at ?? createdAt,
    created_at: createdAt,
  }
}

export async function listExecutions(): Promise<DataAccessResult<ExecutionRecord[]>> {
  const client = getOptionalBrowserClient()

  if (!client) {
    return buildPlaceholderResult([])
  }

  const { data, error } = await client
    .from("executions")
    .select("*")
    .order("executed_at", { ascending: false })

  if (error) {
    return buildErrorResult([], error.message)
  }

  return buildDatabaseResult(data)
}

export async function createExecution(
  input: ExecutionInsert
): Promise<DataAccessResult<ExecutionRecord | null>> {
  const client = getOptionalBrowserClient()

  if (!client) {
    return buildPlaceholderResult(createPlaceholderExecution(input))
  }

  const { data, error } = await client
    .from("executions")
    .insert(input as never)
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
  const client = getOptionalBrowserClient()

  if (!client) {
    return buildPlaceholderResult(null)
  }

  const { data, error } = await client
    .from("executions")
    .update(updates as never)
    .eq("id", id)
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
  const client = getOptionalBrowserClient()

  if (!client) {
    return buildPlaceholderResult({ id })
  }

  const { error } = await client.from("executions").delete().eq("id", id)

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult({ id })
}

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
  StrategyInsert,
  StrategyRecord,
  StrategyUpdate,
} from "@/types/database-records"

function createPlaceholderStrategy(input: StrategyInsert): StrategyRecord {
  const timestamp = input.created_at ?? getIsoTimestamp()

  return {
    id: input.id ?? createRecordId(),
    wallet_address: input.wallet_address,
    token_name: input.token_name,
    token_symbol: input.token_symbol,
    chain: input.chain,
    sell_percentage: input.sell_percentage,
    take_profit_price: input.take_profit_price ?? null,
    stop_loss_price: input.stop_loss_price ?? null,
    slippage: input.slippage,
    status: input.status ?? "active",
    created_at: timestamp,
    updated_at: input.updated_at ?? timestamp,
  }
}

export async function listStrategies(): Promise<DataAccessResult<StrategyRecord[]>> {
  const client = getOptionalBrowserClient()

  if (!client) {
    return buildPlaceholderResult([])
  }

  const { data, error } = await client
    .from("strategies")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return buildErrorResult([], error.message)
  }

  return buildDatabaseResult(data)
}

export async function createStrategy(
  input: StrategyInsert
): Promise<DataAccessResult<StrategyRecord | null>> {
  const client = getOptionalBrowserClient()

  if (!client) {
    return buildPlaceholderResult(createPlaceholderStrategy(input))
  }

  const payload: StrategyInsert = {
    ...input,
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
  const client = getOptionalBrowserClient()

  if (!client) {
    return buildPlaceholderResult(null)
  }

  const { data, error } = await client
    .from("strategies")
    .update(
      {
        ...updates,
        updated_at: updates.updated_at ?? getIsoTimestamp(),
      } as never
    )
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult(data)
}

export async function deleteStrategy(id: string): Promise<DataAccessResult<{ id: string } | null>> {
  const client = getOptionalBrowserClient()

  if (!client) {
    return buildPlaceholderResult({ id })
  }

  const { error } = await client.from("strategies").delete().eq("id", id)

  if (error) {
    return buildErrorResult(null, error.message)
  }

  return buildDatabaseResult({ id })
}

export async function pauseStrategy(
  id: string
): Promise<DataAccessResult<StrategyRecord | null>> {
  return updateStrategy(id, { status: "paused" })
}

export async function resumeStrategy(
  id: string
): Promise<DataAccessResult<StrategyRecord | null>> {
  return updateStrategy(id, { status: "active" })
}

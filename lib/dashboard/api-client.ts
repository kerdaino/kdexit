import type {
  ExecutionInsert,
  ExecutionRecord,
  StrategyInsert,
  StrategyRecord,
  StrategyUpdate,
} from "@/types/database-records"

type ApiSuccessResponse<T> = {
  ok: true
  data: T
  meta?: Record<string, unknown>
}

type ApiErrorResponse = {
  ok: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | ApiSuccessResponse<T>
    | ApiErrorResponse
    | null

  if (!response.ok) {
    const message =
      body && "ok" in body && body.ok === false
        ? body.error.message
        : "The request failed."

    throw new Error(message)
  }

  if (!body || !("ok" in body) || body.ok !== true) {
    throw new Error("The server returned an unexpected response.")
  }

  return body.data
}

export async function listStrategiesFromApi() {
  const response = await fetch("/api/strategies", {
    credentials: "same-origin",
  })

  return parseApiResponse<StrategyRecord[]>(response)
}

export async function createStrategyFromApi(input: StrategyInsert) {
  const response = await fetch("/api/strategies", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokenName: input.token_name,
      tokenSymbol: input.token_symbol,
      tokenAddress: input.token_address ?? "",
      chain: input.chain,
      chainId: input.chain_id,
      sellPercentage: input.sell_percentage,
      takeProfitPrice: input.take_profit_price ?? undefined,
      stopLossPrice: input.stop_loss_price ?? undefined,
      triggerEnabled: input.trigger_enabled ?? true,
      slippage: input.slippage,
      notes: input.notes ?? undefined,
      status: input.status ?? "active",
    }),
  })

  return parseApiResponse<StrategyRecord>(response)
}

export async function updateStrategyFromApi(id: string, updates: StrategyUpdate) {
  const response = await fetch(`/api/strategies/${id}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokenName: updates.token_name,
      tokenSymbol: updates.token_symbol,
      tokenAddress: updates.token_address,
      chain: updates.chain,
      chainId: updates.chain_id,
      sellPercentage: updates.sell_percentage,
      takeProfitPrice: updates.take_profit_price ?? undefined,
      stopLossPrice: updates.stop_loss_price ?? undefined,
      triggerEnabled: updates.trigger_enabled,
      slippage: updates.slippage,
      notes: updates.notes ?? undefined,
      status: updates.status,
    }),
  })

  return parseApiResponse<StrategyRecord>(response)
}

export async function deleteStrategyFromApi(id: string) {
  const response = await fetch(`/api/strategies/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
  })

  return parseApiResponse<{ id: string }>(response)
}

export async function listExecutionsFromApi() {
  const response = await fetch("/api/executions", {
    credentials: "same-origin",
  })

  return parseApiResponse<ExecutionRecord[]>(response)
}

export async function createExecutionFromApi(input: ExecutionInsert) {
  const amountSold =
    input.amount_sold === undefined || input.amount_sold === null
      ? ""
      : String(input.amount_sold)

  const response = await fetch("/api/executions", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokenSymbol: input.token_symbol,
      triggerType: input.trigger_type,
      amountSold,
      status: input.status ?? "pending",
    }),
  })

  return parseApiResponse<ExecutionRecord>(response)
}

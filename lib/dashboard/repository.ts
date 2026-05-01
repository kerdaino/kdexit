import {
  createExecution,
  createStrategy,
  deleteStrategy,
  listExecutionAttempts,
  listExecutions,
  listStrategies,
  pauseStrategy,
  resumeStrategy,
  updateStrategy,
} from "@/lib/data"
import { getStrategyChainEntryByLabel } from "@/lib/web3/chains"
import type {
  ExecutionAttemptRecord,
  ExecutionInsert,
  ExecutionRecord,
  StrategyInsert,
  StrategyRecord,
} from "@/types/database-records"
import { toExecutionAttempt, type ExecutionAttempt } from "@/types/automation"
import type { Execution, Strategy, TriggerType } from "@/types/strategy"

type DashboardExecutionInput = Omit<Execution, "id" | "executedAt"> & {
  id?: string
  executedAt?: string
  strategyId?: string
}

export function toDashboardStrategy(record: StrategyRecord): Strategy {
  const chainEntry = getStrategyChainEntryByLabel(record.chain)

  return {
    id: record.id,
    tokenAddress: record.token_address,
    tokenName: record.token_name,
    tokenSymbol: record.token_symbol,
    chain: record.chain,
    chainId: record.chain_id ?? chainEntry.chain.id,
    sellPercentage: record.sell_percentage,
    takeProfitPrice: record.take_profit_price ?? undefined,
    stopLossPrice: record.stop_loss_price ?? undefined,
    triggerEnabled: record.trigger_enabled,
    slippage: record.slippage,
    notes: record.notes ?? undefined,
    status: record.status,
    evaluationState: record.evaluation_state,
    lastEvaluatedAt: record.last_evaluated_at ?? undefined,
    nextEvaluationAt: record.next_evaluation_at ?? undefined,
    simulationMode: record.simulation_mode,
    authorizationStatus: record.authorization_status ?? "missing",
    authorizationReference: record.authorization_reference ?? undefined,
    authorizationSignature: record.authorization_signature ?? undefined,
    authorizationDigest: record.authorization_digest ?? undefined,
    authorizationNonce: record.authorization_nonce ?? undefined,
    authorizationDeadline: record.authorization_deadline ?? undefined,
    authorizationAdapter: record.authorization_adapter ?? undefined,
    authorizationMaxAmount: record.authorization_max_amount ?? undefined,
    authorizationWalletAddress: record.authorization_wallet_address ?? undefined,
    authorizationSignedAt: record.authorization_signed_at ?? undefined,
    authorizationCancelledAt: record.authorization_cancelled_at ?? undefined,
    executionMode: record.execution_mode ?? "simulation",
    createdAt: record.created_at,
  }
}

export function toStrategyInsert(strategy: Strategy): StrategyInsert {
  return {
    id: strategy.id,
    token_name: strategy.tokenName,
    token_symbol: strategy.tokenSymbol,
    token_address: strategy.tokenAddress,
    chain: strategy.chain,
    chain_id: strategy.chainId,
    sell_percentage: strategy.sellPercentage,
    take_profit_price: strategy.takeProfitPrice ?? null,
    stop_loss_price: strategy.stopLossPrice ?? null,
    trigger_enabled: strategy.triggerEnabled,
    slippage: strategy.slippage,
    notes: strategy.notes ?? null,
    status: strategy.status,
    created_at: strategy.createdAt,
    updated_at: new Date().toISOString(),
  }
}

function parseAmountSold(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/)

  if (!match) {
    return null
  }

  return Number(match[0])
}

export function toDashboardExecution(record: ExecutionRecord): Execution {
  return {
    id: record.id,
    tokenSymbol: record.token_symbol,
    triggerType: record.trigger_type,
    amountSold: createLocalExecutionLabel(
      record.trigger_type,
      record.amount_sold,
      record.token_symbol
    ),
    status: record.status,
    executedAt: record.executed_at,
  }
}

export function toDashboardExecutionAttempt(
  record: ExecutionAttemptRecord
): ExecutionAttempt {
  return toExecutionAttempt(record)
}

export function toExecutionInsert(input: DashboardExecutionInput): ExecutionInsert {
  return {
    id: input.id,
    strategy_id: input.strategyId ?? null,
    token_symbol: input.tokenSymbol,
    trigger_type: input.triggerType,
    amount_sold: parseAmountSold(input.amountSold),
    status: input.status,
    executed_at: input.executedAt,
    created_at: input.executedAt,
    updated_at: input.executedAt,
  }
}

function createLocalExecutionLabel(
  triggerType: TriggerType,
  amountSold: number | null,
  tokenSymbol: string
) {
  if (amountSold === null) {
    return ""
  }

  switch (triggerType) {
    case "strategy_created":
      return `${amountSold}% configured`
    case "strategy_updated":
      return `${amountSold}% updated`
    case "strategy_paused":
      return `${amountSold}% paused`
    case "strategy_resumed":
      return `${amountSold}% resumed`
    case "strategy_deleted":
      return `${amountSold}% removed`
    case "take_profit":
    case "stop_loss":
      return `${amountSold} ${tokenSymbol}`
    default:
      return String(amountSold)
  }
}

export async function listDashboardStrategies() {
  try {
    const result = await listStrategies()

    if (result.error) {
      throw new Error(result.error)
    }

    return result.data.map(toDashboardStrategy)
  } catch {
    return []
  }
}

export async function listDashboardExecutions() {
  try {
    const result = await listExecutions()

    if (result.error) {
      throw new Error(result.error)
    }

    return result.data.map(toDashboardExecution)
  } catch {
    return []
  }
}

export async function listDashboardExecutionAttempts() {
  try {
    const result = await listExecutionAttempts({ mode: "simulation" })

    if (result.error) {
      throw new Error(result.error)
    }

    return result.data.map(toDashboardExecutionAttempt)
  } catch {
    return []
  }
}

export async function createDashboardStrategy(strategy: Strategy) {
  const result = await createStrategy(toStrategyInsert(strategy))

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to create strategy.")
  }

  return toDashboardStrategy(result.data)
}

export async function updateDashboardStrategy(strategy: Strategy) {
  const result = await updateStrategy(strategy.id, {
    token_name: strategy.tokenName,
    token_symbol: strategy.tokenSymbol,
    token_address: strategy.tokenAddress,
    chain: strategy.chain,
    chain_id: strategy.chainId,
    sell_percentage: strategy.sellPercentage,
    take_profit_price: strategy.takeProfitPrice ?? null,
    stop_loss_price: strategy.stopLossPrice ?? null,
    trigger_enabled: strategy.triggerEnabled,
    slippage: strategy.slippage,
    notes: strategy.notes ?? null,
    status: strategy.status,
  })

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to update strategy.")
  }

  return toDashboardStrategy(result.data)
}

export async function deleteDashboardStrategy(id: string) {
  const result = await deleteStrategy(id)

  if (result.error) {
    throw new Error(result.error)
  }
}

export async function pauseDashboardStrategy(id: string) {
  const result = await pauseStrategy(id)

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to pause strategy.")
  }

  return toDashboardStrategy(result.data)
}

export async function resumeDashboardStrategy(id: string) {
  const result = await resumeStrategy(id)

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to resume strategy.")
  }

  return toDashboardStrategy(result.data)
}

export async function createDashboardExecution(input: DashboardExecutionInput) {
  const result = await createExecution(toExecutionInsert(input))

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to create execution.")
  }

  return toDashboardExecution(result.data)
}

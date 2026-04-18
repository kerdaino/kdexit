import {
  createExecution,
  createStrategy,
  deleteStrategy,
  listExecutions,
  listStrategies,
  pauseStrategy,
  resumeStrategy,
  updateStrategy,
} from "@/lib/data"
import {
  loadDashboardData,
  saveDashboardExecutions,
  saveDashboardStrategies,
} from "@/lib/dashboard/storage"
import { normalizeStrategy } from "@/lib/dashboard/utils"
import { getStrategyChainEntryByLabel } from "@/lib/web3/chains"
import type {
  ExecutionInsert,
  ExecutionRecord,
  StrategyInsert,
  StrategyRecord,
} from "@/types/database-records"
import type { Execution, Strategy, TriggerType } from "@/types/strategy"

const LOCAL_WALLET_ADDRESS = "local-wallet"

type DashboardExecutionInput = Omit<Execution, "id" | "executedAt"> & {
  id?: string
  executedAt?: string
  strategyId?: string
}

function toStrategy(record: StrategyRecord): Strategy {
  const chainEntry = getStrategyChainEntryByLabel(record.chain)

  return {
    id: record.id,
    tokenName: record.token_name,
    tokenSymbol: record.token_symbol,
    tokenAddress: "",
    chain: record.chain,
    chainId: chainEntry.chain.id,
    sellPercentage: record.sell_percentage,
    takeProfitPrice: record.take_profit_price ?? undefined,
    stopLossPrice: record.stop_loss_price ?? undefined,
    triggerEnabled: record.status === "active",
    slippage: record.slippage,
    notes: undefined,
    status: record.status,
    createdAt: record.created_at,
  }
}

function toStrategyInsert(strategy: Strategy): StrategyInsert {
  return {
    id: strategy.id,
    wallet_address: LOCAL_WALLET_ADDRESS,
    token_name: strategy.tokenName,
    token_symbol: strategy.tokenSymbol,
    chain: strategy.chain,
    sell_percentage: strategy.sellPercentage,
    take_profit_price: strategy.takeProfitPrice ?? null,
    stop_loss_price: strategy.stopLossPrice ?? null,
    slippage: strategy.slippage,
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

function toExecution(record: ExecutionRecord): Execution {
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

function toExecutionInsert(input: DashboardExecutionInput): ExecutionInsert {
  return {
    id: input.id,
    strategy_id: input.strategyId ?? "local-strategy",
    wallet_address: LOCAL_WALLET_ADDRESS,
    token_symbol: input.tokenSymbol,
    trigger_type: input.triggerType,
    amount_sold: parseAmountSold(input.amountSold),
    status: input.status,
    executed_at: input.executedAt,
    created_at: input.executedAt,
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

    if (result.isPlaceholder) {
      const { strategies } = loadDashboardData()
      return strategies
    }

    if (result.error) {
      console.error("Failed to load strategies from repository:", result.error)
      return []
    }

    return result.data.map(toStrategy)
  } catch (error) {
    console.error("Failed to load strategies:", error)
    return []
  }
}

export async function listDashboardExecutions() {
  try {
    const result = await listExecutions()

    if (result.isPlaceholder) {
      const { executions } = loadDashboardData()
      return executions
    }

    if (result.error) {
      console.error("Failed to load executions from repository:", result.error)
      return []
    }

    return result.data.map(toExecution)
  } catch (error) {
    console.error("Failed to load executions:", error)
    return []
  }
}

export async function createDashboardStrategy(strategy: Strategy) {
  const result = await createStrategy(toStrategyInsert(strategy))

  if (result.isPlaceholder) {
    const { strategies } = loadDashboardData()
    const nextStrategies = [normalizeStrategy(strategy), ...strategies]
    saveDashboardStrategies(nextStrategies)
    return normalizeStrategy(strategy)
  }

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to create strategy.")
  }

  return toStrategy(result.data)
}

export async function updateDashboardStrategy(strategy: Strategy) {
  const result = await updateStrategy(strategy.id, {
    token_name: strategy.tokenName,
    token_symbol: strategy.tokenSymbol,
    chain: strategy.chain,
    sell_percentage: strategy.sellPercentage,
    take_profit_price: strategy.takeProfitPrice ?? null,
    stop_loss_price: strategy.stopLossPrice ?? null,
    slippage: strategy.slippage,
    status: strategy.status,
  })

  if (result.isPlaceholder) {
    const { strategies } = loadDashboardData()
    const nextStrategies = strategies.map((entry) =>
      entry.id === strategy.id ? normalizeStrategy(strategy) : entry
    )
    saveDashboardStrategies(nextStrategies)
    return normalizeStrategy(strategy)
  }

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to update strategy.")
  }

  return toStrategy(result.data)
}

export async function deleteDashboardStrategy(id: string) {
  const result = await deleteStrategy(id)

  if (result.isPlaceholder) {
    const { strategies } = loadDashboardData()
    saveDashboardStrategies(strategies.filter((strategy) => strategy.id !== id))
    return
  }

  if (result.error) {
    throw new Error(result.error)
  }
}

export async function pauseDashboardStrategy(id: string) {
  const result = await pauseStrategy(id)

  if (result.isPlaceholder) {
    const { strategies } = loadDashboardData()
    const target = strategies.find((strategy) => strategy.id === id)

    if (!target) {
      return null
    }

    const nextStrategy = { ...target, status: "paused" as const }
    saveDashboardStrategies(
      strategies.map((strategy) => (strategy.id === id ? nextStrategy : strategy))
    )
    return nextStrategy
  }

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to pause strategy.")
  }

  return toStrategy(result.data)
}

export async function resumeDashboardStrategy(id: string) {
  const result = await resumeStrategy(id)

  if (result.isPlaceholder) {
    const { strategies } = loadDashboardData()
    const target = strategies.find((strategy) => strategy.id === id)

    if (!target) {
      return null
    }

    const nextStrategy = { ...target, status: "active" as const }
    saveDashboardStrategies(
      strategies.map((strategy) => (strategy.id === id ? nextStrategy : strategy))
    )
    return nextStrategy
  }

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to resume strategy.")
  }

  return toStrategy(result.data)
}

export async function createDashboardExecution(input: DashboardExecutionInput) {
  const result = await createExecution(toExecutionInsert(input))

  if (result.isPlaceholder) {
    const { executions } = loadDashboardData()
    const nextExecution: Execution = {
      id: input.id ?? crypto.randomUUID(),
      tokenSymbol: input.tokenSymbol,
      triggerType: input.triggerType,
      amountSold: input.amountSold,
      status: input.status,
      executedAt: input.executedAt ?? new Date().toLocaleString(),
    }

    saveDashboardExecutions([nextExecution, ...executions])
    return nextExecution
  }

  if (result.error || !result.data) {
    throw new Error(result.error ?? "Failed to create execution.")
  }

  return toExecution(result.data)
}

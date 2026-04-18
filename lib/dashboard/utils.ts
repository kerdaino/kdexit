import type { Execution, Strategy, StrategyStatus, TriggerType } from "@/types/strategy"
import {
  getStrategyChainEntryByLabel,
  primaryKdexitChain,
} from "@/lib/web3/chains"

export function formatTimestamp(date: Date = new Date()) {
  return date.toLocaleString()
}

export function generateClientId() {
  return crypto.randomUUID()
}

type LegacyStrategyShape = Omit<
  Strategy,
  "tokenAddress" | "chainId" | "triggerEnabled" | "notes"
> &
  Partial<Pick<Strategy, "tokenAddress" | "chainId" | "triggerEnabled" | "notes">>

export function normalizeStrategy(strategy: LegacyStrategyShape): Strategy {
  const chainEntry = getStrategyChainEntryByLabel(strategy.chain)

  return {
    ...strategy,
    tokenAddress: strategy.tokenAddress ?? "",
    chainId: strategy.chainId ?? chainEntry.chain.id ?? primaryKdexitChain.chain.id,
    triggerEnabled: strategy.triggerEnabled ?? true,
    notes: strategy.notes?.trim() ? strategy.notes.trim() : undefined,
  }
}

export function countStrategiesByStatus(
  strategies: Strategy[],
  status: StrategyStatus
) {
  return strategies.filter((strategy) => strategy.status === status).length
}

export function setStrategyStatus(
  strategies: Strategy[],
  id: string,
  status: StrategyStatus
) {
  return strategies.map((strategy) =>
    strategy.id === id ? { ...strategy, status } : strategy
  )
}

export function getStrategyStatusClass(status: Strategy["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-400"
    case "paused":
      return "bg-yellow-500/15 text-yellow-400"
    case "triggered":
      return "bg-blue-500/15 text-blue-400"
    case "completed":
      return "bg-purple-500/15 text-purple-400"
    default:
      return "bg-gray-500/15 text-gray-400"
  }
}

export function getExecutionStatusClass(status: Execution["status"]) {
  switch (status) {
    case "success":
      return "text-emerald-400"
    case "failed":
      return "text-red-400"
    case "pending":
      return "text-yellow-400"
    default:
      return "text-gray-400"
  }
}

export function formatTriggerLabel(triggerType: TriggerType) {
  switch (triggerType) {
    case "take_profit":
      return "Take Profit"
    case "stop_loss":
      return "Stop Loss"
    case "strategy_created":
      return "Strategy Created"
    case "strategy_updated":
      return "Strategy Updated"
    case "strategy_paused":
      return "Strategy Paused"
    case "strategy_resumed":
      return "Strategy Resumed"
    case "strategy_deleted":
      return "Strategy Deleted"
    default:
      return triggerType
  }
}

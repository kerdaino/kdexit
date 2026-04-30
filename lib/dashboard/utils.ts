import type { Execution, Strategy, StrategyStatus, TriggerType } from "@/types/strategy"
import type { ExecutionAttempt, ExecutionAttemptStatus } from "@/types/automation"
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

export function getExecutionAttemptOutcome(
  status: ExecutionAttemptStatus
): "success" | "pending" | "failed" {
  switch (status) {
    case "simulated":
    case "confirmed":
      return "success"
    case "queued":
    case "evaluating":
    case "submitted":
    case "pending":
      return "pending"
    case "failed":
    case "blocked":
    case "aborted":
      return "failed"
    default:
      return "pending"
  }
}

export function getExecutionAttemptOutcomeClass(status: ExecutionAttempt["status"]) {
  switch (getExecutionAttemptOutcome(status)) {
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

export function formatExecutionAttemptStatus(status: ExecutionAttempt["status"]) {
  switch (status) {
    case "queued":
      return "Queued"
    case "evaluating":
      return "Evaluating"
    case "simulated":
      return "Simulated Success"
    case "pending":
      return "Pending Dry Run"
    case "submitted":
      return "Submitted"
    case "confirmed":
      return "Confirmed"
    case "failed":
      return "Failed"
    case "blocked":
      return "Blocked"
    case "aborted":
      return "Aborted"
    default:
      return status
  }
}

export function getExecutionAttemptStatusBadgeClass(
  status: ExecutionAttempt["status"]
) {
  switch (getExecutionAttemptOutcome(status)) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
    case "failed":
      return "border-red-500/20 bg-red-500/10 text-red-300"
    case "pending":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
    default:
      return "border-white/10 bg-white/5 text-gray-300"
  }
}

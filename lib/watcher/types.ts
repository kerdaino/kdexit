import type {
  DbExecutionAttemptStatus,
  DbExecutionTriggerType,
  DbStrategyEvaluationState,
  ExecutionAttemptInsert,
  ExecutionAttemptRecord,
  StrategyRecord,
} from "@/types/database-records"

export type WatcherSelectionReason =
  | "scheduled"
  | "ready_for_first_evaluation"
  | "retry_due"

export type WatcherBlockReason =
  | "strategy_paused"
  | "trigger_disabled"
  | "missing_take_profit_and_stop_loss"
  | "no_market_price"
  | "market_data_stale"
  | "unknown"

export type WatcherClock = {
  now(): Date
}

export type StrategyCandidate = Pick<
  StrategyRecord,
  | "id"
  | "user_id"
  | "token_symbol"
  | "token_address"
  | "chain"
  | "chain_id"
  | "take_profit_price"
  | "stop_loss_price"
  | "trigger_enabled"
  | "status"
  | "evaluation_state"
  | "last_evaluated_at"
  | "next_evaluation_at"
  | "simulation_mode"
>

export type MarketObservation = {
  strategyId?: string
  chainId: number
  tokenAddress: string
  observedPrice: number | null
  observedAt: string
  source: string
  isStale?: boolean
}

export type StrategySelectionInput = {
  strategies: StrategyCandidate[]
  now: string
}

export type SelectedStrategy = {
  strategy: StrategyCandidate
  reason: WatcherSelectionReason
}

export type TriggerEvaluationResult =
  | {
      kind: "not_ready"
      evaluationState: Extract<DbStrategyEvaluationState, "idle" | "blocked">
      blockReason: WatcherBlockReason
      nextEvaluationAt?: string
    }
  | {
      kind: "no_trigger"
      evaluationState: Extract<DbStrategyEvaluationState, "ready" | "watching">
      nextEvaluationAt?: string
    }
  | {
      kind: "triggered"
      evaluationState: Extract<DbStrategyEvaluationState, "watching">
      triggerType: Extract<DbExecutionTriggerType, "take_profit" | "stop_loss">
      observedPrice: number
      nextEvaluationAt?: string
    }

export type SimulationDecision =
  | {
      kind: "skip"
      reason: string
    }
  | {
      kind: "create_attempt"
      attempt: ExecutionAttemptInsert
    }

export type StrategyEvaluationUpdate = {
  strategyId: string
  evaluationState?: DbStrategyEvaluationState
  lastEvaluatedAt?: string | null
  nextEvaluationAt?: string | null
}

export type WatcherStrategyRepository = {
  listCandidatesForEvaluation(input: {
    now: string
  }): Promise<StrategyCandidate[]>
  recordEvaluation(update: StrategyEvaluationUpdate): Promise<StrategyRecord | null>
}

export type WatcherExecutionAttemptRepository = {
  listByStrategy(strategyId: string): Promise<ExecutionAttemptRecord[]>
  create(input: ExecutionAttemptInsert): Promise<ExecutionAttemptRecord | null>
  updateStatus(input: {
    id: string
    status: DbExecutionAttemptStatus
    failureReason?: string | null
    retryCount?: number
    transactionHash?: string | null
  }): Promise<ExecutionAttemptRecord | null>
}

export type WatcherMarketDataProvider = {
  getLatestPrice(input: {
    strategy: StrategyCandidate
  }): Promise<MarketObservation | null>
}

export type WatcherDependencies = {
  clock: WatcherClock
  strategies: WatcherStrategyRepository
  executionAttempts: WatcherExecutionAttemptRepository
  marketData: WatcherMarketDataProvider
}

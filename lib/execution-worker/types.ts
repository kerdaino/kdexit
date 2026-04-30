import type {
  DbExecutionTriggerType,
  ExecutionAttemptInsert,
  ExecutionAttemptRecord,
  StrategyRecord,
  WalletLinkRecord,
} from "@/types/database-records"
import type { MarketObservation, TriggerEvaluationResult } from "@/lib/watcher/types"

export type ExecutionWorkerBlockReason =
  | "worker_disabled"
  | "readiness_gate_blocked"
  | "linked_wallet_missing"
  | "authorization_missing"
  | "authorization_not_active"
  | "token_address_missing"
  | "no_market_price"
  | "market_data_stale"
  | "trigger_not_met"
  | "contract_write_mode_disabled"
  | "attempt_create_failed"

export type PreparedContractExecutionPayload = {
  chainId: number
  controllerAddress: string | null
  executionMode: "dry_run"
  sellPercentage: number
  strategyId: string
  tokenAddress: string
  tokenSymbol: string
  triggerType: Extract<DbExecutionTriggerType, "take_profit" | "stop_loss">
  walletAddress: string
}

export type ExecutionWorkerStrategyCandidate = Pick<
  StrategyRecord,
  | "id"
  | "user_id"
  | "token_symbol"
  | "token_address"
  | "chain"
  | "chain_id"
  | "sell_percentage"
  | "take_profit_price"
  | "stop_loss_price"
  | "trigger_enabled"
  | "status"
  | "evaluation_state"
  | "last_evaluated_at"
  | "next_evaluation_at"
  | "simulation_mode"
  | "authorization_status"
  | "authorization_reference"
  | "execution_mode"
>

export type ExecutionWorkerRepository = {
  listEligibleStrategies(input: {
    limit: number
    now: string
    strategyIds?: string[]
    userId: string
  }): Promise<ExecutionWorkerStrategyCandidate[]>
  getPrimaryWalletForStrategy(input: {
    chainId: number
    userId: string
  }): Promise<WalletLinkRecord | null>
  listAttemptsByStrategy(strategyId: string): Promise<ExecutionAttemptRecord[]>
  createAttempt(input: ExecutionAttemptInsert): Promise<ExecutionAttemptRecord | null>
  updateAttempt(input: {
    attemptId: string
    blockedReason?: string | null
    failureReason?: string | null
    preparedPayloadHash?: string | null
    reconciliationDetail?: string | null
    reconciliationStatus?: ExecutionAttemptRecord["reconciliation_status"]
    status: ExecutionAttemptRecord["status"]
    transactionHash?: string | null
  }): Promise<ExecutionAttemptRecord | null>
  recordStrategyEvaluation(input: {
    evaluationState: StrategyRecord["evaluation_state"]
    lastEvaluatedAt: string
    nextEvaluationAt?: string | null
    strategyId: string
    userId: string
  }): Promise<StrategyRecord | null>
}

export type ExecutionWorkerMarketDataProvider = {
  getLatestPrice(input: {
    strategy: ExecutionWorkerStrategyCandidate
  }): Promise<MarketObservation | null>
}

export type ExecutionWorkerRunInput = {
  observations: MarketObservation[]
  strategyIds?: string[]
  userId: string
}

export type ExecutionWorkerRunItem = {
  attempt: ExecutionAttemptRecord | null
  blockReason: ExecutionWorkerBlockReason | null
  evaluation: TriggerEvaluationResult | null
  marketObservation: MarketObservation | null
  preparedPayload: PreparedContractExecutionPayload | null
  preparedPayloadHash: string | null
  strategyId: string
}

export type ExecutionWorkerRunResult = {
  evaluatedAt: string
  items: ExecutionWorkerRunItem[]
  mode: "dry_run"
  summary: {
    blocked: number
    createdAttempts: number
    evaluatedStrategies: number
    preparedPayloads: number
    triggered: number
  }
}

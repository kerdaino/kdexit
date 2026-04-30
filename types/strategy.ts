export type StrategyStatus = "active" | "paused" | "triggered" | "completed"
export type StrategyEvaluationState = "idle" | "ready" | "watching" | "blocked"
export type ExecutionAttemptStatus =
  | "queued"
  | "evaluating"
  | "simulated"
  | "pending"
  | "submitted"
  | "confirmed"
  | "failed"
  | "blocked"
  | "aborted"

export type TriggerType =
  | "take_profit"
  | "stop_loss"
  | "strategy_created"
  | "strategy_updated"
  | "strategy_paused"
  | "strategy_resumed"
  | "strategy_deleted"

export type Strategy = {
  id: string
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  chain: string
  chainId: number
  sellPercentage: number
  takeProfitPrice?: number
  stopLossPrice?: number
  triggerEnabled: boolean
  slippage: number
  notes?: string
  status: StrategyStatus
  evaluationState?: StrategyEvaluationState
  lastEvaluatedAt?: string
  nextEvaluationAt?: string
  simulationMode?: boolean
  authorizationStatus?: string
  authorizationReference?: string
  executionMode?: string
  createdAt: string
}

export type Execution = {
  id: string
  tokenSymbol: string
  triggerType: TriggerType
  amountSold: string
  status: "success" | "failed" | "pending"
  executedAt: string
}

export type ExecutionAttempt = {
  id: string
  strategyId: string
  triggerType: TriggerType
  status: ExecutionAttemptStatus
  simulationMode: boolean
  attemptNumber: number
  retryCount: number
  failureReason?: string
  transactionHash?: string
  executionMode?: string
  preparedPayloadHash?: string
  blockedReason?: string
  reconciliationStatus?: string
  reconciliationDetail?: string
  createdAt: string
  updatedAt: string
}

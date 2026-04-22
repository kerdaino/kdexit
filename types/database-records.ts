export type DbStrategyStatus = "active" | "paused" | "triggered" | "completed"
export type DbStrategyEvaluationState = "idle" | "ready" | "watching" | "blocked"

export type DbExecutionTriggerType =
  | "take_profit"
  | "stop_loss"
  | "strategy_created"
  | "strategy_updated"
  | "strategy_paused"
  | "strategy_resumed"
  | "strategy_deleted"

export type DbExecutionStatus = "success" | "failed" | "pending"
export type DbExecutionAttemptStatus =
  | "queued"
  | "evaluating"
  | "simulated"
  | "submitted"
  | "confirmed"
  | "failed"
  | "aborted"

export interface WalletLinkRecord {
  id: string
  user_id: string
  wallet_address: string
  chain_id: number
  connector_name: string | null
  label: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface WalletLinkInsert {
  id?: string
  user_id?: string
  wallet_address: string
  chain_id: number
  connector_name?: string | null
  label?: string | null
  is_primary?: boolean
  created_at?: string
  updated_at?: string
}

export interface WalletLinkUpdate {
  user_id?: string
  wallet_address?: string
  chain_id?: number
  connector_name?: string | null
  label?: string | null
  is_primary?: boolean
  created_at?: string
  updated_at?: string
}

export interface StrategyRecord {
  id: string
  user_id: string
  token_name: string
  token_symbol: string
  token_address: string
  chain: string
  chain_id: number
  sell_percentage: number
  take_profit_price: number | null
  stop_loss_price: number | null
  trigger_enabled: boolean
  slippage: number
  notes: string | null
  status: DbStrategyStatus
  evaluation_state: DbStrategyEvaluationState
  last_evaluated_at: string | null
  next_evaluation_at: string | null
  simulation_mode: boolean
  created_at: string
  updated_at: string
}

export interface StrategyInsert {
  id?: string
  user_id?: string
  token_name: string
  token_symbol: string
  token_address?: string
  chain: string
  chain_id: number
  sell_percentage: number
  take_profit_price?: number | null
  stop_loss_price?: number | null
  trigger_enabled?: boolean
  slippage: number
  notes?: string | null
  status?: DbStrategyStatus
  evaluation_state?: DbStrategyEvaluationState
  last_evaluated_at?: string | null
  next_evaluation_at?: string | null
  simulation_mode?: boolean
  created_at?: string
  updated_at?: string
}

export interface StrategyUpdate {
  user_id?: string
  token_name?: string
  token_symbol?: string
  token_address?: string
  chain?: string
  chain_id?: number
  sell_percentage?: number
  take_profit_price?: number | null
  stop_loss_price?: number | null
  trigger_enabled?: boolean
  slippage?: number
  notes?: string | null
  status?: DbStrategyStatus
  evaluation_state?: DbStrategyEvaluationState
  last_evaluated_at?: string | null
  next_evaluation_at?: string | null
  simulation_mode?: boolean
  created_at?: string
  updated_at?: string
}

export interface ExecutionAttemptRecord {
  id: string
  user_id: string
  strategy_id: string
  trigger_type: DbExecutionTriggerType
  status: DbExecutionAttemptStatus
  simulation_mode: boolean
  attempt_number: number
  retry_count: number
  failure_reason: string | null
  transaction_hash: string | null
  created_at: string
  updated_at: string
}

export interface ExecutionAttemptInsert {
  id?: string
  user_id?: string
  strategy_id: string
  trigger_type: DbExecutionTriggerType
  status?: DbExecutionAttemptStatus
  simulation_mode?: boolean
  attempt_number?: number
  retry_count?: number
  failure_reason?: string | null
  transaction_hash?: string | null
  created_at?: string
  updated_at?: string
}

export interface ExecutionAttemptUpdate {
  user_id?: string
  strategy_id?: string
  trigger_type?: DbExecutionTriggerType
  status?: DbExecutionAttemptStatus
  simulation_mode?: boolean
  attempt_number?: number
  retry_count?: number
  failure_reason?: string | null
  transaction_hash?: string | null
  created_at?: string
  updated_at?: string
}

export interface ExecutionRecord {
  id: string
  user_id: string
  strategy_id: string | null
  token_symbol: string
  trigger_type: DbExecutionTriggerType
  amount_sold: number | null
  status: DbExecutionStatus
  transaction_hash: string | null
  error_message: string | null
  executed_at: string
  created_at: string
  updated_at: string
}

export interface ExecutionInsert {
  id?: string
  user_id?: string
  strategy_id?: string | null
  token_symbol: string
  trigger_type: DbExecutionTriggerType
  amount_sold?: number | null
  status?: DbExecutionStatus
  transaction_hash?: string | null
  error_message?: string | null
  executed_at?: string
  created_at?: string
  updated_at?: string
}

export interface ExecutionUpdate {
  strategy_id?: string
  user_id?: string
  token_symbol?: string
  trigger_type?: DbExecutionTriggerType
  amount_sold?: number | null
  status?: DbExecutionStatus
  transaction_hash?: string | null
  error_message?: string | null
  executed_at?: string
  created_at?: string
  updated_at?: string
}

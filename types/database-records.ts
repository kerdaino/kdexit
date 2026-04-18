export type DbStrategyStatus = "active" | "paused" | "triggered" | "completed"

export type DbExecutionTriggerType =
  | "take_profit"
  | "stop_loss"
  | "strategy_created"
  | "strategy_updated"
  | "strategy_paused"
  | "strategy_resumed"
  | "strategy_deleted"

export type DbExecutionStatus = "success" | "failed" | "pending"

export interface StrategyRecord {
  id: string
  wallet_address: string
  token_name: string
  token_symbol: string
  chain: string
  sell_percentage: number
  take_profit_price: number | null
  stop_loss_price: number | null
  slippage: number
  status: DbStrategyStatus
  created_at: string
  updated_at: string
}

export interface StrategyInsert {
  id?: string
  wallet_address: string
  token_name: string
  token_symbol: string
  chain: string
  sell_percentage: number
  take_profit_price?: number | null
  stop_loss_price?: number | null
  slippage: number
  status?: DbStrategyStatus
  created_at?: string
  updated_at?: string
}

export interface StrategyUpdate {
  wallet_address?: string
  token_name?: string
  token_symbol?: string
  chain?: string
  sell_percentage?: number
  take_profit_price?: number | null
  stop_loss_price?: number | null
  slippage?: number
  status?: DbStrategyStatus
  created_at?: string
  updated_at?: string
}

export interface ExecutionRecord {
  id: string
  strategy_id: string
  wallet_address: string
  token_symbol: string
  trigger_type: DbExecutionTriggerType
  amount_sold: number | null
  status: DbExecutionStatus
  transaction_hash: string | null
  error_message: string | null
  executed_at: string
  created_at: string
}

export interface ExecutionInsert {
  id?: string
  strategy_id: string
  wallet_address: string
  token_symbol: string
  trigger_type: DbExecutionTriggerType
  amount_sold?: number | null
  status?: DbExecutionStatus
  transaction_hash?: string | null
  error_message?: string | null
  executed_at?: string
  created_at?: string
}

export interface ExecutionUpdate {
  strategy_id?: string
  wallet_address?: string
  token_symbol?: string
  trigger_type?: DbExecutionTriggerType
  amount_sold?: number | null
  status?: DbExecutionStatus
  transaction_hash?: string | null
  error_message?: string | null
  executed_at?: string
  created_at?: string
}

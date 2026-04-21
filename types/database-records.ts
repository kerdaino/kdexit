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

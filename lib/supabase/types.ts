export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

import type {
  DbExecutionAttemptStatus,
  DbExecutionStatus,
  DbExecutionTriggerType,
  DbStrategyEvaluationState,
  DbStrategyStatus,
  ExecutionAttemptInsert,
  ExecutionAttemptRecord,
  ExecutionAttemptUpdate,
  ExecutionInsert,
  ExecutionRecord,
  ExecutionUpdate,
  StrategyInsert,
  StrategyRecord,
  StrategyUpdate,
  WalletLinkInsert,
  WalletLinkRecord,
  WalletLinkUpdate,
} from "@/types/database-records"

type ProfileRecord = {
  id: string
  primary_wallet_address: string | null
  created_at: string
  updated_at: string
}

type ProfileInsert = {
  id: string
  primary_wallet_address?: string | null
  created_at?: string
  updated_at?: string
}

type ProfileUpdate = {
  primary_wallet_address?: string | null
  updated_at?: string
}

type TableDefinition<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<ProfileRecord, ProfileInsert, ProfileUpdate>
      wallet_links: TableDefinition<WalletLinkRecord, WalletLinkInsert, WalletLinkUpdate>
      execution_attempts: TableDefinition<
        ExecutionAttemptRecord,
        ExecutionAttemptInsert,
        ExecutionAttemptUpdate
      >
      executions: TableDefinition<ExecutionRecord, ExecutionInsert, ExecutionUpdate>
      strategies: TableDefinition<StrategyRecord, StrategyInsert, StrategyUpdate>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      execution_attempt_status: DbExecutionAttemptStatus
      execution_status: DbExecutionStatus
      execution_trigger_type: DbExecutionTriggerType
      strategy_evaluation_state: DbStrategyEvaluationState
      strategy_status: DbStrategyStatus
    }
    CompositeTypes: Record<string, never>
  }
}

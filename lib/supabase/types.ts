export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

import type {
  DbExecutionStatus,
  DbExecutionTriggerType,
  DbStrategyStatus,
  ExecutionInsert,
  ExecutionRecord,
  ExecutionUpdate,
  StrategyInsert,
  StrategyRecord,
  StrategyUpdate,
} from "@/types/database-records"

type TableDefinition<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      executions: TableDefinition<ExecutionRecord, ExecutionInsert, ExecutionUpdate>
      strategies: TableDefinition<StrategyRecord, StrategyInsert, StrategyUpdate>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      execution_status: DbExecutionStatus
      execution_trigger_type: DbExecutionTriggerType
      strategy_status: DbStrategyStatus
    }
    CompositeTypes: Record<string, never>
  }
}

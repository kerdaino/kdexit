import type {
  DbExecutionAttemptStatus,
  DbExecutionTriggerType,
  DbStrategyEvaluationState,
  ExecutionAttemptRecord,
  StrategyRecord,
} from "@/types/database-records"

export type StrategyEvaluationState = DbStrategyEvaluationState
export type ExecutionAttemptStatus = DbExecutionAttemptStatus
export type ExecutionAttemptTriggerType = DbExecutionTriggerType

export type StrategyEvaluationSnapshot = Pick<
  StrategyRecord,
  "id" | "evaluation_state" | "last_evaluated_at" | "next_evaluation_at" | "simulation_mode"
>

export type ExecutionAttempt = {
  id: string
  strategyId: string
  triggerType: ExecutionAttemptTriggerType
  status: ExecutionAttemptStatus
  currentStatus: ExecutionAttemptStatus
  simulationMode: boolean
  attemptNumber: number
  retryCount: number
  failureReason?: string
  lastFailureReason?: string
  transactionHash?: string
  executionMode: ExecutionAttemptRecord["execution_mode"]
  preparedPayloadHash?: string
  blockedReason?: string
  reconciliationStatus: ExecutionAttemptRecord["reconciliation_status"]
  reconciliationDetail?: string
  createdAt: string
  updatedAt: string
}

export function toExecutionAttempt(record: ExecutionAttemptRecord): ExecutionAttempt {
  return {
    id: record.id,
    strategyId: record.strategy_id,
    triggerType: record.trigger_type,
    status: record.status,
    currentStatus: record.status,
    simulationMode: record.simulation_mode,
    attemptNumber: record.attempt_number,
    retryCount: record.retry_count,
    failureReason: record.failure_reason ?? undefined,
    lastFailureReason: record.failure_reason ?? undefined,
    transactionHash: record.transaction_hash ?? undefined,
    executionMode: record.execution_mode ?? "simulation",
    preparedPayloadHash: record.prepared_payload_hash ?? undefined,
    blockedReason: record.blocked_reason ?? undefined,
    reconciliationStatus: record.reconciliation_status ?? "not_started",
    reconciliationDetail: record.reconciliation_detail ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

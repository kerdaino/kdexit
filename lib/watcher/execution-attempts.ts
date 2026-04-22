import type {
  ExecutionAttemptInsert,
  ExecutionAttemptRecord,
} from "@/types/database-records"
import type {
  SimulationDecision,
  StrategyCandidate,
  TriggerEvaluationResult,
} from "@/lib/watcher/types"

export function getNextAttemptNumber(
  attempts: ExecutionAttemptRecord[]
): number {
  const maxAttemptNumber = attempts.reduce((maxValue, attempt) => {
    return Math.max(maxValue, attempt.attempt_number)
  }, 0)

  return maxAttemptNumber + 1
}

export function buildSimulationExecutionAttempt(
  strategy: StrategyCandidate,
  evaluation: Extract<TriggerEvaluationResult, { kind: "triggered" }>,
  previousAttempts: ExecutionAttemptRecord[]
): ExecutionAttemptInsert {
  return {
    strategy_id: strategy.id,
    trigger_type: evaluation.triggerType,
    status: "evaluating",
    simulation_mode: true,
    attempt_number: getNextAttemptNumber(previousAttempts),
    retry_count: 0,
    failure_reason: null,
    transaction_hash: null,
  }
}

export function getSimulationDecision(
  strategy: StrategyCandidate,
  evaluation: TriggerEvaluationResult,
  previousAttempts: ExecutionAttemptRecord[]
): SimulationDecision {
  if (evaluation.kind !== "triggered") {
    return {
      kind: "skip",
      reason: "No trigger was activated during evaluation.",
    }
  }

  return {
    kind: "create_attempt",
    attempt: buildSimulationExecutionAttempt(strategy, evaluation, previousAttempts),
  }
}

import type { SelectedStrategy, StrategyCandidate, StrategySelectionInput } from "@/lib/watcher/types"

function isScheduled(strategy: StrategyCandidate, now: string) {
  if (!strategy.next_evaluation_at) {
    return true
  }

  return strategy.next_evaluation_at <= now
}

export function isStrategyEligibleForWatcherSelection(
  strategy: StrategyCandidate,
  now: string
) {
  if (strategy.status !== "active") {
    return false
  }

  if (!strategy.trigger_enabled) {
    return false
  }

  return isScheduled(strategy, now)
}

export function selectStrategiesForEvaluation(
  input: StrategySelectionInput
): SelectedStrategy[] {
  return input.strategies
    .filter((strategy) => isStrategyEligibleForWatcherSelection(strategy, input.now))
    .map((strategy) => ({
      strategy,
      reason:
        strategy.last_evaluated_at === null
          ? "ready_for_first_evaluation"
          : strategy.evaluation_state === "watching"
            ? "retry_due"
            : "scheduled",
    }))
}

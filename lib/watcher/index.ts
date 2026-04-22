export { getSimulationDecision, getNextAttemptNumber } from "@/lib/watcher/execution-attempts"
export { createStaticMarketDataProvider } from "@/lib/watcher/market-data"
export { reconcileExecutionAttempt } from "@/lib/watcher/reconciliation"
export {
  createSupabaseWatcherExecutionAttemptRepository,
  createSupabaseWatcherStrategyRepository,
} from "@/lib/watcher/repositories"
export { decideRetry } from "@/lib/watcher/retry-policy"
export { runWatcherSimulation } from "@/lib/watcher/simulation"
export type { SimulationRunItem, SimulationRunResult } from "@/lib/watcher/simulation"
export {
  isStrategyEligibleForWatcherSelection,
  selectStrategiesForEvaluation,
} from "@/lib/watcher/strategy-selection"
export { evaluateStrategyTrigger } from "@/lib/watcher/trigger-evaluator"
export type {
  MarketObservation,
  ReconciliationResult,
  RetryDecision,
  SelectedStrategy,
  SimulationDecision,
  StrategyCandidate,
  StrategyEvaluationUpdate,
  TriggerEvaluationResult,
  WatcherBlockReason,
  WatcherClock,
  WatcherDependencies,
  WatcherExecutionAttemptRepository,
  WatcherMarketDataProvider,
  WatcherSelectionReason,
  WatcherStrategyRepository,
} from "@/lib/watcher/types"

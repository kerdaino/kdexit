import { getSimulationDecision } from "@/lib/watcher/execution-attempts"
import { selectStrategiesForEvaluation } from "@/lib/watcher/strategy-selection"
import { evaluateStrategyTrigger } from "@/lib/watcher/trigger-evaluator"
import type {
  SimulationDecision,
  TriggerEvaluationResult,
  WatcherDependencies,
} from "@/lib/watcher/types"
import type { ExecutionAttemptRecord, StrategyRecord } from "@/types/database-records"

export type SimulationRunItem = {
  strategyId: string
  evaluation: TriggerEvaluationResult
  decision: SimulationDecision
  simulationOutcome: "no_attempt" | "simulated" | "failed"
  createdAttempt: ExecutionAttemptRecord | null
  finalizedAttempt: ExecutionAttemptRecord | null
  updatedStrategy: StrategyRecord | null
}

export type SimulationRunResult = {
  evaluatedAt: string
  summary: {
    evaluatedStrategies: number
    triggeredStrategies: number
    simulatedAttempts: number
    failedAttempts: number
  }
  items: SimulationRunItem[]
}

async function finalizeSimulationAttempt(
  dependencies: WatcherDependencies,
  createdAttempt: ExecutionAttemptRecord,
  failureReason?: string
) {
  if (failureReason) {
    return dependencies.executionAttempts.updateStatus({
      id: createdAttempt.id,
      status: "failed",
      failureReason,
      retryCount: createdAttempt.retry_count,
      transactionHash: null,
    })
  }

  return dependencies.executionAttempts.updateStatus({
    id: createdAttempt.id,
    status: "simulated",
    failureReason: null,
    retryCount: createdAttempt.retry_count,
    transactionHash: null,
  })
}

export async function runWatcherSimulation(
  dependencies: WatcherDependencies
): Promise<SimulationRunResult> {
  const evaluatedAt = dependencies.clock.now().toISOString()
  const candidates = await dependencies.strategies.listCandidatesForEvaluation({
    now: evaluatedAt,
  })
  const selectedStrategies = selectStrategiesForEvaluation({
    strategies: candidates,
    now: evaluatedAt,
  })

  const items = await Promise.all(
    selectedStrategies.map(async ({ strategy }) => {
      const marketObservation = await dependencies.marketData.getLatestPrice({ strategy })

      const evaluation = evaluateStrategyTrigger({
        strategy,
        marketObservation,
      })

      const previousAttempts = await dependencies.executionAttempts.listByStrategy(strategy.id)
      const decision = getSimulationDecision(strategy, evaluation, previousAttempts)

      const updatedStrategy = await dependencies.strategies.recordEvaluation({
        strategyId: strategy.id,
        evaluationState: evaluation.evaluationState,
        lastEvaluatedAt: evaluatedAt,
        nextEvaluationAt: evaluation.nextEvaluationAt ?? null,
      })

      let createdAttempt: ExecutionAttemptRecord | null = null
      let finalizedAttempt: ExecutionAttemptRecord | null = null
      let simulationOutcome: SimulationRunItem["simulationOutcome"] = "no_attempt"

      if (decision.kind === "create_attempt") {
        createdAttempt = await dependencies.executionAttempts.create(decision.attempt)

        if (createdAttempt) {
          finalizedAttempt = await finalizeSimulationAttempt(dependencies, createdAttempt)
          simulationOutcome = finalizedAttempt?.status === "simulated" ? "simulated" : "failed"
        } else {
          simulationOutcome = "failed"
        }
      }

      return {
        strategyId: strategy.id,
        evaluation,
        decision,
        simulationOutcome,
        createdAttempt,
        finalizedAttempt,
        updatedStrategy,
      }
    })
  )

  return {
    evaluatedAt,
    summary: {
      evaluatedStrategies: items.length,
      triggeredStrategies: items.filter((item) => item.evaluation.kind === "triggered").length,
      simulatedAttempts: items.filter((item) => item.simulationOutcome === "simulated").length,
      failedAttempts: items.filter((item) => item.simulationOutcome === "failed").length,
    },
    items,
  }
}

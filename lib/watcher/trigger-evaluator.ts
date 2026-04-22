import type {
  MarketObservation,
  StrategyCandidate,
  TriggerEvaluationResult,
} from "@/lib/watcher/types"

type EvaluateStrategyTriggerInput = {
  strategy: StrategyCandidate
  marketObservation: MarketObservation | null
  nextEvaluationAt?: string
}

export function evaluateStrategyTrigger(
  input: EvaluateStrategyTriggerInput
): TriggerEvaluationResult {
  const { strategy, marketObservation, nextEvaluationAt } = input

  if (strategy.status !== "active") {
    return {
      kind: "not_ready",
      evaluationState: "blocked",
      blockReason: "strategy_paused",
      nextEvaluationAt,
    }
  }

  if (!strategy.trigger_enabled) {
    return {
      kind: "not_ready",
      evaluationState: "blocked",
      blockReason: "trigger_disabled",
      nextEvaluationAt,
    }
  }

  if (strategy.take_profit_price === null && strategy.stop_loss_price === null) {
    return {
      kind: "not_ready",
      evaluationState: "blocked",
      blockReason: "missing_take_profit_and_stop_loss",
      nextEvaluationAt,
    }
  }

  if (!marketObservation || marketObservation.observedPrice === null) {
    return {
      kind: "not_ready",
      evaluationState: "idle",
      blockReason: "no_market_price",
      nextEvaluationAt,
    }
  }

  if (marketObservation.isStale) {
    return {
      kind: "not_ready",
      evaluationState: "idle",
      blockReason: "market_data_stale",
      nextEvaluationAt,
    }
  }

  const observedPrice = marketObservation.observedPrice

  if (
    strategy.take_profit_price !== null &&
    observedPrice >= strategy.take_profit_price
  ) {
    return {
      kind: "triggered",
      evaluationState: "watching",
      triggerType: "take_profit",
      observedPrice,
      nextEvaluationAt,
    }
  }

  if (strategy.stop_loss_price !== null && observedPrice <= strategy.stop_loss_price) {
    return {
      kind: "triggered",
      evaluationState: "watching",
      triggerType: "stop_loss",
      observedPrice,
      nextEvaluationAt,
    }
  }

  return {
    kind: "no_trigger",
    evaluationState: "ready",
    nextEvaluationAt,
  }
}

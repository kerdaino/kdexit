import { getExecutionReadinessSnapshot } from "@/lib/config/execution-readiness"
import { getPhase5ExecutionUiGates } from "@/lib/dashboard/phase5-gates"
import type { DbStrategyStatus } from "@/types/database-records"

export const PHASE5_STRATEGY_ACTIVATION_DISABLED_MESSAGE =
  "Strategy activation is disabled until the internal Phase 5 execution gates are enabled. Keep the strategy paused with triggers off."

export function getCurrentPhase5ExecutionUiGates() {
  return getPhase5ExecutionUiGates(getExecutionReadinessSnapshot())
}

export function isPhase5StrategyActivationEnabled() {
  return getCurrentPhase5ExecutionUiGates().strategyActivationEnabled
}

export function hasRequestedPhase5StrategyActivation(input: {
  status?: string | null
  triggerEnabled?: boolean | null
}) {
  return input.status === "active" || input.triggerEnabled === true
}

export function getPhase5StrategyActivationFields(
  strategyActivationEnabled: boolean,
  requested: {
    status?: DbStrategyStatus | null
    triggerEnabled?: boolean | null
  },
  fallback: {
    status: DbStrategyStatus
    triggerEnabled: boolean
  }
): {
  status: DbStrategyStatus
  triggerEnabled: boolean
} {
  if (!strategyActivationEnabled) {
    return {
      status: "paused",
      triggerEnabled: false,
    }
  }

  return {
    status: requested.status ?? fallback.status,
    triggerEnabled: requested.triggerEnabled ?? fallback.triggerEnabled,
  }
}

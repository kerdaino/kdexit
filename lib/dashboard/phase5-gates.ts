import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"
import type { Phase5ExecutionUiGates } from "@/types/phase5-gates"

const INTERNAL_BETA_DISABLED_REASON =
  "Execution-related controls are disabled by default. Enable dashboard beta mode, wallet-linked beta mode, and contract readiness configuration before activating strategy triggers."

export function getPhase5ExecutionUiGates(
  readiness: ExecutionReadinessSnapshot
): Phase5ExecutionUiGates {
  const internalBetaVisible =
    readiness.flags.dashboardBetaMode || readiness.flags.walletLinkedBetaMode
  const internalBetaReady =
    readiness.flags.dashboardBetaMode &&
    readiness.flags.walletLinkedBetaMode &&
    readiness.contractReadiness.enabled

  return {
    executionControlsVisible: internalBetaVisible,
    strategyActivationEnabled: internalBetaReady,
    executionPreferenceEditingEnabled: internalBetaReady,
    watcherSimulationVisible: readiness.flags.watcherSimulationMode,
    liveExecutionEnabled: readiness.contractReadiness.liveExecutionEnabled,
    disabledReason: internalBetaReady ? null : INTERNAL_BETA_DISABLED_REASON,
  }
}

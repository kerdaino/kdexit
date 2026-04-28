import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"
import type { Phase5ExecutionUiGates } from "@/types/phase5-gates"

export const PHASE5_EXECUTION_DISABLED_REASON =
  "Execution-related controls are disabled by default. Enable dashboard beta mode, wallet-linked beta mode, contract readiness, and a future live-execution gate before activating strategy triggers."

export function getPhase5ExecutionUiGates(
  readiness: ExecutionReadinessSnapshot
): Phase5ExecutionUiGates {
  const internalBetaVisible =
    readiness.flags.dashboardBetaMode || readiness.flags.walletLinkedBetaMode
  const internalBetaReady =
    readiness.flags.dashboardBetaMode &&
    readiness.flags.walletLinkedBetaMode &&
    readiness.contractReadiness.enabled
  const executionControlsEnabled = internalBetaReady && readiness.flags.liveExecutionEnabled

  return {
    executionControlsVisible: internalBetaVisible,
    strategyActivationEnabled: executionControlsEnabled,
    executionPreferenceEditingEnabled: executionControlsEnabled,
    watcherSimulationVisible: readiness.flags.watcherSimulationMode,
    liveExecutionEnabled: readiness.contractReadiness.liveExecutionEnabled,
    disabledReason: executionControlsEnabled ? null : PHASE5_EXECUTION_DISABLED_REASON,
  }
}

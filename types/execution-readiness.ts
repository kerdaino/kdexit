import type { ContractReadinessSnapshot } from "@/types/contract-readiness"

export type ExecutionReadinessStatusId =
  | "simulation_only"
  | "contract_ready_execution_disabled"
  | "internal_beta_execution_only"
  | "public_execution_unavailable"

export type ExecutionReadinessTone = "neutral" | "info" | "warning" | "success"

export type ExecutionReadinessSnapshot = {
  status: ExecutionReadinessStatusId
  tone: ExecutionReadinessTone
  label: string
  headline: string
  description: string
  contractReadiness: ContractReadinessSnapshot
  flags: {
    dashboardBetaMode: boolean
    walletLinkedBetaMode: boolean
    watcherSimulationMode: boolean
    contractReadinessMode: boolean
    liveExecutionMode: boolean
    liveExecutionKillSwitch: boolean
    liveExecutionEnabled: boolean
  }
}

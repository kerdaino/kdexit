import { getContractReadinessSnapshot } from "@/lib/config/contract-readiness"
import type {
  ExecutionReadinessSnapshot,
  ExecutionReadinessStatusId,
} from "@/types/execution-readiness"

const TRUE_VALUES = new Set(["1", "true", "yes", "on", "enabled"])

export const EXECUTION_READINESS_ENV_KEYS = {
  contractReadinessMode: "NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE",
  dashboardBetaMode: "NEXT_PUBLIC_KDEXIT_DASHBOARD_BETA_MODE",
  liveExecutionKillSwitch: "KDEXIT_LIVE_EXECUTION_KILL_SWITCH",
  liveExecutionMode: "NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE",
  walletLinkedBetaMode: "NEXT_PUBLIC_KDEXIT_WALLET_LINKED_BETA_MODE",
  watcherSimulationMode: "KDEXIT_ENABLE_WATCHER_SIMULATION",
} as const

export type PublicExecutionReadinessFlags = {
  dashboardBetaMode: boolean
  walletLinkedBetaMode: boolean
  contractReadinessMode: boolean
  liveExecutionMode: boolean
}

export type ServerExecutionReadinessFlags = PublicExecutionReadinessFlags & {
  watcherSimulationMode: boolean
  liveExecutionKillSwitch: boolean
  liveExecutionEnabled: boolean
}

function readBooleanFlag(
  value: string | undefined,
  defaultValue: boolean
): boolean {
  if (!value) {
    return defaultValue
  }

  return TRUE_VALUES.has(value.trim().toLowerCase())
}

function readPublicExecutionReadinessFlags(): PublicExecutionReadinessFlags {
  return {
    dashboardBetaMode: readBooleanFlag(
      process.env.NEXT_PUBLIC_KDEXIT_DASHBOARD_BETA_MODE,
      false
    ),
    walletLinkedBetaMode: readBooleanFlag(
      process.env.NEXT_PUBLIC_KDEXIT_WALLET_LINKED_BETA_MODE,
      false
    ),
    contractReadinessMode: readBooleanFlag(
      process.env.NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE,
      false
    ),
    liveExecutionMode: readBooleanFlag(
      process.env.NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE,
      false
    ),
  }
}

export function getPublicExecutionReadinessFlags(): PublicExecutionReadinessFlags {
  return readPublicExecutionReadinessFlags()
}

export function getServerExecutionReadinessFlags(): ServerExecutionReadinessFlags {
  const publicFlags = readPublicExecutionReadinessFlags()
  const contractReadiness = getContractReadinessSnapshot()
  const watcherSimulationMode = readBooleanFlag(
    process.env.KDEXIT_ENABLE_WATCHER_SIMULATION ??
      process.env.KDEXIT_ENABLE_INTERNAL_WATCHER_SIMULATION,
    false
  )
  const liveExecutionKillSwitch = readBooleanFlag(
    process.env.KDEXIT_LIVE_EXECUTION_KILL_SWITCH,
    true
  )

  return {
    ...publicFlags,
    watcherSimulationMode,
    liveExecutionKillSwitch,
    // Contract readiness is informational only in this phase. No env combination enables live execution.
    liveExecutionEnabled: contractReadiness.liveExecutionEnabled,
  }
}

export function isDashboardBetaModeEnabled() {
  return getPublicExecutionReadinessFlags().dashboardBetaMode
}

export function isWalletLinkedBetaModeEnabled() {
  return getPublicExecutionReadinessFlags().walletLinkedBetaMode
}

export function isWatcherSimulationModeEnabled() {
  return getServerExecutionReadinessFlags().watcherSimulationMode
}

export function isContractReadinessModeEnabled() {
  return getPublicExecutionReadinessFlags().contractReadinessMode
}

export function isLiveExecutionModeConfigured() {
  return getPublicExecutionReadinessFlags().liveExecutionMode
}

export function isGlobalLiveExecutionKillSwitchEnabled() {
  return getServerExecutionReadinessFlags().liveExecutionKillSwitch
}

export function isLiveExecutionEnabled() {
  return getServerExecutionReadinessFlags().liveExecutionEnabled
}

export function getExecutionReadinessStatus(
  flags: ServerExecutionReadinessFlags
): ExecutionReadinessStatusId {
  const betaExecutionVisible = flags.dashboardBetaMode || flags.walletLinkedBetaMode
  const contractReadiness = getContractReadinessSnapshot()

  if (flags.liveExecutionEnabled && betaExecutionVisible) {
    return "internal_beta_execution_only"
  }

  if (contractReadiness.enabled) {
    return "contract_ready_execution_disabled"
  }

  if (flags.watcherSimulationMode) {
    return "simulation_only"
  }

  return "public_execution_unavailable"
}

export function getExecutionReadinessSnapshot(): ExecutionReadinessSnapshot {
  const flags = getServerExecutionReadinessFlags()
  const contractReadiness = getContractReadinessSnapshot()
  const status = getExecutionReadinessStatus(flags)

  switch (status) {
    case "internal_beta_execution_only":
      return {
        status,
        tone: "success",
        label: "Internal Beta Execution",
        headline: "Execution surfaces are gated to internal beta only.",
        description:
          "The app can present execution-readiness states for limited internal testing, but public execution remains unavailable.",
        contractReadiness,
        flags,
      }
    case "contract_ready_execution_disabled":
      return {
        status,
        tone: "warning",
        label: "Contract Ready, Execution Disabled",
        headline: "Contract-readiness surfaces are on, but execution is still disabled.",
        description:
          "The dashboard can see contract infrastructure references for supported chains while keeping live execution unavailable.",
        contractReadiness,
        flags,
      }
    case "simulation_only":
      return {
        status,
        tone: "info",
        label: "Simulation Only",
        headline: "Watcher simulation is enabled, but live execution is not.",
        description:
          "Dry-run watcher activity can be reviewed without enabling fund movement, approvals, swaps, or contract writes.",
        contractReadiness,
        flags,
      }
    case "public_execution_unavailable":
    default:
      return {
        status: "public_execution_unavailable",
        tone: "neutral",
        label: "Public Execution Unavailable",
        headline: "The app remains in a non-public execution state.",
        description:
          "Public execution is unavailable. Any readiness surfaces stay limited until later Phase 5 work adds safer rollout controls.",
        contractReadiness,
        flags,
      }
  }
}

export function isSimulationOnlyExecutionReadiness() {
  return getExecutionReadinessSnapshot().status === "simulation_only"
}

export function isContractReadyExecutionDisabled() {
  return getExecutionReadinessSnapshot().status === "contract_ready_execution_disabled"
}

export function isInternalBetaExecutionOnly() {
  return getExecutionReadinessSnapshot().status === "internal_beta_execution_only"
}

export function isPublicExecutionUnavailable() {
  return getExecutionReadinessSnapshot().status === "public_execution_unavailable"
}

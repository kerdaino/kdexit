import "server-only"

import { getExecutionReadinessSnapshot } from "@/lib/config/execution-readiness"
import { readBooleanEnvFlag } from "@/lib/config/env"

export const EXECUTION_WORKER_ENV_KEYS = {
  dryRunEnabled: "KDEXIT_EXECUTION_WORKER_DRY_RUN_ENABLED",
  contractWriteMode: "KDEXIT_EXECUTION_WORKER_CONTRACT_WRITE_MODE",
  liveExecutionMode: "KDEXIT_EXECUTION_WORKER_LIVE_EXECUTION_MODE",
  maxStrategiesPerRun: "KDEXIT_EXECUTION_WORKER_MAX_STRATEGIES_PER_RUN",
} as const

export type ExecutionWorkerMode = "dry_run"

export type ExecutionWorkerConfig = {
  contractWriteMode: boolean
  dryRunEnabled: boolean
  liveExecutionMode: boolean
  maxStrategiesPerRun: number
  mode: ExecutionWorkerMode
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback
  }

  const parsedValue = Number(value)

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback
}

export function getExecutionWorkerConfig(): ExecutionWorkerConfig {
  return {
    contractWriteMode: readBooleanEnvFlag(
      process.env.KDEXIT_EXECUTION_WORKER_CONTRACT_WRITE_MODE,
      false
    ),
    dryRunEnabled: readBooleanEnvFlag(
      process.env.KDEXIT_EXECUTION_WORKER_DRY_RUN_ENABLED,
      false
    ),
    liveExecutionMode: readBooleanEnvFlag(
      process.env.KDEXIT_EXECUTION_WORKER_LIVE_EXECUTION_MODE,
      false
    ),
    maxStrategiesPerRun: readPositiveInteger(
      process.env.KDEXIT_EXECUTION_WORKER_MAX_STRATEGIES_PER_RUN,
      25
    ),
    mode: "dry_run",
  }
}

export function getExecutionWorkerReadinessBlockers(config = getExecutionWorkerConfig()) {
  const readiness = getExecutionReadinessSnapshot()
  const blockers: string[] = []

  if (!config.dryRunEnabled) {
    blockers.push("execution_worker_dry_run_disabled")
  }

  if (config.contractWriteMode) {
    blockers.push("contract_write_mode_must_remain_disabled")
  }

  if (config.liveExecutionMode) {
    blockers.push("worker_live_execution_mode_must_remain_disabled")
  }

  if (readiness.flags.liveExecutionEnabled) {
    blockers.push("app_live_execution_must_remain_disabled")
  }

  if (!readiness.flags.liveExecutionKillSwitch) {
    blockers.push("global_kill_switch_must_remain_on_for_scaffold")
  }

  return blockers
}

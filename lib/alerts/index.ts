import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"

export type AlertScenario =
  | "failed_api_mutation"
  | "failed_watcher_simulation"
  | "suspicious_repeated_failures"
  | "wallet_linking_error"
  | "readiness_gate_misconfiguration"

export type AlertSeverity = "info" | "warning" | "error" | "critical"

export type AlertContext = Record<
  string,
  string | number | boolean | null | undefined
>

export type Alert = {
  scenario: AlertScenario
  severity: AlertSeverity
  summary: string
  context?: AlertContext
  dedupeKey?: string
}

export type AlertTransport = {
  report: (alert: Alert) => void | Promise<void>
}

export type AlertReportResult = {
  reported: boolean
  reason?: "disabled" | "transport_not_configured"
}

const MAX_CONTEXT_KEYS = 30
const MAX_STRING_LENGTH = 160
const SECRET_KEY_PATTERN =
  /(secret|token|password|private|key|session|cookie|authorization)/i
const WALLET_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/g

let alertTransport: AlertTransport | null = null

export function setAlertTransport(transport: AlertTransport | null) {
  alertTransport = transport
}

export function isAlertingEnabled() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_KDEXIT_ALERTS_ENABLED === "true"
  }

  return (
    process.env.KDEXIT_ALERTS_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_KDEXIT_ALERTS_ENABLED === "true"
  )
}

export function sanitizeAlertContext(
  context: AlertContext | undefined
): AlertContext | undefined {
  if (!context) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(context).slice(0, MAX_CONTEXT_KEYS).map(([key, value]) => {
      if (SECRET_KEY_PATTERN.test(key)) {
        return [key, "[redacted]"]
      }

      if (typeof value === "string") {
        return [
          key,
          value
            .replace(WALLET_ADDRESS_PATTERN, "[redacted-wallet-address]")
            .slice(0, MAX_STRING_LENGTH),
        ]
      }

      return [key, value]
    })
  )
}

export async function reportAlert(alert: Alert): Promise<AlertReportResult> {
  if (!isAlertingEnabled()) {
    return { reported: false, reason: "disabled" }
  }

  if (!alertTransport) {
    return { reported: false, reason: "transport_not_configured" }
  }

  await alertTransport.report({
    ...alert,
    context: sanitizeAlertContext(alert.context),
  })

  return { reported: true }
}

export function reportApiMutationFailureAlert(input: {
  code: string
  operation: string
  resource: string
  status?: number
}) {
  return reportAlert({
    scenario: "failed_api_mutation",
    severity: "error",
    summary: "API mutation failed.",
    dedupeKey: `api_mutation:${input.resource}:${input.operation}:${input.code}`,
    context: {
      code: input.code,
      operation: input.operation,
      resource: input.resource,
      status: input.status,
    },
  })
}

export function reportWatcherSimulationFailureAlert(input: {
  failedAttempts: number
  evaluatedStrategies?: number
  route?: string
}) {
  return reportAlert({
    scenario: "failed_watcher_simulation",
    severity: "error",
    summary: "Watcher simulation produced failed attempts.",
    dedupeKey: `watcher_simulation_failed:${input.route ?? "unknown"}`,
    context: {
      evaluatedStrategies: input.evaluatedStrategies,
      failedAttempts: input.failedAttempts,
      route: input.route,
    },
  })
}

export function reportSuspiciousRepeatedFailuresAlert(input: {
  failureCount: number
  scope: string
  threshold?: number
}) {
  const threshold = input.threshold ?? 3

  if (input.failureCount < threshold) {
    return Promise.resolve<AlertReportResult>({
      reported: false,
      reason: "disabled",
    })
  }

  return reportAlert({
    scenario: "suspicious_repeated_failures",
    severity: "critical",
    summary: "Repeated failures crossed the alert threshold.",
    dedupeKey: `repeated_failures:${input.scope}`,
    context: {
      failureCount: input.failureCount,
      scope: input.scope,
      threshold,
    },
  })
}

export function reportWalletLinkingErrorAlert(input: {
  code: string
  operation: string
  source: "client" | "api"
}) {
  return reportAlert({
    scenario: "wallet_linking_error",
    severity: "error",
    summary: "Wallet-linking operation failed.",
    dedupeKey: `wallet_linking:${input.source}:${input.operation}:${input.code}`,
    context: {
      code: input.code,
      operation: input.operation,
      source: input.source,
    },
  })
}

export function getReadinessGateMisconfigurationReasons(
  readiness: ExecutionReadinessSnapshot
) {
  const reasons: string[] = []

  if (
    readiness.flags.liveExecutionMode &&
    readiness.flags.liveExecutionKillSwitch
  ) {
    reasons.push("Live execution mode is requested while the kill switch is on.")
  }

  if (
    readiness.flags.liveExecutionEnabled &&
    (!readiness.flags.dashboardBetaMode || !readiness.flags.walletLinkedBetaMode)
  ) {
    reasons.push("Live execution is enabled without all internal beta gates.")
  }

  if (
    readiness.flags.contractReadinessMode &&
    readiness.contractReadiness.missingReasons.length > 0
  ) {
    reasons.push("Contract readiness mode is on with missing contract references.")
  }

  if (
    readiness.flags.walletLinkedBetaMode &&
    !readiness.flags.dashboardBetaMode
  ) {
    reasons.push("Wallet-linked beta mode is on while dashboard beta mode is off.")
  }

  return reasons
}

export function reportReadinessGateMisconfigurationAlert(
  readiness: ExecutionReadinessSnapshot
) {
  const reasons = getReadinessGateMisconfigurationReasons(readiness)

  if (reasons.length === 0) {
    return Promise.resolve<AlertReportResult>({
      reported: false,
      reason: "disabled",
    })
  }

  return reportAlert({
    scenario: "readiness_gate_misconfiguration",
    severity: "warning",
    summary: "Execution-readiness gates appear misconfigured.",
    dedupeKey: `readiness_gate:${readiness.status}`,
    context: {
      contractReadinessMode: readiness.flags.contractReadinessMode,
      dashboardBetaMode: readiness.flags.dashboardBetaMode,
      liveExecutionEnabled: readiness.flags.liveExecutionEnabled,
      liveExecutionKillSwitch: readiness.flags.liveExecutionKillSwitch,
      liveExecutionMode: readiness.flags.liveExecutionMode,
      reasonCount: reasons.length,
      status: readiness.status,
      walletLinkedBetaMode: readiness.flags.walletLinkedBetaMode,
      watcherSimulationMode: readiness.flags.watcherSimulationMode,
    },
  })
}

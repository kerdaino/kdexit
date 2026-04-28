import type {
  MonitoringContext,
  MonitoringError,
  MonitoringEvent,
  MonitoringReportResult,
  MonitoringTransport,
} from "@/types/monitoring"

const MAX_CONTEXT_KEYS = 40
const SECRET_KEY_PATTERN = /(secret|token|password|private|key|session|cookie)/i

let monitoringTransport: MonitoringTransport | null = null

export function setMonitoringTransport(transport: MonitoringTransport | null) {
  monitoringTransport = transport
}

export function sanitizeMonitoringContext(
  context: MonitoringContext | undefined
): MonitoringContext | undefined {
  if (!context) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(context)
      .slice(0, MAX_CONTEXT_KEYS)
      .map(([key, value]) => [
        key,
        SECRET_KEY_PATTERN.test(key) ? "[redacted]" : value,
      ])
  )
}

export async function reportMonitoringEvent(
  enabled: boolean,
  event: MonitoringEvent
): Promise<MonitoringReportResult> {
  if (!enabled) {
    return { reported: false, reason: "disabled" }
  }

  if (!monitoringTransport) {
    return { reported: false, reason: "transport_not_configured" }
  }

  await monitoringTransport.reportEvent({
    ...event,
    severity: event.severity ?? "info",
    context: sanitizeMonitoringContext(event.context),
  })

  return { reported: true }
}

export async function reportMonitoringError(
  enabled: boolean,
  error: MonitoringError
): Promise<MonitoringReportResult> {
  if (!enabled) {
    return { reported: false, reason: "disabled" }
  }

  if (!monitoringTransport) {
    return { reported: false, reason: "transport_not_configured" }
  }

  await monitoringTransport.reportError({
    ...error,
    severity: error.severity ?? "error",
    context: sanitizeMonitoringContext(error.context),
  })

  return { reported: true }
}

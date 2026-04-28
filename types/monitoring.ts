export type MonitoringRuntime = "client" | "server"

export type MonitoringSeverity = "debug" | "info" | "warning" | "error" | "critical"

export type MonitoringContext = Record<
  string,
  string | number | boolean | null | undefined
>

export type MonitoringEvent = {
  name: string
  severity?: MonitoringSeverity
  context?: MonitoringContext
}

export type MonitoringError = {
  error: unknown
  severity?: MonitoringSeverity
  context?: MonitoringContext
}

export type MonitoringTransport = {
  reportEvent: (event: MonitoringEvent) => void | Promise<void>
  reportError: (error: MonitoringError) => void | Promise<void>
}

export type MonitoringConfig = {
  enabled: boolean
  runtime: MonitoringRuntime
  environment: string
  release: string | null
}

export type MonitoringReportResult = {
  reported: boolean
  reason?: "disabled" | "transport_not_configured"
}

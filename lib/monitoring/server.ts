import "server-only"

import { readBooleanEnvFlag } from "@/lib/config/env"
import {
  reportMonitoringError,
  reportMonitoringEvent,
} from "@/lib/monitoring/shared"
import type {
  MonitoringConfig,
  MonitoringContext,
  MonitoringError,
  MonitoringEvent,
} from "@/types/monitoring"

export function getServerMonitoringConfig(): MonitoringConfig {
  return {
    enabled: readBooleanEnvFlag(process.env.KDEXIT_MONITORING_ENABLED, false),
    runtime: "server",
    environment: process.env.KDEXIT_MONITORING_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.KDEXIT_RELEASE ?? null,
  }
}

export function reportServerEvent(event: MonitoringEvent) {
  const config = getServerMonitoringConfig()

  return reportMonitoringEvent(config.enabled, {
    ...event,
    context: withMonitoringConfigContext(event.context, config),
  })
}

export function reportServerError(error: MonitoringError) {
  const config = getServerMonitoringConfig()

  return reportMonitoringError(config.enabled, {
    ...error,
    context: withMonitoringConfigContext(error.context, config),
  })
}

function withMonitoringConfigContext(
  context: MonitoringContext | undefined,
  config: MonitoringConfig
): MonitoringContext {
  return {
    ...context,
    monitoringRuntime: config.runtime,
    monitoringEnvironment: config.environment,
    monitoringRelease: config.release,
  }
}

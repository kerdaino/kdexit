"use client"

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

export function getClientMonitoringConfig(): MonitoringConfig {
  return {
    enabled: readBooleanEnvFlag(
      process.env.NEXT_PUBLIC_KDEXIT_MONITORING_ENABLED,
      false
    ),
    runtime: "client",
    environment:
      process.env.NEXT_PUBLIC_KDEXIT_MONITORING_ENVIRONMENT ?? "development",
    release: process.env.NEXT_PUBLIC_KDEXIT_RELEASE ?? null,
  }
}

export function reportClientEvent(event: MonitoringEvent) {
  const config = getClientMonitoringConfig()

  return reportMonitoringEvent(config.enabled, {
    ...event,
    context: withMonitoringConfigContext(event.context, config),
  })
}

export function reportClientError(error: MonitoringError) {
  const config = getClientMonitoringConfig()

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

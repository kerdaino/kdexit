import { initialExecutions, initialStrategies } from "@/lib/mocks/dashboard"
import { normalizeStrategy } from "@/lib/dashboard/utils"
import type { Execution, Strategy } from "@/types/strategy"

const DASHBOARD_STORAGE_KEYS = {
  strategies: "kdexit_strategies",
  executions: "kdexit_executions",
} as const

function loadStoredItem<T>(key: string, fallback: T): T {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) {
    return fallback
  }

  return JSON.parse(storedValue) as T
}

function saveStoredItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadDashboardData() {
  const storedStrategies = loadStoredItem<Strategy[]>(
    DASHBOARD_STORAGE_KEYS.strategies,
    initialStrategies
  )

  return {
    strategies: storedStrategies.map((strategy) => normalizeStrategy(strategy)),
    executions: loadStoredItem<Execution[]>(
      DASHBOARD_STORAGE_KEYS.executions,
      initialExecutions
    ),
  }
}

export function saveDashboardStrategies(strategies: Strategy[]) {
  saveStoredItem(DASHBOARD_STORAGE_KEYS.strategies, strategies)
}

export function saveDashboardExecutions(executions: Execution[]) {
  saveStoredItem(DASHBOARD_STORAGE_KEYS.executions, executions)
}

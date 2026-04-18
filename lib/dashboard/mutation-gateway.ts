import { getStrategyExecutionDataMode } from "@/lib/data"
import {
  createDashboardExecution as createDashboardExecutionFromRepository,
  createDashboardStrategy as createDashboardStrategyFromRepository,
  deleteDashboardStrategy as deleteDashboardStrategyFromRepository,
  listDashboardExecutions as listDashboardExecutionsFromRepository,
  listDashboardStrategies as listDashboardStrategiesFromRepository,
  pauseDashboardStrategy as pauseDashboardStrategyFromRepository,
  resumeDashboardStrategy as resumeDashboardStrategyFromRepository,
  updateDashboardStrategy as updateDashboardStrategyFromRepository,
} from "@/lib/dashboard/repository"
import type { Execution, Strategy } from "@/types/strategy"

type DashboardExecutionInput = Omit<Execution, "id" | "executedAt"> & {
  id?: string
  executedAt?: string
  strategyId?: string
}

export type DashboardMutationApproach =
  | "client-repository"
  | "server-actions"
  | "api-routes"
  | "hybrid"

export type DashboardMutationPlan = {
  recommendedApproach: DashboardMutationApproach
  activeTransport: "client-repository"
  reason:
    | "browser-owned-persistence"
    | "future-server-boundary-ready"
}

function getDashboardMutationPlan(): DashboardMutationPlan {
  const dataMode = getStrategyExecutionDataMode()

  if (dataMode === "localStorage") {
    return {
      recommendedApproach: "hybrid",
      activeTransport: "client-repository",
      reason: "browser-owned-persistence",
    }
  }

  return {
    recommendedApproach: "hybrid",
    activeTransport: "client-repository",
    reason: "future-server-boundary-ready",
  }
}

export function getDashboardMutationRecommendation() {
  return getDashboardMutationPlan()
}

export async function listDashboardStrategies() {
  return listDashboardStrategiesFromRepository()
}

export async function listDashboardExecutions() {
  return listDashboardExecutionsFromRepository()
}

export async function createDashboardStrategy(strategy: Strategy) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "client-repository":
      return createDashboardStrategyFromRepository(strategy)
  }
}

export async function updateDashboardStrategy(strategy: Strategy) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "client-repository":
      return updateDashboardStrategyFromRepository(strategy)
  }
}

export async function deleteDashboardStrategy(id: string) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "client-repository":
      return deleteDashboardStrategyFromRepository(id)
  }
}

export async function pauseDashboardStrategy(id: string) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "client-repository":
      return pauseDashboardStrategyFromRepository(id)
  }
}

export async function resumeDashboardStrategy(id: string) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "client-repository":
      return resumeDashboardStrategyFromRepository(id)
  }
}

export async function createDashboardExecution(input: DashboardExecutionInput) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "client-repository":
      return createDashboardExecutionFromRepository(input)
  }
}

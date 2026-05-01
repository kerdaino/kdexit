import { getStrategyExecutionDataMode } from "@/lib/data"
import {
  listExecutionAttemptsFromApi,
  cancelExecutionAuthorizationFromApi,
  createExecutionFromApi,
  createStrategyFromApi,
  deleteStrategyFromApi,
  listExecutionsFromApi,
  listStrategiesFromApi,
  storeExecutionAuthorizationFromApi,
  updateStrategyFromApi,
  type ExecutionAuthorizationApiInput,
} from "@/lib/dashboard/api-client"
import {
  createDashboardExecution as createDashboardExecutionFromRepository,
  createDashboardStrategy as createDashboardStrategyFromRepository,
  deleteDashboardStrategy as deleteDashboardStrategyFromRepository,
  listDashboardExecutionAttempts as listDashboardExecutionAttemptsFromRepository,
  listDashboardExecutions as listDashboardExecutionsFromRepository,
  listDashboardStrategies as listDashboardStrategiesFromRepository,
  pauseDashboardStrategy as pauseDashboardStrategyFromRepository,
  resumeDashboardStrategy as resumeDashboardStrategyFromRepository,
  toDashboardExecution,
  toDashboardExecutionAttempt,
  toDashboardStrategy,
  toExecutionInsert,
  toStrategyInsert,
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
  activeTransport: "client-repository" | "api-routes"
  reason:
    | "browser-owned-persistence"
    | "future-server-boundary-ready"
    | "authenticated-supabase-api"
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
    activeTransport: "api-routes",
    reason: "authenticated-supabase-api",
  }
}

export function getDashboardMutationRecommendation() {
  return getDashboardMutationPlan()
}

export async function listDashboardStrategies() {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return listStrategiesFromApi().then((records) => records.map(toDashboardStrategy))
    case "client-repository":
      return listDashboardStrategiesFromRepository()
  }
}

export async function listDashboardExecutions() {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return listExecutionsFromApi().then((records) => records.map(toDashboardExecution))
    case "client-repository":
      return listDashboardExecutionsFromRepository()
  }
}

export async function listDashboardExecutionAttempts() {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return listExecutionAttemptsFromApi().then((records) =>
        records.map(toDashboardExecutionAttempt)
      )
    case "client-repository":
      return listDashboardExecutionAttemptsFromRepository()
  }
}

export async function createDashboardStrategy(strategy: Strategy) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return createStrategyFromApi(toStrategyInsert(strategy)).then(toDashboardStrategy)
    case "client-repository":
      return createDashboardStrategyFromRepository(strategy)
  }
}

export async function updateDashboardStrategy(strategy: Strategy) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return updateStrategyFromApi(strategy.id, {
        token_name: strategy.tokenName,
        token_symbol: strategy.tokenSymbol,
        token_address: strategy.tokenAddress,
        chain: strategy.chain,
        chain_id: strategy.chainId,
        sell_percentage: strategy.sellPercentage,
        take_profit_price: strategy.takeProfitPrice ?? null,
        stop_loss_price: strategy.stopLossPrice ?? null,
        trigger_enabled: strategy.triggerEnabled,
        slippage: strategy.slippage,
        notes: strategy.notes ?? null,
        status: strategy.status,
      }).then(toDashboardStrategy)
    case "client-repository":
      return updateDashboardStrategyFromRepository(strategy)
  }
}

export async function deleteDashboardStrategy(id: string) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return deleteStrategyFromApi(id).then(() => undefined)
    case "client-repository":
      return deleteDashboardStrategyFromRepository(id)
  }
}

export async function pauseDashboardStrategy(id: string) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return updateStrategyFromApi(id, {
        status: "paused",
        trigger_enabled: false,
      }).then(toDashboardStrategy)
    case "client-repository":
      return pauseDashboardStrategyFromRepository(id)
  }
}

export async function resumeDashboardStrategy(id: string) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return updateStrategyFromApi(id, {
        status: "active",
        trigger_enabled: true,
      }).then(toDashboardStrategy)
    case "client-repository":
      return resumeDashboardStrategyFromRepository(id)
  }
}

export async function storeDashboardExecutionAuthorization(
  strategyId: string,
  input: ExecutionAuthorizationApiInput
) {
  return storeExecutionAuthorizationFromApi(strategyId, input).then(toDashboardStrategy)
}

export async function cancelDashboardExecutionAuthorization(strategyId: string) {
  return cancelExecutionAuthorizationFromApi(strategyId).then(toDashboardStrategy)
}

export async function createDashboardExecution(input: DashboardExecutionInput) {
  const plan = getDashboardMutationPlan()

  switch (plan.activeTransport) {
    case "api-routes":
      return createExecutionFromApi(toExecutionInsert(input)).then(toDashboardExecution)
    case "client-repository":
      return createDashboardExecutionFromRepository(input)
  }
}

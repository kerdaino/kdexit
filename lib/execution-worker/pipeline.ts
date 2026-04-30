import "server-only"

import { createHash } from "node:crypto"
import { getContractReadinessSnapshot } from "@/lib/config/contract-readiness"
import {
  getExecutionWorkerConfig,
  getExecutionWorkerReadinessBlockers,
} from "@/lib/execution-worker/config"
import type {
  ExecutionWorkerBlockReason,
  ExecutionWorkerMarketDataProvider,
  ExecutionWorkerRepository,
  ExecutionWorkerRunInput,
  ExecutionWorkerRunItem,
  ExecutionWorkerRunResult,
  ExecutionWorkerStrategyCandidate,
  PreparedContractExecutionPayload,
} from "@/lib/execution-worker/types"
import { getNextAttemptNumber } from "@/lib/watcher/execution-attempts"
import { evaluateStrategyTrigger } from "@/lib/watcher/trigger-evaluator"
import type { MarketObservation, TriggerEvaluationResult } from "@/lib/watcher/types"
import type { DbExecutionTriggerType } from "@/types/database-records"

function createObservationKey(
  strategy: Pick<ExecutionWorkerStrategyCandidate, "id" | "chain_id" | "token_address">
) {
  return `${strategy.id}:${strategy.chain_id}:${strategy.token_address.toLowerCase()}`
}

export function createExecutionWorkerMarketDataProvider(
  observations: MarketObservation[]
): ExecutionWorkerMarketDataProvider {
  const observationMap = new Map<string, MarketObservation>()

  for (const observation of observations) {
    const key = `${observation.strategyId ?? ""}:${observation.chainId}:${observation.tokenAddress.toLowerCase()}`
    observationMap.set(key, observation)
  }

  return {
    async getLatestPrice({ strategy }) {
      const exactKey = createObservationKey(strategy)
      const fallbackKey = `:${strategy.chain_id}:${strategy.token_address.toLowerCase()}`

      return observationMap.get(exactKey) ?? observationMap.get(fallbackKey) ?? null
    },
  }
}

function hashPreparedPayload(payload: PreparedContractExecutionPayload) {
  const serializedPayload = JSON.stringify(payload, Object.keys(payload).sort())
  return `sha256:${createHash("sha256").update(serializedPayload).digest("hex")}`
}

function getEvaluationBlockReason(
  evaluation: TriggerEvaluationResult
): ExecutionWorkerBlockReason | null {
  if (evaluation.kind === "triggered") {
    return null
  }

  if (evaluation.kind === "no_trigger") {
    return "trigger_not_met"
  }

  switch (evaluation.blockReason) {
    case "no_market_price":
      return "no_market_price"
    case "market_data_stale":
      return "market_data_stale"
    default:
      return "trigger_not_met"
  }
}

function getStrategyAuthorizationBlockReason(
  strategy: ExecutionWorkerStrategyCandidate
): ExecutionWorkerBlockReason | null {
  if (!strategy.token_address) {
    return "token_address_missing"
  }

  if (!strategy.authorization_reference) {
    return "authorization_missing"
  }

  if (strategy.authorization_status !== "authorized") {
    return "authorization_not_active"
  }

  return null
}

function createBlockedItem(input: {
  attempt?: ExecutionWorkerRunItem["attempt"]
  blockReason: ExecutionWorkerBlockReason
  evaluation?: TriggerEvaluationResult | null
  marketObservation?: MarketObservation | null
  strategyId: string
}): ExecutionWorkerRunItem {
  return {
    attempt: input.attempt ?? null,
    blockReason: input.blockReason,
    evaluation: input.evaluation ?? null,
    marketObservation: input.marketObservation ?? null,
    preparedPayload: null,
    preparedPayloadHash: null,
    strategyId: input.strategyId,
  }
}

function preparePayload(input: {
  strategy: ExecutionWorkerStrategyCandidate
  triggerType: PreparedContractExecutionPayload["triggerType"]
  walletAddress: string
}): PreparedContractExecutionPayload {
  const contractReadiness = getContractReadinessSnapshot()

  return {
    chainId: input.strategy.chain_id,
    controllerAddress: contractReadiness.executionControllerAddress,
    executionMode: "dry_run",
    sellPercentage: input.strategy.sell_percentage,
    strategyId: input.strategy.id,
    tokenAddress: input.strategy.token_address,
    tokenSymbol: input.strategy.token_symbol,
    triggerType: input.triggerType,
    walletAddress: input.walletAddress,
  }
}

async function createBlockedAttempt(input: {
  blockReason: ExecutionWorkerBlockReason
  repository: ExecutionWorkerRepository
  strategy: ExecutionWorkerStrategyCandidate
  triggerType: Extract<DbExecutionTriggerType, "take_profit" | "stop_loss">
}) {
  const previousAttempts = await input.repository.listAttemptsByStrategy(input.strategy.id)

  return input.repository.createAttempt({
    attempt_number: getNextAttemptNumber(previousAttempts),
    blocked_reason: input.blockReason,
    execution_mode: "dry_run",
    failure_reason: input.blockReason,
    reconciliation_status: "not_required",
    retry_count: 0,
    simulation_mode: true,
    status: "blocked",
    strategy_id: input.strategy.id,
    transaction_hash: null,
    trigger_type: input.triggerType,
    user_id: input.strategy.user_id,
  })
}

export async function runExecutionWorkerDryRun(input: {
  clock?: { now(): Date }
  marketData?: ExecutionWorkerMarketDataProvider
  repository: ExecutionWorkerRepository
  run: ExecutionWorkerRunInput
}): Promise<ExecutionWorkerRunResult> {
  const clock = input.clock ?? { now: () => new Date() }
  const config = getExecutionWorkerConfig()
  const readinessBlockers = getExecutionWorkerReadinessBlockers(config)
  const evaluatedAt = clock.now().toISOString()
  const marketData =
    input.marketData ?? createExecutionWorkerMarketDataProvider(input.run.observations)

  if (readinessBlockers.length > 0) {
    return {
      evaluatedAt,
      items: [
        createBlockedItem({
          blockReason: config.dryRunEnabled ? "readiness_gate_blocked" : "worker_disabled",
          strategyId: "worker",
        }),
      ],
      mode: "dry_run",
      summary: {
        blocked: 1,
        createdAttempts: 0,
        evaluatedStrategies: 0,
        preparedPayloads: 0,
        triggered: 0,
      },
    }
  }

  const strategies = await input.repository.listEligibleStrategies({
    limit: config.maxStrategiesPerRun,
    now: evaluatedAt,
    strategyIds: input.run.strategyIds,
    userId: input.run.userId,
  })

  const items: ExecutionWorkerRunItem[] = []

  for (const strategy of strategies) {
    const marketObservation = await marketData.getLatestPrice({ strategy })
    const evaluation = evaluateStrategyTrigger({
      marketObservation,
      strategy,
    })

    await input.repository.recordStrategyEvaluation({
      evaluationState: evaluation.evaluationState,
      lastEvaluatedAt: evaluatedAt,
      nextEvaluationAt: evaluation.nextEvaluationAt ?? null,
      strategyId: strategy.id,
      userId: strategy.user_id,
    })

    const evaluationBlockReason = getEvaluationBlockReason(evaluation)

    if (evaluationBlockReason || evaluation.kind !== "triggered") {
      items.push(
        createBlockedItem({
          blockReason: evaluationBlockReason ?? "trigger_not_met",
          evaluation,
          marketObservation,
          strategyId: strategy.id,
        })
      )
      continue
    }

    const wallet = await input.repository.getPrimaryWalletForStrategy({
      chainId: strategy.chain_id,
      userId: strategy.user_id,
    })

    if (!wallet) {
      const attempt = await createBlockedAttempt({
        blockReason: "linked_wallet_missing",
        repository: input.repository,
        strategy,
        triggerType: evaluation.triggerType,
      })

      items.push(
        createBlockedItem({
          attempt,
          blockReason: "linked_wallet_missing",
          evaluation,
          marketObservation,
          strategyId: strategy.id,
        })
      )
      continue
    }

    const authorizationBlockReason = getStrategyAuthorizationBlockReason(strategy)

    if (authorizationBlockReason) {
      const attempt = await createBlockedAttempt({
        blockReason: authorizationBlockReason,
        repository: input.repository,
        strategy,
        triggerType: evaluation.triggerType,
      })

      items.push(
        createBlockedItem({
          attempt,
          blockReason: authorizationBlockReason,
          evaluation,
          marketObservation,
          strategyId: strategy.id,
        })
      )
      continue
    }

    const preparedPayload = preparePayload({
      strategy,
      triggerType: evaluation.triggerType,
      walletAddress: wallet.wallet_address,
    })
    const preparedPayloadHash = hashPreparedPayload(preparedPayload)
    const previousAttempts = await input.repository.listAttemptsByStrategy(strategy.id)
    const createdAttempt = await input.repository.createAttempt({
      attempt_number: getNextAttemptNumber(previousAttempts),
      blocked_reason: null,
      execution_mode: "dry_run",
      failure_reason: null,
      prepared_payload_hash: preparedPayloadHash,
      reconciliation_status: "not_required",
      retry_count: 0,
      simulation_mode: true,
      status: "pending",
      strategy_id: strategy.id,
      transaction_hash: null,
      trigger_type: evaluation.triggerType,
      user_id: strategy.user_id,
    })

    const finalizedAttempt = createdAttempt
      ? await input.repository.updateAttempt({
          attemptId: createdAttempt.id,
          blockedReason: "contract_write_mode_disabled",
          failureReason: null,
          preparedPayloadHash,
          reconciliationDetail:
            "Dry-run worker prepared a payload hash only. No transaction was signed or sent.",
          reconciliationStatus: "not_required",
          status: "simulated",
          transactionHash: null,
        })
      : null

    items.push({
      attempt: finalizedAttempt ?? createdAttempt,
      blockReason: "contract_write_mode_disabled",
      evaluation,
      marketObservation,
      preparedPayload,
      preparedPayloadHash,
      strategyId: strategy.id,
    })
  }

  return {
    evaluatedAt,
    items,
    mode: "dry_run",
    summary: {
      blocked: items.filter((item) => item.blockReason !== null).length,
      createdAttempts: items.filter((item) => item.attempt !== null).length,
      evaluatedStrategies: strategies.length,
      preparedPayloads: items.filter((item) => item.preparedPayloadHash !== null).length,
      triggered: items.filter((item) => item.evaluation?.kind === "triggered").length,
    },
  }
}

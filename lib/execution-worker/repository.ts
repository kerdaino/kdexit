import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import type {
  ExecutionWorkerRepository,
  ExecutionWorkerStrategyCandidate,
} from "@/lib/execution-worker/types"
import type {
  ExecutionAttemptRecord,
  StrategyRecord,
  WalletLinkRecord,
} from "@/types/database-records"

export function createSupabaseExecutionWorkerRepository(
  supabase: SupabaseClient<Database>
): ExecutionWorkerRepository {
  return {
    async listEligibleStrategies({ limit, now, strategyIds, userId }) {
      let query = supabase
        .from("strategies")
        .select(
          [
            "id",
            "user_id",
            "token_symbol",
            "token_address",
            "chain",
            "chain_id",
            "sell_percentage",
            "take_profit_price",
            "stop_loss_price",
            "trigger_enabled",
            "status",
            "evaluation_state",
            "last_evaluated_at",
            "next_evaluation_at",
            "simulation_mode",
            "authorization_status",
            "authorization_reference",
            "execution_mode",
          ].join(", ")
        )
        .eq("user_id", userId)
        .eq("status", "active")
        .eq("trigger_enabled", true)
        .in("execution_mode", ["dry_run", "live_disabled"])
        .or(`next_evaluation_at.is.null,next_evaluation_at.lte.${now}`)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (strategyIds && strategyIds.length > 0) {
        query = query.in("id", strategyIds)
      }

      const { data, error } = await query

      if (error || !data) {
        return []
      }

      return data as ExecutionWorkerStrategyCandidate[]
    },

    async getPrimaryWalletForStrategy({ chainId, userId }) {
      const { data, error } = await supabase
        .from("wallet_links")
        .select("*")
        .eq("user_id", userId)
        .eq("chain_id", chainId)
        .eq("is_primary", true)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      return data as WalletLinkRecord
    },

    async listAttemptsByStrategy(strategyId) {
      const { data, error } = await supabase
        .from("execution_attempts")
        .select("*")
        .eq("strategy_id", strategyId)
        .order("attempt_number", { ascending: false })

      if (error || !data) {
        return []
      }

      return data as ExecutionAttemptRecord[]
    },

    async createAttempt(input) {
      const { data, error } = await supabase
        .from("execution_attempts")
        .insert(input as never)
        .select("*")
        .single()

      if (error || !data) {
        return null
      }

      return data as ExecutionAttemptRecord
    },

    async updateAttempt(input) {
      const { data, error } = await supabase
        .from("execution_attempts")
        .update(
          {
            blocked_reason: input.blockedReason ?? null,
            failure_reason: input.failureReason ?? null,
            prepared_payload_hash: input.preparedPayloadHash ?? null,
            reconciliation_detail: input.reconciliationDetail ?? null,
            reconciliation_status: input.reconciliationStatus ?? "not_required",
            status: input.status,
            transaction_hash: input.transactionHash ?? null,
          } as never
        )
        .eq("id", input.attemptId)
        .select("*")
        .single()

      if (error || !data) {
        return null
      }

      return data as ExecutionAttemptRecord
    },

    async recordStrategyEvaluation(input) {
      const { data, error } = await supabase
        .from("strategies")
        .update(
          {
            evaluation_state: input.evaluationState,
            last_evaluated_at: input.lastEvaluatedAt,
            next_evaluation_at: input.nextEvaluationAt ?? null,
          } as never
        )
        .eq("id", input.strategyId)
        .eq("user_id", input.userId)
        .select("*")
        .single()

      if (error || !data) {
        return null
      }

      return data as StrategyRecord
    },
  }
}

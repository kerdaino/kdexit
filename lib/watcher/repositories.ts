import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import type {
  ExecutionAttemptInsert,
  ExecutionAttemptRecord,
  StrategyRecord,
} from "@/types/database-records"
import type {
  StrategyCandidate,
  StrategyEvaluationUpdate,
  WatcherExecutionAttemptRepository,
  WatcherStrategyRepository,
} from "@/lib/watcher/types"

export function createSupabaseWatcherStrategyRepository(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: {
    strategyIds?: string[]
  } = {}
): WatcherStrategyRepository {
  return {
    async listCandidatesForEvaluation({ now }) {
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
            "take_profit_price",
            "stop_loss_price",
            "trigger_enabled",
            "status",
            "evaluation_state",
            "last_evaluated_at",
            "next_evaluation_at",
            "simulation_mode",
          ].join(", ")
        )
        .eq("user_id", userId)
        .eq("simulation_mode", true)
        .eq("status", "active")
        .eq("trigger_enabled", true)
        .or(`next_evaluation_at.is.null,next_evaluation_at.lte.${now}`)
        .order("created_at", { ascending: false })

      if (options.strategyIds && options.strategyIds.length > 0) {
        query = query.in("id", options.strategyIds)
      }

      const { data, error } = await query

      if (error || !data) {
        return []
      }

      return data as StrategyCandidate[]
    },

    async recordEvaluation(update: StrategyEvaluationUpdate) {
      const { data, error } = await supabase
        .from("strategies")
        .update(
          {
            evaluation_state: update.evaluationState,
            last_evaluated_at: update.lastEvaluatedAt,
            next_evaluation_at: update.nextEvaluationAt,
          } as never
        )
        .eq("id", update.strategyId)
        .eq("user_id", userId)
        .eq("simulation_mode", true)
        .select("*")
        .single()

      if (error) {
        return null
      }

      return data as StrategyRecord
    },
  }
}

export function createSupabaseWatcherExecutionAttemptRepository(
  supabase: SupabaseClient<Database>,
  userId: string
): WatcherExecutionAttemptRepository {
  return {
    async listByStrategy(strategyId: string) {
      const { data, error } = await supabase
        .from("execution_attempts")
        .select("*")
        .eq("user_id", userId)
        .eq("strategy_id", strategyId)
        .order("attempt_number", { ascending: false })

      if (error || !data) {
        return []
      }

      return data as ExecutionAttemptRecord[]
    },

    async create(input: ExecutionAttemptInsert) {
      const { data, error } = await supabase
        .from("execution_attempts")
        .insert({
          ...input,
          user_id: userId,
          simulation_mode: true,
        } as never)
        .select("*")
        .single()

      if (error) {
        return null
      }

      return data as ExecutionAttemptRecord
    },

    async updateStatus(input) {
      const { data, error } = await supabase
        .from("execution_attempts")
        .update(
          {
            status: input.status,
            failure_reason: input.failureReason ?? null,
            retry_count: input.retryCount,
            transaction_hash: input.transactionHash ?? null,
            simulation_mode: true,
          } as never
        )
        .eq("id", input.id)
        .eq("user_id", userId)
        .select("*")
        .single()

      if (error) {
        return null
      }

      return data as ExecutionAttemptRecord
    },
  }
}

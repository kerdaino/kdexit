import type { SupabaseClient } from "@supabase/supabase-js"
import type { WatcherSimulationRequestInput } from "@/lib/api/contracts"
import type { Database } from "@/lib/supabase/types"
import { createStaticMarketDataProvider } from "@/lib/watcher/market-data"
import {
  createSupabaseWatcherExecutionAttemptRepository,
  createSupabaseWatcherStrategyRepository,
} from "@/lib/watcher/repositories"
import { runWatcherSimulation } from "@/lib/watcher/simulation"

export async function runAuthenticatedWatcherSimulation(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: WatcherSimulationRequestInput
) {
  return runWatcherSimulation({
    clock: {
      now: () => new Date(),
    },
    strategies: createSupabaseWatcherStrategyRepository(supabase, userId, {
      strategyIds: input.strategyIds,
    }),
    executionAttempts: createSupabaseWatcherExecutionAttemptRepository(supabase, userId),
    marketData: createStaticMarketDataProvider(
      input.observations.map((observation) => ({
        strategyId: observation.strategyId,
        chainId: observation.chainId,
        tokenAddress: observation.tokenAddress,
        observedPrice: observation.observedPrice,
        observedAt: observation.observedAt ?? new Date().toISOString(),
        source: observation.source,
        isStale: observation.isStale,
      }))
    ),
  })
}

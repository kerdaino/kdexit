import type {
  MarketObservation,
  StrategyCandidate,
  WatcherMarketDataProvider,
} from "@/lib/watcher/types"

function createObservationKey(strategy: Pick<StrategyCandidate, "id" | "chain_id" | "token_address">) {
  return `${strategy.id}:${strategy.chain_id}:${strategy.token_address.toLowerCase()}`
}

export function createStaticMarketDataProvider(
  observations: MarketObservation[]
): WatcherMarketDataProvider {
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

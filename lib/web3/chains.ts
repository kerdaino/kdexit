import { bsc, mainnet, polygon } from "wagmi/chains"

export const kdexitChainRegistry = [
  {
    key: "bnb",
    label: "BNB Chain",
    chain: bsc,
    enabled: true,
  },
  {
    key: "polygon",
    label: "Polygon",
    chain: polygon,
    enabled: false,
  },
  {
    key: "ethereum",
    label: "Ethereum",
    chain: mainnet,
    enabled: false,
  },
] as const

export const kdexitEnabledWagmiChains = kdexitChainRegistry
  .filter((entry) => entry.enabled)
  .map((entry) => entry.chain)

export const kdexitStrategyChainOptions = kdexitChainRegistry.map((entry) => entry.label)

export const primaryKdexitChain = kdexitChainRegistry[0]
export const kdexitWalletChains = [primaryKdexitChain.chain] as const

export function getSupportedChainLabels() {
  return kdexitChainRegistry.map((entry) => entry.label)
}

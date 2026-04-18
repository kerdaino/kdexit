import type { Execution, Strategy } from "@/types/strategy"

export const initialStrategies: Strategy[] = [
  {
    id: "1",
    tokenName: "Binance Coin",
    tokenSymbol: "BNB",
    tokenAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    chain: "BNB Chain",
    chainId: 56,
    sellPercentage: 50,
    takeProfitPrice: 850,
    stopLossPrice: 540,
    triggerEnabled: true,
    slippage: 1,
    notes: "Primary trend strategy for higher-liquidity exits.",
    status: "active",
    createdAt: "2026-04-07",
  },
  {
    id: "2",
    tokenName: "Ethereum",
    tokenSymbol: "ETH",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chain: "Ethereum",
    chainId: 1,
    sellPercentage: 30,
    takeProfitPrice: 4200,
    stopLossPrice: 2800,
    triggerEnabled: false,
    slippage: 1,
    notes: "Paused until the automation rollout supports this network.",
    status: "paused",
    createdAt: "2026-04-06",
  },
]

export const initialExecutions: Execution[] = [
  {
    id: "1",
    tokenSymbol: "BNB",
    triggerType: "take_profit",
    amountSold: "0.5 BNB",
    status: "success",
    executedAt: "2026-04-07 10:15 AM",
  },
  {
    id: "2",
    tokenSymbol: "ETH",
    triggerType: "stop_loss",
    amountSold: "0.2 ETH",
    status: "pending",
    executedAt: "2026-04-07 09:45 AM",
  },
]

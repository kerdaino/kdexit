import type { Execution, Strategy } from "@/types/strategy"

export const initialStrategies: Strategy[] = [
  {
    id: "1",
    tokenName: "Binance Coin",
    tokenSymbol: "BNB",
    chain: "BNB Chain",
    sellPercentage: 50,
    takeProfitPrice: 850,
    stopLossPrice: 540,
    slippage: 1,
    status: "active",
    createdAt: "2026-04-07",
  },
  {
    id: "2",
    tokenName: "Ethereum",
    tokenSymbol: "ETH",
    chain: "Ethereum",
    sellPercentage: 30,
    takeProfitPrice: 4200,
    stopLossPrice: 2800,
    slippage: 1,
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

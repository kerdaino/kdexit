import StatsCard from "@/components/dashboard/stats-card"
import WalletStatusCard from "@/components/dashboard/wallet-status-card"

type SummaryStatsPanelProps = {
  activeStrategies: number
  executionsCount: number
  pausedStrategies: number
  totalStrategies: number
}

export default function SummaryStatsPanel({
  activeStrategies,
  executionsCount,
  pausedStrategies,
  totalStrategies,
}: SummaryStatsPanelProps) {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-5">
      <WalletStatusCard />
      <StatsCard label="Total Strategies" value={totalStrategies} />
      <StatsCard label="Active Strategies" value={activeStrategies} />
      <StatsCard label="Paused Strategies" value={pausedStrategies} />
      <StatsCard label="Executions" value={executionsCount} />
    </div>
  )
}

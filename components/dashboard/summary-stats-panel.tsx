import StatsCard from "@/components/dashboard/stats-card"

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
      <StatsCard label="Connected Wallet" value="Not connected" />
      <StatsCard label="Total Strategies" value={totalStrategies} />
      <StatsCard label="Active Strategies" value={activeStrategies} />
      <StatsCard label="Paused Strategies" value={pausedStrategies} />
      <StatsCard label="Executions" value={executionsCount} />
    </div>
  )
}

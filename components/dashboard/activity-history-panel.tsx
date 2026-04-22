import ExecutionHistory from "@/components/dashboard/execution-history"
import SimulationAttemptHistory from "@/components/dashboard/simulation-attempt-history"
import type { ExecutionAttempt } from "@/types/automation"
import type { Execution } from "@/types/strategy"

type ActivityHistoryPanelProps = {
  description: string
  executions: Execution[]
  executionAttempts: ExecutionAttempt[]
  title: string
}

export default function ActivityHistoryPanel({
  description,
  executions,
  executionAttempts,
  title,
}: ActivityHistoryPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          Activity
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
          {description}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ExecutionHistory executions={executions} />
        <SimulationAttemptHistory attempts={executionAttempts} />
      </div>
    </div>
  )
}

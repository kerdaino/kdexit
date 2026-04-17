import type { Execution } from "@/types/strategy"
import SectionHeading from "@/components/shared/section-heading"

type ExecutionHistoryProps = {
  executions: Execution[]
}

function getExecutionStatusClass(status: Execution["status"]) {
  switch (status) {
    case "success":
      return "text-emerald-400"
    case "failed":
      return "text-red-400"
    case "pending":
      return "text-yellow-400"
    default:
      return "text-gray-400"
  }
}

function formatTriggerLabel(triggerType: Execution["triggerType"]) {
  switch (triggerType) {
    case "take_profit":
      return "Take Profit"
    case "stop_loss":
      return "Stop Loss"
    case "strategy_created":
      return "Strategy Created"
    case "strategy_updated":
      return "Strategy Updated"
    case "strategy_paused":
      return "Strategy Paused"
    case "strategy_resumed":
      return "Strategy Resumed"
    case "strategy_deleted":
      return "Strategy Deleted"
    default:
      return triggerType
  }
}

export default function ExecutionHistory({
  executions,
}: ExecutionHistoryProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <SectionHeading
        title="Execution History"
        description="Recent activity from your strategies."
      />

      <div className="mt-6 space-y-4">
        {executions.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          executions.map((execution) => (
            <div
              key={execution.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-white">{execution.tokenSymbol}</p>
                <p className="text-sm text-gray-400">
                  {formatTriggerLabel(execution.triggerType)} •{" "}
                  {execution.amountSold}
                </p>
              </div>

              <div className="text-sm">
                <p className={getExecutionStatusClass(execution.status)}>
                  {execution.status}
                </p>
                <p className="text-gray-400">{execution.executedAt}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
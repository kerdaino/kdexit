import type { Execution } from "@/types/strategy"
import SectionHeading from "@/components/shared/section-heading"
import {
  formatTriggerLabel,
  getExecutionStatusClass,
} from "@/lib/dashboard/utils"

type ExecutionHistoryProps = {
  executions: Execution[]
}

export default function ExecutionHistory({
  executions,
}: ExecutionHistoryProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <SectionHeading
        title="Strategy Activity History"
        description="Create, update, pause, resume, and other strategy-level activity."
      />

      <div className="mt-6 space-y-4">
        {executions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-emerald-400">
              H
            </div>
            <p className="mt-4 text-base font-semibold text-white">
              No strategy activity yet
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
              When you create, update, pause, resume, or trigger a strategy,
              the latest activity will show up here so you can track what
              changed at a glance.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gray-500">
              This timeline becomes more useful as you manage more strategies.
            </p>
          </div>
        ) : (
          executions.map((execution) => (
            <div
              key={execution.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-white">{execution.tokenSymbol}</p>
                <p className="text-sm leading-6 text-gray-400">
                  {formatTriggerLabel(execution.triggerType)} •{" "}
                  {execution.amountSold}
                </p>
              </div>

              <div className="text-sm md:text-right">
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

import SectionHeading from "@/components/shared/section-heading"
import {
  formatExecutionAttemptStatus,
  formatTriggerLabel,
  getExecutionAttemptOutcome,
  getExecutionAttemptOutcomeClass,
  getExecutionAttemptStatusBadgeClass,
} from "@/lib/dashboard/utils"
import type { ExecutionAttempt } from "@/types/automation"

type SimulationAttemptHistoryProps = {
  attempts: ExecutionAttempt[]
}

export default function SimulationAttemptHistory({
  attempts,
}: SimulationAttemptHistoryProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <SectionHeading
        title="Watcher And Worker Attempts"
        description="Dry-run watcher evaluations, blocked worker checks, and simulated attempt outcomes. These records never move funds or call onchain contracts."
      />

      <div className="mt-6 space-y-4">
        {attempts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-sky-400">
              S
            </div>
            <p className="mt-4 text-base font-semibold text-white">
              No watcher or worker attempts yet
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
              Once the watcher simulation or internal execution-worker dry run
              runs, take-profit and stop-loss attempts will appear here with clear
              simulated, blocked, pending, or failure states.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gray-500">
              Simulation only. No wallet execution is performed.
            </p>
          </div>
        ) : (
          attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-white">
                    Strategy {attempt.strategyId.slice(0, 8)}
                  </p>
                  <p className="text-sm leading-6 text-gray-400">
                    {formatTriggerLabel(attempt.triggerType)} • Attempt #{attempt.attemptNumber}
                  </p>
                  <p className="text-sm leading-6 text-gray-500">
                    {attempt.executionMode === "dry_run"
                      ? "Internal execution worker dry run"
                      : "Watcher simulation run"}
                  </p>
                </div>

                <div className="text-sm md:text-right">
                  <p className={getExecutionAttemptOutcomeClass(attempt.currentStatus)}>
                    {getExecutionAttemptOutcome(attempt.currentStatus)}
                  </p>
                  <p
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getExecutionAttemptStatusBadgeClass(
                      attempt.currentStatus
                    )}`}
                  >
                    {formatExecutionAttemptStatus(attempt.currentStatus)}
                  </p>
                  <p className="mt-2 text-gray-500">{attempt.updatedAt}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                    Current Status
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {formatExecutionAttemptStatus(attempt.currentStatus)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                    Retry Count
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {attempt.retryCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:col-span-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                    Blocked Or Failure Reason
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white">
                    {attempt.blockedReason ??
                      attempt.lastFailureReason ??
                      "No blocked or failure reason recorded"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                    Execution Mode
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {attempt.executionMode ?? "simulation"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                    Payload Hash
                  </p>
                  <p className="mt-2 break-all text-sm leading-6 text-white">
                    {attempt.preparedPayloadHash ?? "No payload prepared"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                    Reconciliation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white">
                    {attempt.reconciliationStatus ?? "not_started"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

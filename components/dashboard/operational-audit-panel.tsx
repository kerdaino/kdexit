"use client"

import SectionHeading from "@/components/shared/section-heading"
import { useLinkedWallets } from "@/lib/wallet/use-linked-wallets"
import {
  formatExecutionAttemptStatus,
  formatTriggerLabel,
} from "@/lib/dashboard/utils"
import { formatWalletAddress } from "@/lib/web3/use-wallet-connection"
import type { DashboardLoadIssue } from "@/lib/dashboard/use-dashboard-controller"
import type { ExecutionAttempt } from "@/types/automation"
import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"
import type { Execution, Strategy } from "@/types/strategy"

type OperationalAuditPanelProps = {
  currentDataMode: string
  dashboardLoadIssues: DashboardLoadIssue[]
  executionAttempts: ExecutionAttempt[]
  executionReadiness: ExecutionReadinessSnapshot
  executions: Execution[]
  strategies: Strategy[]
}

type AuditEvent = {
  id: string
  category: string
  title: string
  detail: string
  timestamp: string
  status: string
}

const strategyChangeTypes = new Set<Execution["triggerType"]>([
  "strategy_created",
  "strategy_updated",
  "strategy_paused",
  "strategy_resumed",
  "strategy_deleted",
])

export default function OperationalAuditPanel({
  currentDataMode,
  dashboardLoadIssues,
  executionAttempts,
  executionReadiness,
  executions,
  strategies,
}: OperationalAuditPanelProps) {
  const { isLoadingLinkedWallets, linkedWallets, linkedWalletsError } =
    useLinkedWallets()
  const strategyChangeEvents = executions.filter((execution) =>
    strategyChangeTypes.has(execution.triggerType)
  )
  const recentAuditEvents = [
    ...strategyChangeEvents.map((execution): AuditEvent => ({
      id: `strategy-${execution.id}`,
      category: "Strategy",
      title: formatTriggerLabel(execution.triggerType),
      detail: `${execution.tokenSymbol} - ${execution.amountSold}`,
      timestamp: execution.executedAt,
      status: execution.status,
    })),
    ...executionAttempts.map((attempt): AuditEvent => ({
      id: `simulation-${attempt.id}`,
      category: attempt.executionMode === "dry_run" ? "Worker" : "Watcher",
      title:
        attempt.executionMode === "dry_run"
          ? "Execution Worker Dry Run"
          : "Simulation Attempt",
      detail: `${formatTriggerLabel(attempt.triggerType)} - ${formatExecutionAttemptStatus(
        attempt.currentStatus
      )}${attempt.blockedReason ? ` - ${attempt.blockedReason}` : ""}`,
      timestamp: attempt.updatedAt,
      status: attempt.currentStatus,
    })),
  ].slice(0, 12)

  const readinessFlags = [
    {
      label: "Dashboard Beta",
      value: executionReadiness.flags.dashboardBetaMode,
    },
    {
      label: "Wallet-Linked Beta",
      value: executionReadiness.flags.walletLinkedBetaMode,
    },
    {
      label: "Watcher Simulation",
      value: executionReadiness.flags.watcherSimulationMode,
    },
    {
      label: "Contract Readiness",
      value: executionReadiness.flags.contractReadinessMode,
    },
    {
      label: "Live Execution Mode",
      value: executionReadiness.flags.liveExecutionMode,
    },
    {
      label: "Live Execution Enabled",
      value: executionReadiness.flags.liveExecutionEnabled,
    },
  ]

  const blockedStrategyCount = strategies.filter(
    (strategy) => strategy.evaluationState === "blocked"
  ).length

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          Internal Audit
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Operational audit view
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
          Read-only visibility for authenticated users and future admin review.
          This section summarizes existing dashboard records and clearly marks
          operational history that is not tracked yet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AuditMetric
          label="Strategy Changes"
          value={strategyChangeEvents.length.toString()}
          detail="From existing strategy activity records."
        />
        <AuditMetric
          label="Watcher Attempts"
          value={executionAttempts.length.toString()}
          detail="Dry-run simulation and internal worker attempts only."
        />
        <AuditMetric
          label="Linked Wallets"
          value={isLoadingLinkedWallets ? "Loading" : linkedWallets.length.toString()}
          detail="Current saved account links, not a historical log."
        />
        <AuditMetric
          label="Load Issues"
          value={(dashboardLoadIssues.length + (linkedWalletsError ? 1 : 0)).toString()}
          detail={`Data mode: ${currentDataMode}.`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <SectionHeading
            title="Recent Audit Events"
            description="A combined read-only stream from strategy activity and watcher simulation sources."
          />

          <div className="mt-6 space-y-3">
            {recentAuditEvents.length === 0 ? (
              <PlaceholderState
                title="No tracked audit events yet"
                description="Strategy changes and watcher simulation attempts will appear here once those existing dashboard records are created."
              />
            ) : (
              recentAuditEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                        {event.category}
                      </p>
                      <p className="mt-2 font-semibold text-white">{event.title}</p>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        {event.detail}
                      </p>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="capitalize text-gray-300">{event.status}</p>
                      <p className="mt-1 text-gray-500">{event.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <SectionHeading
              title="Execution-Readiness Gates"
              description="Current gate state only. No live execution controls are exposed here."
            />

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-400">Readiness State</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {executionReadiness.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {executionReadiness.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {readinessFlags.map((flag) => (
                  <div
                    key={flag.label}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-sm text-gray-400">{flag.label}</p>
                    <p className="mt-2 font-semibold text-white">
                      {flag.value ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <SectionHeading
              title="Data Load Failures"
              description="Failures surfaced by current dashboard and wallet data loaders."
            />

            <div className="mt-6 space-y-3">
              {dashboardLoadIssues.length === 0 && !linkedWalletsError ? (
                <PlaceholderState
                  title="No load failures reported"
                  description="Current dashboard data requests have not surfaced an API or data load failure in this session."
                />
              ) : (
                <>
                  {dashboardLoadIssues.map((issue) => (
                    <IssueRow
                      key={issue.resource}
                      resource={issue.resource}
                      message={issue.message}
                    />
                  ))}
                  {linkedWalletsError ? (
                    <IssueRow resource="Linked wallets" message={linkedWalletsError} />
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <SectionHeading
            title="Wallet Link Visibility"
            description="Current linked-wallet records are visible. Link and unlink event history is not yet tracked."
          />

          <div className="mt-6 space-y-3">
            {isLoadingLinkedWallets ? (
              <PlaceholderState
                title="Loading linked wallets"
                description="Reading current wallet link records for this account."
              />
            ) : linkedWallets.length === 0 ? (
              <PlaceholderState
                title="No linked wallets"
                description="No current linked-wallet records exist for this account. Historical link and unlink events are not yet tracked."
              />
            ) : (
              linkedWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        {wallet.label?.trim() ||
                          formatWalletAddress(wallet.wallet_address)}
                      </p>
                      <p className="mt-1 break-all text-sm leading-6 text-gray-400">
                        {wallet.wallet_address}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        Chain {wallet.chain_id} -{" "}
                        {wallet.connector_name ?? "Unknown connector"}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-300">
                      {wallet.is_primary ? "Primary" : "Linked"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <p className="text-gray-400">
                      Created:{" "}
                      <span className="text-gray-200">
                        {new Date(wallet.created_at).toLocaleString()}
                      </span>
                    </p>
                    <p className="text-gray-400">
                      Updated:{" "}
                      <span className="text-gray-200">
                        {new Date(wallet.updated_at).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-gray-400">
            Link and unlink audit events are not yet tracked separately. This
            panel shows current records only.
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <SectionHeading
            title="Strategy Gate States"
            description="Current strategy evaluation metadata from the dashboard data source."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <AuditMetric
              label="Total Strategies"
              value={strategies.length.toString()}
              detail="Current strategy records."
            />
            <AuditMetric
              label="Blocked Evaluations"
              value={blockedStrategyCount.toString()}
              detail="Strategies currently marked blocked."
            />
          </div>

          <div className="mt-6 space-y-3">
            {strategies.length === 0 ? (
              <PlaceholderState
                title="No strategy gate records"
                description="Create strategy records first; their current evaluation state will then be visible here."
              />
            ) : (
              strategies.slice(0, 8).map((strategy) => (
                <div
                  key={strategy.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {strategy.tokenSymbol}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        {strategy.evaluationState ?? "idle"} -{" "}
                        {strategy.executionMode ?? "simulation mode"} -{" "}
                        {strategy.authorizationStatus ?? "authorization missing"}
                      </p>
                    </div>
                    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-300">
                      {strategy.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Last evaluated: {strategy.lastEvaluatedAt ?? "not yet tracked"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AuditMetric({
  detail,
  label,
  value,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-gray-400">{detail}</p>
    </div>
  )
}

function PlaceholderState({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
    </div>
  )
}

function IssueRow({
  message,
  resource,
}: {
  message: string
  resource: string
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
      <p className="font-semibold text-red-200">{resource}</p>
      <p className="mt-2 text-sm leading-6 text-red-100/80">{message}</p>
    </div>
  )
}

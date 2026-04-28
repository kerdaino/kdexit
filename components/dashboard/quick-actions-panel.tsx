import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"
import type { Phase5ExecutionUiGates } from "@/types/phase5-gates"

type QuickActionsPanelProps = {
  activeStrategies: number
  currentDataMode: string
  executionReadiness: ExecutionReadinessSnapshot
  phase5Gates: Phase5ExecutionUiGates
  pausedStrategies: number
  recentExecutionsCount: number
  recentExecutionAttemptsCount: number
  showForm: boolean
  onCreateStrategy: () => void
  onManageStrategies: () => void
  onOpenActivity: () => void
  onOpenSettings: () => void
}

export default function QuickActionsPanel({
  activeStrategies,
  currentDataMode,
  executionReadiness,
  phase5Gates,
  pausedStrategies,
  recentExecutionsCount,
  recentExecutionAttemptsCount,
  showForm,
  onCreateStrategy,
  onManageStrategies,
  onOpenActivity,
  onOpenSettings,
}: QuickActionsPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          Quick Actions
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Keep your exit workflow moving
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
          Create and manage strategies, review execution-readiness boundaries, and scan
          wallet-linking and watcher simulation state without leaving the dashboard.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={onCreateStrategy}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black"
          >
            Create Strategy
          </button>
          <button
            onClick={onManageStrategies}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-3 font-semibold text-white hover:bg-white/5"
          >
            Manage Strategies
          </button>
          <button
            onClick={onOpenActivity}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-3 font-semibold text-white hover:bg-white/5"
          >
            Open Activity
          </button>
          <button
            onClick={onOpenSettings}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-3 font-semibold text-white hover:bg-white/5"
          >
            Review Settings
          </button>
        </div>

        {!phase5Gates.strategyActivationEnabled ? (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-200">
            {phase5Gates.disabledReason}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          Workspace Summary
        </p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
          KDEXIT currently surfaces wallet linking, dry-run watcher simulation, and
          execution-readiness status. Live execution stays disabled, and the app does not
          move funds or execute trades today.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Primary Focus</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {showForm ? "Editing Strategy Flow" : "Monitoring Open Rules"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Persistence Mode</p>
            <p className="mt-2 text-lg font-semibold capitalize text-white">
              {currentDataMode}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Latest Status Mix</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {activeStrategies} active / {pausedStrategies} paused
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Execution State</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {executionReadiness.label}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Internal Beta Gates</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {phase5Gates.strategyActivationEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Recent Activity</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {recentExecutionsCount} strategy / {recentExecutionAttemptsCount} watcher
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-300">
            Wallet linking exists for account and session context. It does not by itself enable trading.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-300">
            Watcher simulation exists for dry-run monitoring and attempt history only.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-300">
            Contract readiness is scaffolded as product state. Live execution remains disabled.
          </div>
        </div>
      </div>
    </div>
  )
}

type QuickActionsPanelProps = {
  activeStrategies: number
  currentDataMode: string
  pausedStrategies: number
  recentExecutionsCount: number
  showForm: boolean
  onCreateStrategy: () => void
  onManageStrategies: () => void
  onOpenActivity: () => void
  onOpenSettings: () => void
}

export default function QuickActionsPanel({
  activeStrategies,
  currentDataMode,
  pausedStrategies,
  recentExecutionsCount,
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
          Jump into strategy creation, review current safeguards, or scan the
          latest execution events without leaving the dashboard.
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
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          Workspace Summary
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
            <p className="text-sm text-gray-400">Recent Activity</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {recentExecutionsCount} recent events
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

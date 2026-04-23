import type { ReactNode } from "react"
import AccountStatusCard from "@/components/dashboard/account-status-card"
import ExecutionReadinessCard from "@/components/dashboard/execution-readiness-card"
import ActionFeedback from "@/components/shared/action-feedback"
import type {
  DashboardSection,
  FeedbackState,
} from "@/lib/dashboard/use-dashboard-controller"
import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"

type DashboardSectionItem = {
  id: DashboardSection
  label: string
  description: string
}

type DashboardShellProps = {
  activeSection: DashboardSection
  currentDataMode: string
  executionReadiness: ExecutionReadinessSnapshot
  feedback: FeedbackState | null
  onNewStrategy: () => void
  onSelectSection: (section: DashboardSection) => void
  onViewActivity: () => void
  sections: DashboardSectionItem[]
  children: ReactNode
}

export default function DashboardShell({
  activeSection,
  currentDataMode,
  executionReadiness,
  feedback,
  onNewStrategy,
  onSelectSection,
  onViewActivity,
  sections,
  children,
}: DashboardShellProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_45%)]" />

      <div className="relative border-b border-white/10 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-400/80">
              Control Center
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-400 sm:text-base">
              Manage your strategies, monitor exits, and review executions in a
              cleaner workspace built around the actions you use most.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
            <button
              onClick={onNewStrategy}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black"
            >
              New Strategy
            </button>
            <button
              onClick={onViewActivity}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-3 font-semibold text-white hover:bg-white/5"
            >
              View Activity
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-1 xl:hidden">
          {sections.map((section) => {
            const isActive = activeSection === section.id

            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-500 text-black"
                    : "border border-white/10 bg-black/20 text-white hover:bg-white/5"
                }`}
              >
                {section.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 bg-black/20 xl:block">
          <div className="sticky top-20 p-5">
            <div className="space-y-2">
              {sections.map((section) => {
                const isActive = activeSection === section.id

                return (
                  <button
                    key={section.id}
                    onClick={() => onSelectSection(section.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-emerald-500/30 bg-emerald-500/10 text-white"
                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <p className="text-sm font-semibold">{section.label}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      {section.description}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                Active Mode
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {currentDataMode === "supabase" ? "Supabase" : "Local Storage"}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                The dashboard keeps the current experience intact while routing
                persistence through the configured data mode.
              </p>
            </div>

            <div className="mt-4">
              <ExecutionReadinessCard readiness={executionReadiness} variant="compact" />
            </div>

            <div className="mt-4">
              <AccountStatusCard />
            </div>
          </div>
        </aside>

        <div className="p-4 sm:p-6">
          {feedback ? (
            <div className="mb-6">
              <ActionFeedback message={feedback.message} tone={feedback.tone} />
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  )
}

import ExecutionReadinessCard from "@/components/dashboard/execution-readiness-card"
import WalletStatusSection from "@/components/wallet/wallet-status-section"
import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"

type SettingsPanelProps = {
  currentDataMode: string
  executionReadiness: ExecutionReadinessSnapshot
}

const plannedSettingsSections = [
  {
    title: "Notifications",
    status: "Planned",
    description:
      "Notification delivery is planned for execution alerts, strategy status changes, and operational updates once the backend watcher is introduced.",
    bullets: [
      "Email, push, and in-app notification preferences are not yet implemented.",
      "Delivery rules for successful, failed, or pending executions will be added when alerts become a supported feature.",
    ],
  },
  {
    title: "Execution Preferences",
    status: "Planned",
    description:
      "Execution-level preferences will move here once backend automation and live wallet execution are part of the product.",
    bullets: [
      "Default slippage, confirmation behavior, and retry controls are not yet configurable here.",
      "A lightweight version of these controls currently lives inside the strategy form.",
    ],
  },
  {
    title: "Security",
    status: "Planned",
    description:
      "Security settings will expand as authentication, wallet permissions, and protected actions are introduced across the product.",
    bullets: [
      "Two-factor authentication and session security settings are not yet available.",
      "Approval rules, device management, and sensitive action confirmations will live here in the future.",
    ],
  },
] as const

export default function SettingsPanel({
  currentDataMode,
  executionReadiness,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          Settings
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Workspace and data preferences
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
          This section keeps execution-readiness and configuration readable without
          overstating what the product does today.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <p className="text-sm text-gray-400">Strategy Data Mode</p>
          <p className="mt-3 text-2xl font-semibold capitalize text-white">
            {currentDataMode}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            The repository layer uses this mode to decide whether strategy and
            execution records stay local or route through Supabase.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <p className="text-sm text-gray-400">Current Workspace State</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {executionReadiness.label}
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            {executionReadiness.description}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 sm:p-6">
        <p className="text-sm text-gray-400">Current Product Boundaries</p>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-300">
            Wallet linking exists and is visible below, but it is account and session context only.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-300">
            Watcher simulation exists as a dry-run workflow and history surface, not as live trade execution.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-300">
            Contract readiness is scaffolded as execution-readiness state. It does not mean contracts are actively moving funds.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-300">
            Live execution is disabled, and KDEXIT does not currently move funds or execute trades from this app.
          </div>
        </div>
      </div>

      <ExecutionReadinessCard readiness={executionReadiness} />

      <WalletStatusSection />

      <div className="grid gap-6 lg:grid-cols-2">
        {plannedSettingsSections.map((section) => (
          <div
            key={section.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400">{section.title}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {section.title}
                </h3>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-400">
                {section.status}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-400">
              {section.description}
            </p>

            <div className="mt-5 space-y-3">
              {section.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-gray-300"
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

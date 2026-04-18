import WalletStatusSection from "@/components/wallet/wallet-status-section"

type SettingsPanelProps = {
  currentDataMode: string
}

const placeholderSettingsSections = [
  {
    title: "Notifications",
    status: "Placeholder",
    description:
      "Notification delivery is not wired up yet, but this area is reserved for execution alerts, strategy status changes, and operational updates.",
    bullets: [
      "Email, push, and in-app notification preferences are not yet implemented.",
      "Delivery rules for successful, failed, or pending executions will be configured here later.",
    ],
  },
  {
    title: "Execution Preferences",
    status: "Placeholder",
    description:
      "Execution-level preferences will be added here when backend automation and live wallet execution are available.",
    bullets: [
      "Default slippage, confirmation behavior, and retry controls are not yet configurable here.",
      "These controls are currently represented only inside the strategy form.",
    ],
  },
  {
    title: "Security",
    status: "Placeholder",
    description:
      "Security settings will expand as authentication, wallet permissions, and protected actions are introduced across the product.",
    bullets: [
      "Two-factor authentication and session security settings are not yet available.",
      "Approval rules, device management, and sensitive action confirmations will live here in the future.",
    ],
  },
] as const

export default function SettingsPanel({ currentDataMode }: SettingsPanelProps) {
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
          This section keeps configuration readable without changing the rest of
          the dashboard flow.
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
            Dashboard Ready
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Existing features remain active: strategy form, management actions,
            execution history, and optimistic dashboard updates.
          </p>
        </div>
      </div>

      <WalletStatusSection />

      <div className="grid gap-6 lg:grid-cols-2">
        {placeholderSettingsSections.map((section) => (
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

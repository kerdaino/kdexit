import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"

type ExecutionReadinessCardProps = {
  readiness: ExecutionReadinessSnapshot
  variant?: "compact" | "detailed"
}

function getToneClasses(tone: ExecutionReadinessSnapshot["tone"]) {
  switch (tone) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
    case "warning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200"
    case "info":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200"
    case "neutral":
    default:
      return "border-white/10 bg-black/20 text-gray-300"
  }
}

function renderFlagState(enabled: boolean, enabledLabel: string, disabledLabel: string) {
  return enabled ? enabledLabel : disabledLabel
}

export default function ExecutionReadinessCard({
  readiness,
  variant = "detailed",
}: ExecutionReadinessCardProps) {
  const toneClasses = getToneClasses(readiness.tone)

  if (variant === "compact") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
            Execution Readiness
          </p>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${toneClasses}`}
          >
            {readiness.label}
          </span>
        </div>
        <p className="mt-3 text-lg font-semibold text-white">{readiness.headline}</p>
        <p className="mt-2 text-sm leading-6 text-gray-400">{readiness.description}</p>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Wallet linking and watcher simulation exist today. Contract readiness is
          scaffolded for future phases. KDEXIT does not currently move funds or execute
          trades from this dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-gray-400">Execution Readiness</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{readiness.label}</h3>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${toneClasses}`}
        >
          {readiness.status.replaceAll("_", " ")}
        </span>
      </div>

      <p className="mt-4 text-base font-semibold text-white">{readiness.headline}</p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
        {readiness.description}
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
        This dashboard can show linked wallets, dry-run watcher activity, and
        execution-readiness state. It does not currently send approvals, write contracts,
        move funds, or execute live trades.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Watcher Simulation</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {renderFlagState(
              readiness.flags.watcherSimulationMode,
              "Enabled",
              "Disabled"
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Contract Readiness</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {readiness.contractReadiness.summary.label}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Execution Scope</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {readiness.status === "internal_beta_execution_only"
              ? "Internal Beta Only"
              : "Public Unavailable"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Dashboard Beta</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {renderFlagState(
              readiness.flags.dashboardBetaMode,
              "Enabled",
              "Disabled"
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Wallet-Linked Beta</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {renderFlagState(
              readiness.flags.walletLinkedBetaMode,
              "Enabled",
              "Disabled"
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Live Execution Gate</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {readiness.flags.liveExecutionEnabled
              ? "Enabled"
              : readiness.flags.liveExecutionKillSwitch
                ? "Blocked By Kill Switch"
                : readiness.flags.liveExecutionMode
                  ? "Configured But Inactive"
                  : "Disabled"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">What Exists Today</p>
          <div className="mt-3 space-y-3 text-sm leading-6 text-gray-300">
            <p>Wallet linking exists for account association and session awareness.</p>
            <p>Watcher simulation exists for dry-run automation history and status checks.</p>
            <p>Contract readiness is scaffolded as configuration and UI state, not live execution.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">What Does Not Happen Yet</p>
          <div className="mt-3 space-y-3 text-sm leading-6 text-gray-300">
            <p>Live execution remains disabled unless a future phase changes that deliberately.</p>
            <p>KDEXIT does not currently move funds, approve tokens, submit swaps, or execute trades.</p>
            <p>No wording in this dashboard should be read as a claim of active fund movement.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Contract Infrastructure</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {readiness.contractReadiness.summary.label}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-400">
            {readiness.contractReadiness.supportedChainIds.length} supported chain
            {readiness.contractReadiness.supportedChainIds.length === 1 ? "" : "s"}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          {readiness.contractReadiness.summary.description}
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Live contract execution is{" "}
          {readiness.contractReadiness.liveExecutionEnabled ? "enabled" : "disabled"}.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Supported Chain IDs</p>
            <p className="mt-2 text-sm font-medium text-white">
              {readiness.contractReadiness.supportedChainIds.length > 0
                ? readiness.contractReadiness.supportedChainIds.join(", ")
                : "None configured"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Strategy Registry</p>
            <p className="mt-2 text-sm font-medium text-white">
              {readiness.contractReadiness.strategyRegistryAddress ?? "Not configured"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Execution Controller</p>
            <p className="mt-2 text-sm font-medium text-white">
              {readiness.contractReadiness.executionControllerAddress ?? "Not configured"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">ABI References</p>
            <p className="mt-2 text-sm font-medium text-white">
              {readiness.contractReadiness.strategyRegistryAbiRef ||
              readiness.contractReadiness.executionControllerAbiRef
                ? "Configured"
                : "Not configured"}
            </p>
          </div>
        </div>

        {readiness.contractReadiness.missingReasons.length > 0 ? (
          <div className="mt-4 space-y-3">
            {readiness.contractReadiness.missingReasons.map((reason) => (
              <div
                key={reason}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-300"
              >
                {reason}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

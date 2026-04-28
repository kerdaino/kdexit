"use client"

import { useMemo, useState } from "react"
import type { Strategy } from "@/types/strategy"
import type { Phase5ExecutionUiGates } from "@/types/phase5-gates"
import { getStrategyStatusClass } from "@/lib/dashboard/utils"
import SectionHeading from "@/components/shared/section-heading"

type StrategyListProps = {
  strategies: Strategy[]
  pendingStrategyActionById?: Record<string, "pause" | "resume" | "delete" | undefined>
  phase5Gates: Phase5ExecutionUiGates
  onPauseStrategy: (id: string) => Promise<void>
  onResumeStrategy: (id: string) => Promise<void>
  onDeleteStrategy: (id: string) => Promise<boolean>
  onEditStrategy: (strategy: Strategy) => void
}

type FilterStatus = "all" | "active" | "paused"

function formatTokenAddress(address: string) {
  if (!address) {
    return "Not set"
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function StrategyList({
  strategies,
  pendingStrategyActionById = {},
  onPauseStrategy,
  onResumeStrategy,
  onDeleteStrategy,
  onEditStrategy,
  phase5Gates,
}: StrategyListProps) {
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [strategyToDelete, setStrategyToDelete] = useState<Strategy | null>(null)

  const filteredStrategies = useMemo(() => {
    if (filter === "all") return strategies
    return strategies.filter((strategy) => strategy.status === filter)
  }, [filter, strategies])

  function getFilterButtonClass(value: FilterStatus) {
    return filter === value
      ? "bg-emerald-500 text-black"
      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
  }

  function handleConfirmDelete() {
    if (!strategyToDelete) return
    void onDeleteStrategy(strategyToDelete.id).then((wasSuccessful) => {
      if (wasSuccessful) {
        setStrategyToDelete(null)
      }
    })
  }

  function getActivationDisabledTitle(action: "pause" | "resume") {
    if (phase5Gates.strategyActivationEnabled) {
      return undefined
    }

    return action === "resume"
      ? phase5Gates.disabledReason ?? "Strategy activation is disabled."
      : "Pause remains available only for strategies already created before the Phase 5 gate. Resume is disabled until internal beta gates are enabled."
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeading
          title="Strategies"
          description="View and manage your take-profit and stop-loss rules."
        />

        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${getFilterButtonClass(
              "all"
            )}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${getFilterButtonClass(
              "active"
            )}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("paused")}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${getFilterButtonClass(
              "paused"
            )}`}
          >
            Paused
          </button>
        </div>
      </div>

      {strategyToDelete ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <h3 className="text-base font-semibold text-white">Delete strategy?</h3>
          <p className="mt-2 text-sm text-gray-300">
            You are about to remove{" "}
            <span className="font-semibold text-white">
              {strategyToDelete.tokenName} ({strategyToDelete.tokenSymbol})
            </span>
            . This action cannot be undone.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleConfirmDelete}
              disabled={pendingStrategyActionById[strategyToDelete.id] === "delete"}
              className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingStrategyActionById[strategyToDelete.id] === "delete"
                ? "Deleting..."
                : "Yes, Delete"}
            </button>

            <button
              onClick={() => setStrategyToDelete(null)}
              disabled={pendingStrategyActionById[strategyToDelete.id] === "delete"}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {filteredStrategies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-emerald-400">
              S
            </div>
            <p className="mt-4 text-base font-semibold text-white">
              {filter === "all"
                ? "No strategies yet"
                : `No ${filter} strategies right now`}
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
              {filter === "all"
                ? "Create your first take-profit or stop-loss rule to start building a more disciplined exit workflow."
                : `Nothing in this filter at the moment. Try switching views or create a new strategy to populate your ${filter} list.`}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gray-500">
              Strategies you create will appear here for quick review and management.
            </p>
          </div>
        ) : (
          filteredStrategies.map((strategy) => (
            <div
              key={strategy.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {strategy.tokenName} ({strategy.tokenSymbol})
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-400">
                      Chain: {strategy.chain} (ID {strategy.chainId}) • Sell:{" "}
                      {strategy.sellPercentage}%
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-400">
                      TP: {strategy.takeProfitPrice ?? "-"} • SL:{" "}
                      {strategy.stopLossPrice ?? "-"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-400">
                      Token: {formatTokenAddress(strategy.tokenAddress)} • Trigger:{" "}
                      {strategy.triggerEnabled ? "Enabled" : "Disabled"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Slippage: {strategy.slippage}%{strategy.notes ? ` • ${strategy.notes}` : ""}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getStrategyStatusClass(
                      strategy.status
                    )}`}
                  >
                    {strategy.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
                  <button
                    onClick={() => onEditStrategy(strategy)}
                    disabled={Boolean(pendingStrategyActionById[strategy.id])}
                    className="min-h-11 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Edit
                  </button>

                  {strategy.status === "active" ? (
                    <button
                      onClick={() => void onPauseStrategy(strategy.id)}
                      disabled={pendingStrategyActionById[strategy.id] === "pause"}
                      title={getActivationDisabledTitle("pause")}
                      className="min-h-11 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingStrategyActionById[strategy.id] === "pause"
                        ? "Pausing..."
                        : "Pause"}
                    </button>
                  ) : strategy.status === "paused" ? (
                    <button
                      onClick={() => void onResumeStrategy(strategy.id)}
                      disabled={
                        pendingStrategyActionById[strategy.id] === "resume" ||
                        !phase5Gates.strategyActivationEnabled
                      }
                      title={getActivationDisabledTitle("resume")}
                      className="min-h-11 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingStrategyActionById[strategy.id] === "resume"
                        ? "Resuming..."
                        : phase5Gates.strategyActivationEnabled
                          ? "Resume"
                          : "Resume Disabled"}
                    </button>
                  ) : null}

                  <button
                    disabled={Boolean(pendingStrategyActionById[strategy.id])}
                    onClick={() => setStrategyToDelete(strategy)}
                    className="min-h-11 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {!phase5Gates.strategyActivationEnabled &&
              strategy.status === "paused" ? (
                <p className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-200">
                  {phase5Gates.disabledReason}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

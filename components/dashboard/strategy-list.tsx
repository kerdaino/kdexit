"use client"

import { useMemo, useState } from "react"
import type { Strategy } from "@/types/strategy"
import SectionHeading from "@/components/shared/section-heading"

type StrategyListProps = {
  strategies: Strategy[]
  onPauseStrategy: (id: string) => void
  onResumeStrategy: (id: string) => void
  onDeleteStrategy: (id: string) => void
  onEditStrategy: (strategy: Strategy) => void
}

type FilterStatus = "all" | "active" | "paused"

function getStatusClass(status: Strategy["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-400"
    case "paused":
      return "bg-yellow-500/15 text-yellow-400"
    case "triggered":
      return "bg-blue-500/15 text-blue-400"
    case "completed":
      return "bg-purple-500/15 text-purple-400"
    default:
      return "bg-gray-500/15 text-gray-400"
  }
}

export default function StrategyList({
  strategies,
  onPauseStrategy,
  onResumeStrategy,
  onDeleteStrategy,
  onEditStrategy,
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
    onDeleteStrategy(strategyToDelete.id)
    setStrategyToDelete(null)
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeading
          title="Strategies"
          description="View and manage your take-profit and stop-loss rules."
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${getFilterButtonClass(
              "all"
            )}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${getFilterButtonClass(
              "active"
            )}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("paused")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${getFilterButtonClass(
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
              className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
            >
              Yes, Delete
            </button>

            <button
              onClick={() => setStrategyToDelete(null)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {filteredStrategies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5">
            <p className="text-sm text-gray-300">
              No {filter === "all" ? "" : filter} strategies found.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "all"
                ? "Create your first strategy to get started."
                : `Try switching filters or create a new ${filter} strategy.`}
            </p>
          </div>
        ) : (
          filteredStrategies.map((strategy) => (
            <div
              key={strategy.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {strategy.tokenName} ({strategy.tokenSymbol})
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Chain: {strategy.chain} • Sell: {strategy.sellPercentage}%
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      TP: {strategy.takeProfitPrice ?? "-"} • SL:{" "}
                      {strategy.stopLossPrice ?? "-"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Slippage: {strategy.slippage}%
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                      strategy.status
                    )}`}
                  >
                    {strategy.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onEditStrategy(strategy)}
                    className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/15"
                  >
                    Edit
                  </button>

                  {strategy.status === "active" ? (
                    <button
                      onClick={() => onPauseStrategy(strategy.id)}
                      className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/15"
                    >
                      Pause
                    </button>
                  ) : strategy.status === "paused" ? (
                    <button
                      onClick={() => onResumeStrategy(strategy.id)}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/15"
                    >
                      Resume
                    </button>
                  ) : null}

                  <button
                    onClick={() => setStrategyToDelete(strategy)}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/15"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
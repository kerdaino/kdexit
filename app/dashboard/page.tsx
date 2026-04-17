"use client"

import { useEffect, useMemo, useState } from "react"
import StatsCard from "@/components/dashboard/stats-card"
import StrategyList from "@/components/dashboard/strategy-list"
import ExecutionHistory from "@/components/dashboard/execution-history"
import CreateStrategyForm from "@/components/strategy/create-strategy-form"
import ActionFeedback from "@/components/shared/action-feedback"
import type { Execution, Strategy } from "@/types/strategy"

const STRATEGIES_STORAGE_KEY = "kdexit_strategies"
const EXECUTIONS_STORAGE_KEY = "kdexit_executions"

const initialStrategies: Strategy[] = [
  {
    id: "1",
    tokenName: "Binance Coin",
    tokenSymbol: "BNB",
    chain: "BNB Chain",
    sellPercentage: 50,
    takeProfitPrice: 850,
    stopLossPrice: 540,
    slippage: 1,
    status: "active",
    createdAt: "2026-04-07",
  },
  {
    id: "2",
    tokenName: "Ethereum",
    tokenSymbol: "ETH",
    chain: "Ethereum",
    sellPercentage: 30,
    takeProfitPrice: 4200,
    stopLossPrice: 2800,
    slippage: 1,
    status: "paused",
    createdAt: "2026-04-06",
  },
]

const initialExecutions: Execution[] = [
  {
    id: "1",
    tokenSymbol: "BNB",
    triggerType: "take_profit",
    amountSold: "0.5 BNB",
    status: "success",
    executedAt: "2026-04-07 10:15 AM",
  },
  {
    id: "2",
    tokenSymbol: "ETH",
    triggerType: "stop_loss",
    amountSold: "0.2 ETH",
    status: "pending",
    executedAt: "2026-04-07 09:45 AM",
  },
]

function formatNow() {
  return new Date().toLocaleString()
}

export default function DashboardPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")

  useEffect(() => {
    try {
      const storedStrategies = localStorage.getItem(STRATEGIES_STORAGE_KEY)
      const storedExecutions = localStorage.getItem(EXECUTIONS_STORAGE_KEY)

      if (storedStrategies) {
        const parsedStrategies = JSON.parse(storedStrategies) as Strategy[]
        setStrategies(parsedStrategies)
      } else {
        setStrategies(initialStrategies)
      }

      if (storedExecutions) {
        const parsedExecutions = JSON.parse(storedExecutions) as Execution[]
        setExecutions(parsedExecutions)
      } else {
        setExecutions(initialExecutions)
      }
    } catch (error) {
      console.error("Failed to load dashboard data from localStorage:", error)
      setStrategies(initialStrategies)
      setExecutions(initialExecutions)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    try {
      localStorage.setItem(
        STRATEGIES_STORAGE_KEY,
        JSON.stringify(strategies)
      )
    } catch (error) {
      console.error("Failed to save strategies to localStorage:", error)
    }
  }, [strategies, isHydrated])

  useEffect(() => {
    if (!isHydrated) return

    try {
      localStorage.setItem(
        EXECUTIONS_STORAGE_KEY,
        JSON.stringify(executions)
      )
    } catch (error) {
      console.error("Failed to save executions to localStorage:", error)
    }
  }, [executions, isHydrated])

  useEffect(() => {
    if (!feedbackMessage) return

    const timer = window.setTimeout(() => {
      setFeedbackMessage("")
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [feedbackMessage])

  const totalStrategies = strategies.length

  const activeStrategies = useMemo(
    () => strategies.filter((strategy) => strategy.status === "active").length,
    [strategies]
  )

  const pausedStrategies = useMemo(
    () => strategies.filter((strategy) => strategy.status === "paused").length,
    [strategies]
  )

  function addExecution(entry: Omit<Execution, "id" | "executedAt">) {
    const newExecution: Execution = {
      id: crypto.randomUUID(),
      executedAt: formatNow(),
      ...entry,
    }

    setExecutions((prev) => [newExecution, ...prev])
  }

  function handleAddStrategy(strategy: Strategy) {
    setStrategies((prev) => [strategy, ...prev])
    addExecution({
      tokenSymbol: strategy.tokenSymbol,
      triggerType: "strategy_created",
      amountSold: `${strategy.sellPercentage}% configured`,
      status: "success",
    })
    setFeedbackMessage("Strategy created successfully.")
  }

  function handleUpdateStrategy(updatedStrategy: Strategy) {
    setStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === updatedStrategy.id ? updatedStrategy : strategy
      )
    )
    addExecution({
      tokenSymbol: updatedStrategy.tokenSymbol,
      triggerType: "strategy_updated",
      amountSold: `${updatedStrategy.sellPercentage}% updated`,
      status: "success",
    })
    setEditingStrategy(null)
    setFeedbackMessage("Strategy updated successfully.")
  }

  function handlePauseStrategy(id: string) {
    const target = strategies.find((strategy) => strategy.id === id)

    setStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === id ? { ...strategy, status: "paused" } : strategy
      )
    )

    if (target) {
      addExecution({
        tokenSymbol: target.tokenSymbol,
        triggerType: "strategy_paused",
        amountSold: `${target.sellPercentage}% paused`,
        status: "success",
      })
    }

    setFeedbackMessage("Strategy paused successfully.")
  }

  function handleResumeStrategy(id: string) {
    const target = strategies.find((strategy) => strategy.id === id)

    setStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === id ? { ...strategy, status: "active" } : strategy
      )
    )

    if (target) {
      addExecution({
        tokenSymbol: target.tokenSymbol,
        triggerType: "strategy_resumed",
        amountSold: `${target.sellPercentage}% resumed`,
        status: "success",
      })
    }

    setFeedbackMessage("Strategy resumed successfully.")
  }

  function handleDeleteStrategy(id: string) {
    const target = strategies.find((strategy) => strategy.id === id)

    setStrategies((prev) => prev.filter((strategy) => strategy.id !== id))

    if (target) {
      addExecution({
        tokenSymbol: target.tokenSymbol,
        triggerType: "strategy_deleted",
        amountSold: `${target.sellPercentage}% removed`,
        status: "success",
      })
    }

    setFeedbackMessage("Strategy deleted successfully.")
  }

  function handleOpenNewStrategy() {
    setEditingStrategy(null)
    setShowForm(true)
  }

  function handleEditStrategy(strategy: Strategy) {
    setEditingStrategy(strategy)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingStrategy(null)
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#0B0F14] px-6 py-10 text-[#E5E7EB]">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] px-6 py-10 text-[#E5E7EB]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage your strategies, monitor exits, and review executions.
            </p>
          </div>

          <button
            onClick={handleOpenNewStrategy}
            className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black"
          >
            New Strategy
          </button>
        </div>

        {feedbackMessage ? (
          <div className="mb-6">
            <ActionFeedback message={feedbackMessage} />
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <StatsCard label="Connected Wallet" value="Not connected" />
          <StatsCard label="Total Strategies" value={totalStrategies} />
          <StatsCard label="Active Strategies" value={activeStrategies} />
          <StatsCard label="Paused Strategies" value={pausedStrategies} />
          <StatsCard label="Executions" value={executions.length} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {showForm ? (
            <CreateStrategyForm
              key={editingStrategy?.id ?? "new"}
              onAddStrategy={handleAddStrategy}
              onUpdateStrategy={handleUpdateStrategy}
              onCancel={handleCloseForm}
              editingStrategy={editingStrategy}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">
                Ready to create a strategy?
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Click the New Strategy button to add a take-profit or stop-loss
                rule.
              </p>
              <button
                onClick={handleOpenNewStrategy}
                className="mt-6 rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black"
              >
                Open Form
              </button>
            </div>
          )}

          <StrategyList
            strategies={strategies}
            onPauseStrategy={handlePauseStrategy}
            onResumeStrategy={handleResumeStrategy}
            onDeleteStrategy={handleDeleteStrategy}
            onEditStrategy={handleEditStrategy}
          />
        </div>

        <div className="mt-8">
          <ExecutionHistory executions={executions} />
        </div>
      </div>
    </main>
  )
}

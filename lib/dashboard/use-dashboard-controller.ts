"use client"

import { useEffect, useMemo, useState } from "react"
import { getStrategyExecutionDataMode } from "@/lib/data"
import {
  createDashboardExecution,
  listDashboardExecutionAttempts,
  createDashboardStrategy,
  deleteDashboardStrategy,
  listDashboardExecutions,
  listDashboardStrategies,
  pauseDashboardStrategy,
  resumeDashboardStrategy,
  updateDashboardStrategy,
} from "@/lib/dashboard/mutation-gateway"
import {
  countStrategiesByStatus,
  formatTimestamp,
  generateClientId,
} from "@/lib/dashboard/utils"
import type { Execution, Strategy } from "@/types/strategy"
import type { ExecutionAttempt } from "@/types/automation"

export type FeedbackState = {
  message: string
  tone: "success" | "error"
}

export type DashboardSection = "overview" | "strategies" | "activity" | "settings"

export const dashboardSections: Array<{
  id: DashboardSection
  label: string
  description: string
}> = [
  {
    id: "overview",
    label: "Overview",
    description: "Summary, quick actions, and the latest activity.",
  },
  {
    id: "strategies",
    label: "Strategies",
    description: "Create, edit, pause, resume, and delete rules.",
  },
  {
    id: "activity",
    label: "Activity",
    description: "Track execution and strategy history in one timeline.",
  },
  {
    id: "settings",
    label: "Settings",
    description: "View dashboard data mode and persistence details.",
  },
]

export function useDashboardController() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [executionAttempts, setExecutionAttempts] = useState<ExecutionAttempt[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview")
  const [pendingStrategyActionById, setPendingStrategyActionById] = useState<
    Record<string, "pause" | "resume" | "delete" | undefined>
  >({})

  useEffect(() => {
    let isMounted = true

    async function hydrateDashboard() {
      try {
        const [loadedStrategies, loadedExecutions, loadedExecutionAttempts] = await Promise.all([
          listDashboardStrategies(),
          listDashboardExecutions(),
          listDashboardExecutionAttempts(),
        ])

        if (!isMounted) {
          return
        }

        setStrategies(loadedStrategies)
        setExecutions(loadedExecutions)
        setExecutionAttempts(loadedExecutionAttempts)
      } finally {
        if (isMounted) {
          setIsHydrated(true)
        }
      }
    }

    void hydrateDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!feedback) return

    const timer = window.setTimeout(() => {
      setFeedback(null)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [feedback])

  const totalStrategies = strategies.length
  const activeStrategies = useMemo(
    () => countStrategiesByStatus(strategies, "active"),
    [strategies]
  )
  const pausedStrategies = useMemo(
    () => countStrategiesByStatus(strategies, "paused"),
    [strategies]
  )
  const recentExecutions = executions.slice(0, 4)
  const recentExecutionAttempts = executionAttempts.slice(0, 4)
  const currentDataMode = getStrategyExecutionDataMode()

  async function addExecution(
    entry: Omit<Execution, "id" | "executedAt"> & { strategyId?: string }
  ) {
    const newExecution: Execution = {
      id: generateClientId(),
      executedAt: formatTimestamp(),
      ...entry,
    }

    try {
      const savedExecution = await createDashboardExecution({
        ...newExecution,
        strategyId: entry.strategyId,
      })

      setExecutions((prev) => [savedExecution, ...prev])
      return savedExecution
    } catch (error) {
      console.error("Failed to create execution:", error)
    }

    return null
  }

  function setPendingStrategyAction(
    id: string,
    action?: "pause" | "resume" | "delete"
  ) {
    setPendingStrategyActionById((prev) => {
      if (!action) {
        const next = { ...prev }
        delete next[id]
        return next
      }

      return { ...prev, [id]: action }
    })
  }

  async function handleAddStrategy(strategy: Strategy) {
    try {
      const savedStrategy = await createDashboardStrategy(strategy)

      setStrategies((prev) => [savedStrategy, ...prev])
      await addExecution({
        strategyId: savedStrategy.id,
        tokenSymbol: savedStrategy.tokenSymbol,
        triggerType: "strategy_created",
        amountSold: `${savedStrategy.sellPercentage}% configured`,
        status: "success",
      })
      setFeedback({ message: "Strategy created successfully.", tone: "success" })
      return true
    } catch (error) {
      console.error("Failed to create strategy:", error)
      setFeedback({ message: "Failed to create strategy.", tone: "error" })
      return false
    }
  }

  async function handleUpdateStrategy(updatedStrategy: Strategy) {
    const previousStrategies = strategies

    try {
      setStrategies((prev) =>
        prev.map((strategy) =>
          strategy.id === updatedStrategy.id ? updatedStrategy : strategy
        )
      )

      const savedStrategy = await updateDashboardStrategy(updatedStrategy)

      setStrategies((prev) =>
        prev.map((strategy) => (strategy.id === savedStrategy.id ? savedStrategy : strategy))
      )
      await addExecution({
        strategyId: savedStrategy.id,
        tokenSymbol: savedStrategy.tokenSymbol,
        triggerType: "strategy_updated",
        amountSold: `${savedStrategy.sellPercentage}% updated`,
        status: "success",
      })
      setEditingStrategy(null)
      setFeedback({ message: "Strategy updated successfully.", tone: "success" })
      return true
    } catch (error) {
      setStrategies(previousStrategies)
      console.error("Failed to update strategy:", error)
      setFeedback({ message: "Failed to update strategy.", tone: "error" })
      return false
    }
  }

  async function handlePauseStrategy(id: string) {
    const target = strategies.find((strategy) => strategy.id === id)

    if (target) {
      const previousStrategies = strategies

      try {
        setPendingStrategyAction(id, "pause")
        setStrategies((prev) =>
          prev.map((strategy) =>
            strategy.id === id ? { ...strategy, status: "paused" } : strategy
          )
        )

        const pausedStrategy = await pauseDashboardStrategy(id)

        if (pausedStrategy) {
          setStrategies((prev) =>
            prev.map((strategy) => (strategy.id === id ? pausedStrategy : strategy))
          )
        }

        await addExecution({
          strategyId: id,
          tokenSymbol: target.tokenSymbol,
          triggerType: "strategy_paused",
          amountSold: `${target.sellPercentage}% paused`,
          status: "success",
        })
        setFeedback({ message: "Strategy paused successfully.", tone: "success" })
      } catch (error) {
        setStrategies(previousStrategies)
        console.error("Failed to pause strategy:", error)
        setFeedback({ message: "Failed to pause strategy.", tone: "error" })
      } finally {
        setPendingStrategyAction(id)
      }
    }
  }

  async function handleResumeStrategy(id: string) {
    const target = strategies.find((strategy) => strategy.id === id)

    if (target) {
      const previousStrategies = strategies

      try {
        setPendingStrategyAction(id, "resume")
        setStrategies((prev) =>
          prev.map((strategy) =>
            strategy.id === id ? { ...strategy, status: "active" } : strategy
          )
        )

        const resumedStrategy = await resumeDashboardStrategy(id)

        if (resumedStrategy) {
          setStrategies((prev) =>
            prev.map((strategy) => (strategy.id === id ? resumedStrategy : strategy))
          )
        }

        await addExecution({
          strategyId: id,
          tokenSymbol: target.tokenSymbol,
          triggerType: "strategy_resumed",
          amountSold: `${target.sellPercentage}% resumed`,
          status: "success",
        })
        setFeedback({ message: "Strategy resumed successfully.", tone: "success" })
      } catch (error) {
        setStrategies(previousStrategies)
        console.error("Failed to resume strategy:", error)
        setFeedback({ message: "Failed to resume strategy.", tone: "error" })
      } finally {
        setPendingStrategyAction(id)
      }
    }
  }

  async function handleDeleteStrategy(id: string) {
    const target = strategies.find((strategy) => strategy.id === id)

    if (target) {
      const previousStrategies = strategies

      try {
        setPendingStrategyAction(id, "delete")
        setStrategies((prev) => prev.filter((strategy) => strategy.id !== id))
        await deleteDashboardStrategy(id)
        await addExecution({
          strategyId: id,
          tokenSymbol: target.tokenSymbol,
          triggerType: "strategy_deleted",
          amountSold: `${target.sellPercentage}% removed`,
          status: "success",
        })
        setFeedback({ message: "Strategy deleted successfully.", tone: "success" })
        return true
      } catch (error) {
        setStrategies(previousStrategies)
        console.error("Failed to delete strategy:", error)
        setFeedback({ message: "Failed to delete strategy.", tone: "error" })
        return false
      } finally {
        setPendingStrategyAction(id)
      }
    }

    return false
  }

  function handleOpenNewStrategy() {
    setActiveSection("strategies")
    setEditingStrategy(null)
    setShowForm(true)
  }

  function handleEditStrategy(strategy: Strategy) {
    setActiveSection("strategies")
    setEditingStrategy(strategy)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingStrategy(null)
  }

  return {
    activeSection,
    activeStrategies,
    currentDataMode,
    editingStrategy,
    executions,
    executionAttempts,
    feedback,
    handleAddStrategy,
    handleCloseForm,
    handleDeleteStrategy,
    handleEditStrategy,
    handleOpenNewStrategy,
    handlePauseStrategy,
    handleResumeStrategy,
    handleUpdateStrategy,
    isHydrated,
    pausedStrategies,
    pendingStrategyActionById,
    recentExecutions,
    recentExecutionAttempts,
    setActiveSection,
    showForm,
    strategies,
    totalStrategies,
  }
}

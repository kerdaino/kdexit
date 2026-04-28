"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
import type { Phase5ExecutionUiGates } from "@/types/phase5-gates"

export type FeedbackState = {
  message: string
  tone: "success" | "error"
}

export type DashboardLoadIssue = {
  resource: string
  message: string
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

export function useDashboardController(phase5Gates: Phase5ExecutionUiGates) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [executionAttempts, setExecutionAttempts] = useState<ExecutionAttempt[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false)
  const [dashboardLoadIssues, setDashboardLoadIssues] = useState<DashboardLoadIssue[]>([])
  const isDashboardMountedRef = useRef(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview")
  const [pendingStrategyActionById, setPendingStrategyActionById] = useState<
    Record<string, "pause" | "resume" | "delete" | undefined>
  >({})

  const hydrateDashboard = useCallback(async () => {
    const results = await Promise.allSettled([
      listDashboardStrategies(),
      listDashboardExecutions(),
      listDashboardExecutionAttempts(),
    ])

    const nextIssues: DashboardLoadIssue[] = []
    const [strategiesResult, executionsResult, attemptsResult] = results

    if (!isDashboardMountedRef.current) {
      return
    }

    if (strategiesResult.status === "fulfilled") {
      setStrategies(strategiesResult.value)
    } else {
      nextIssues.push({
        resource: "Strategies",
        message: getLoadIssueMessage(strategiesResult.reason),
      })
    }

    if (executionsResult.status === "fulfilled") {
      setExecutions(executionsResult.value)
    } else {
      nextIssues.push({
        resource: "Strategy activity",
        message: getLoadIssueMessage(executionsResult.reason),
      })
    }

    if (attemptsResult.status === "fulfilled") {
      setExecutionAttempts(attemptsResult.value)
    } else {
      nextIssues.push({
        resource: "Watcher simulations",
        message: getLoadIssueMessage(attemptsResult.reason),
      })
    }

    setDashboardLoadIssues(nextIssues)
    setIsHydrated(true)
  }, [])

  const reloadDashboard = useCallback(async () => {
    setIsRefreshingDashboard(true)
    await hydrateDashboard()

    if (isDashboardMountedRef.current) {
      setIsRefreshingDashboard(false)
    }
  }, [hydrateDashboard])

  useEffect(() => {
    isDashboardMountedRef.current = true
    const hydrationTimer = window.setTimeout(() => {
      void hydrateDashboard()
    }, 0)

    return () => {
      window.clearTimeout(hydrationTimer)
      isDashboardMountedRef.current = false
    }
  }, [hydrateDashboard])

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
    const strategyForCurrentGate = normalizeStrategyForPhase5Gate(strategy, phase5Gates)

    try {
      const savedStrategy = await createDashboardStrategy(strategyForCurrentGate)

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
    const strategyForCurrentGate = normalizeStrategyForPhase5Gate(
      updatedStrategy,
      phase5Gates
    )

    try {
      setStrategies((prev) =>
        prev.map((strategy) =>
          strategy.id === strategyForCurrentGate.id ? strategyForCurrentGate : strategy
        )
      )

      const savedStrategy = await updateDashboardStrategy(strategyForCurrentGate)

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
    if (!phase5Gates.strategyActivationEnabled) {
      setFeedback({
        message:
          phase5Gates.disabledReason ??
          "Strategy activation is disabled until internal beta gates are enabled.",
        tone: "error",
      })
      return
    }

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
    dashboardLoadIssues,
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
    isRefreshingDashboard,
    pausedStrategies,
    pendingStrategyActionById,
    recentExecutions,
    recentExecutionAttempts,
    setActiveSection,
    reloadDashboard,
    showForm,
    strategies,
    totalStrategies,
  }
}

function getLoadIssueMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The request failed before this section could load."
}

function normalizeStrategyForPhase5Gate(
  strategy: Strategy,
  phase5Gates: Phase5ExecutionUiGates
): Strategy {
  if (phase5Gates.strategyActivationEnabled) {
    return strategy
  }

  return {
    ...strategy,
    status: "paused",
    triggerEnabled: false,
  }
}

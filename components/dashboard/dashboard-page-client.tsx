"use client"

import ActivityHistoryPanel from "@/components/dashboard/activity-history-panel"
import DashboardShell from "@/components/dashboard/dashboard-shell"
import {
  DashboardFailedRequestPanel,
  DashboardLoadingState,
} from "@/components/dashboard/dashboard-state-panels"
import QuickActionsPanel from "@/components/dashboard/quick-actions-panel"
import SettingsPanel from "@/components/dashboard/settings-panel"
import StrategyManagementPanel from "@/components/dashboard/strategy-management-panel"
import SummaryStatsPanel from "@/components/dashboard/summary-stats-panel"
import Footer from "@/components/shared/footer"
import TopNavigation from "@/components/shared/top-navigation"
import {
  dashboardSections,
  useDashboardController,
} from "@/lib/dashboard/use-dashboard-controller"
import { getPhase5ExecutionUiGates } from "@/lib/dashboard/phase5-gates"
import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"

type DashboardPageClientProps = {
  executionReadiness: ExecutionReadinessSnapshot
}

export default function DashboardPageClient({
  executionReadiness,
}: DashboardPageClientProps) {
  const phase5Gates = getPhase5ExecutionUiGates(executionReadiness)
  const {
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
    reloadDashboard,
    setActiveSection,
    showForm,
    strategies,
    totalStrategies,
  } = useDashboardController(phase5Gates)

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
        <TopNavigation variant="dashboard" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <DashboardLoadingState />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
      <TopNavigation variant="dashboard" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <DashboardShell
          activeSection={activeSection}
          currentDataMode={currentDataMode}
          executionReadiness={executionReadiness}
          feedback={feedback}
          onNewStrategy={handleOpenNewStrategy}
          onSelectSection={setActiveSection}
          onViewActivity={() => setActiveSection("activity")}
          sections={dashboardSections}
        >
          {dashboardLoadIssues.length > 0 ? (
            <div className="mb-6">
              <DashboardFailedRequestPanel
                issues={dashboardLoadIssues}
                onRetry={() => void reloadDashboard()}
              />
            </div>
          ) : null}

          {isRefreshingDashboard && dashboardLoadIssues.length > 0 ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
              Retrying dashboard data requests...
            </div>
          ) : null}

          {activeSection === "overview" ? (
            <div className="space-y-6">
              <SummaryStatsPanel
                activeStrategies={activeStrategies}
                executionsCount={executions.length}
                executionAttemptsCount={executionAttempts.length}
                pausedStrategies={pausedStrategies}
                totalStrategies={totalStrategies}
              />
              <QuickActionsPanel
                activeStrategies={activeStrategies}
                currentDataMode={currentDataMode}
                executionReadiness={executionReadiness}
                phase5Gates={phase5Gates}
                pausedStrategies={pausedStrategies}
                recentExecutionsCount={recentExecutions.length}
                recentExecutionAttemptsCount={recentExecutionAttempts.length}
                showForm={showForm}
                onCreateStrategy={handleOpenNewStrategy}
                onManageStrategies={() => setActiveSection("strategies")}
                onOpenActivity={() => setActiveSection("activity")}
                onOpenSettings={() => setActiveSection("settings")}
              />
              <ActivityHistoryPanel
                description="Track offchain strategy activity and dry-run watcher simulation attempts at a glance. These records do not indicate live trade execution or fund movement."
                executions={recentExecutions}
                executionAttempts={recentExecutionAttempts}
                title="Latest dashboard activity"
              />
            </div>
          ) : null}

          {activeSection === "strategies" ? (
            <StrategyManagementPanel
              editingStrategy={editingStrategy}
              phase5Gates={phase5Gates}
              pendingStrategyActionById={pendingStrategyActionById}
              showForm={showForm}
              strategies={strategies}
              onAddStrategy={handleAddStrategy}
              onCloseForm={handleCloseForm}
              onDeleteStrategy={handleDeleteStrategy}
              onEditStrategy={handleEditStrategy}
              onOpenNewStrategy={handleOpenNewStrategy}
              onPauseStrategy={handlePauseStrategy}
              onResumeStrategy={handleResumeStrategy}
              onUpdateStrategy={handleUpdateStrategy}
            />
          ) : null}

          {activeSection === "activity" ? (
            <ActivityHistoryPanel
              description="Track offchain strategy activity history and watcher simulation attempts in one place with clear success, pending, and failed states. KDEXIT does not currently execute live trades or move funds from this dashboard."
              executions={executions}
              executionAttempts={executionAttempts}
              title="Review activity and watcher simulations"
            />
          ) : null}

          {activeSection === "settings" ? (
            <SettingsPanel
              currentDataMode={currentDataMode}
              executionReadiness={executionReadiness}
              phase5Gates={phase5Gates}
            />
          ) : null}
        </DashboardShell>
      </div>
      <Footer />
    </main>
  )
}

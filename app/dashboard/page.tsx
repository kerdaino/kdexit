"use client"

import ActivityHistoryPanel from "@/components/dashboard/activity-history-panel"
import DashboardShell from "@/components/dashboard/dashboard-shell"
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

export default function DashboardPage() {
  const {
    activeSection,
    activeStrategies,
    currentDataMode,
    editingStrategy,
    executions,
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
    setActiveSection,
    showForm,
    strategies,
    totalStrategies,
  } = useDashboardController()

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
        <TopNavigation variant="dashboard" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-sm text-gray-400">Loading dashboard...</p>
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
          feedback={feedback}
          onNewStrategy={handleOpenNewStrategy}
          onSelectSection={setActiveSection}
          onViewActivity={() => setActiveSection("activity")}
          sections={dashboardSections}
        >
          {activeSection === "overview" ? (
            <div className="space-y-6">
              <SummaryStatsPanel
                activeStrategies={activeStrategies}
                executionsCount={executions.length}
                pausedStrategies={pausedStrategies}
                totalStrategies={totalStrategies}
              />
              <QuickActionsPanel
                activeStrategies={activeStrategies}
                currentDataMode={currentDataMode}
                pausedStrategies={pausedStrategies}
                recentExecutionsCount={recentExecutions.length}
                showForm={showForm}
                onCreateStrategy={handleOpenNewStrategy}
                onManageStrategies={() => setActiveSection("strategies")}
                onOpenActivity={() => setActiveSection("activity")}
                onOpenSettings={() => setActiveSection("settings")}
              />
              <ActivityHistoryPanel
                description="Track the latest create, update, pause, resume, and delete events at a glance."
                executions={recentExecutions}
                title="Latest execution activity"
              />
            </div>
          ) : null}

          {activeSection === "strategies" ? (
            <StrategyManagementPanel
              editingStrategy={editingStrategy}
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
              description="Track every create, update, pause, resume, and delete event in one place to keep the workflow easy to audit."
              executions={executions}
              title="Review the execution timeline"
            />
          ) : null}

          {activeSection === "settings" ? (
            <SettingsPanel currentDataMode={currentDataMode} />
          ) : null}
        </DashboardShell>
      </div>
      <Footer />
    </main>
  )
}

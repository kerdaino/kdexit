import StrategyList from "@/components/dashboard/strategy-list"
import CreateStrategyForm from "@/components/strategy/create-strategy-form"
import type { Phase5ExecutionUiGates } from "@/types/phase5-gates"
import type { Strategy } from "@/types/strategy"

type StrategyManagementPanelProps = {
  editingStrategy: Strategy | null
  phase5Gates: Phase5ExecutionUiGates
  pendingStrategyActionById: Record<string, "pause" | "resume" | "delete" | undefined>
  showForm: boolean
  strategies: Strategy[]
  onAddStrategy: (strategy: Strategy) => Promise<boolean>
  onCloseForm: () => void
  onDeleteStrategy: (id: string) => Promise<boolean>
  onEditStrategy: (strategy: Strategy) => void
  onOpenNewStrategy: () => void
  onPauseStrategy: (id: string) => Promise<void>
  onResumeStrategy: (id: string) => Promise<void>
  onUpdateStrategy: (strategy: Strategy) => Promise<boolean>
}

export default function StrategyManagementPanel({
  editingStrategy,
  phase5Gates,
  pendingStrategyActionById,
  showForm,
  strategies,
  onAddStrategy,
  onCloseForm,
  onDeleteStrategy,
  onEditStrategy,
  onOpenNewStrategy,
  onPauseStrategy,
  onResumeStrategy,
  onUpdateStrategy,
}: StrategyManagementPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-black/20 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          Strategies
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Build and manage exit rules
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
          Create and revise planning rules. Activation controls stay gated behind
          internal Phase 5 readiness flags.
        </p>
        {!phase5Gates.strategyActivationEnabled ? (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-200">
            {phase5Gates.disabledReason}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {showForm ? (
          <CreateStrategyForm
            key={editingStrategy?.id ?? "new"}
            onAddStrategy={onAddStrategy}
            onUpdateStrategy={onUpdateStrategy}
            onCancel={onCloseForm}
            editingStrategy={editingStrategy}
            phase5Gates={phase5Gates}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">
              Ready to create a strategy?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Click the New Strategy button to add a take-profit or stop-loss
              rule.
            </p>
            <button
              onClick={onOpenNewStrategy}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black sm:w-auto"
            >
              Open Form
            </button>
          </div>
        )}

        <StrategyList
          strategies={strategies}
          pendingStrategyActionById={pendingStrategyActionById}
          onPauseStrategy={onPauseStrategy}
          onResumeStrategy={onResumeStrategy}
          onDeleteStrategy={onDeleteStrategy}
          onEditStrategy={onEditStrategy}
          phase5Gates={phase5Gates}
        />
      </div>
    </div>
  )
}

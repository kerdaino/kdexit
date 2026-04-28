"use client"

import { useState } from "react"
import {
  getDisabledExecutionControlMessage,
  type DisabledExecutionControlAction,
} from "@/lib/dashboard/execution-control-boundary"
import type { ExecutionReadinessSnapshot } from "@/types/execution-readiness"
import type { Phase5ExecutionUiGates } from "@/types/phase5-gates"

type InternalExecutionControlsPanelProps = {
  executionReadiness: ExecutionReadinessSnapshot
  phase5Gates: Phase5ExecutionUiGates
}

const placeholderControls: Array<{
  action: DisabledExecutionControlAction
  label: string
  description: string
}> = [
  {
    action: "authorize_execution",
    label: "Authorize Execution",
    description:
      "Future setup surface for explicit user consent and constrained onchain permissions.",
  },
  {
    action: "arm_strategy",
    label: "Arm Strategy",
    description:
      "Future control for moving a saved planning rule into an authorized execution-ready state.",
  },
  {
    action: "run_execution",
    label: "Run Execution",
    description:
      "Future emergency or internal test control. It is intentionally unavailable in this app state.",
  },
]

export default function InternalExecutionControlsPanel({
  executionReadiness,
  phase5Gates,
}: InternalExecutionControlsPanelProps) {
  const [boundaryMessage, setBoundaryMessage] = useState(
    phase5Gates.disabledReason ??
      "Internal execution controls are present as disabled placeholders only."
  )

  function handleDisabledPlaceholder(action: DisabledExecutionControlAction) {
    setBoundaryMessage(getDisabledExecutionControlMessage(action))
  }

  return (
    <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-amber-200">
            Internal Beta / Disabled
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            Future execution controls
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-100/80">
            This is a product-structure placeholder for future Phase 5 execution
            controls. It does not call contracts, send transactions, request token
            approvals, move funds, or use relayer/private-key logic.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-amber-300/20 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-amber-100">
          {executionReadiness.label}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-300/20 bg-black/20 px-4 py-3 text-sm leading-6 text-amber-100">
        {boundaryMessage}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {placeholderControls.map((control) => (
          <div
            key={control.action}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <p className="text-base font-semibold text-white">{control.label}</p>
            <p className="mt-2 text-sm leading-6 text-amber-100/75">
              {control.description}
            </p>
            <button
              type="button"
              disabled
              onClick={() => handleDisabledPlaceholder(control.action)}
              className="mt-4 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-400 opacity-70"
            >
              Disabled Placeholder
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => handleDisabledPlaceholder("run_execution")}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/20 bg-black/20 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-black/30"
      >
        Review disabled execution boundary
      </button>
    </section>
  )
}

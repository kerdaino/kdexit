import type { ExecutionAttemptRecord } from "@/types/database-records"
import type { ReconciliationResult } from "@/lib/watcher/types"

type ReconcileExecutionAttemptInput = {
  attempt: ExecutionAttemptRecord
}

export function reconcileExecutionAttempt(
  input: ReconcileExecutionAttemptInput
): ReconciliationResult {
  if (!input.attempt.transaction_hash) {
    return {
      kind: "noop",
      reason: "No transaction hash is present yet, so there is nothing to reconcile.",
    }
  }

  return {
    kind: "pending",
    status: "submitted",
    reason: "Onchain reconciliation is not implemented yet.",
  }
}

export type DisabledExecutionControlAction =
  | "authorize_execution"
  | "arm_strategy"
  | "run_execution"

const DISABLED_EXECUTION_CONTROL_MESSAGES: Record<
  DisabledExecutionControlAction,
  string
> = {
  authorize_execution:
    "Execution authorization is disabled. KDEXIT is not requesting approvals, signatures, or contract permissions in this build.",
  arm_strategy:
    "Strategy arming is disabled. Offchain strategy records are not converted into live execution authorization here.",
  run_execution:
    "Live execution is disabled. This placeholder does not submit transactions, call contracts, route swaps, or move funds.",
}

// Phase 5 placeholder boundary:
// These handlers must remain inert until a future execution gateway adds explicit
// user consent, onchain authorization checks, kill-switch checks, and transaction
// reconciliation. Do not import wallet clients, private keys, relayers, or contract
// write APIs into this module.
export function getDisabledExecutionControlMessage(
  action: DisabledExecutionControlAction
) {
  return DISABLED_EXECUTION_CONTROL_MESSAGES[action]
}

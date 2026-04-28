import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import {
  buildOwnedResourceNotFoundResponse,
  requireRouteUser,
} from "@/lib/api/route-auth"
import type { StrategyUpdateInput } from "@/lib/api/contracts"
import { validateIdentifierParam } from "@/lib/api/validation/shared"
import { validateStrategyUpdatePayload } from "@/lib/api/validation/strategies"
import { getExecutionReadinessSnapshot } from "@/lib/config/execution-readiness"
import { getPhase5ExecutionUiGates } from "@/lib/dashboard/phase5-gates"
import type { StrategyRecord, StrategyUpdate } from "@/types/database-records"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("must be signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  if (message.includes("not enabled")) {
    return jsonError(code, message, { status: 503 })
  }

  return jsonError(code, message, { status: 500 })
}

const PHASE5_GATE_DISABLED_MESSAGE =
  "Strategy activation is disabled until the internal Phase 5 gates are enabled. Keep the strategy paused with triggers off."

function isPhase5StrategyActivationEnabled() {
  return getPhase5ExecutionUiGates(getExecutionReadinessSnapshot())
    .strategyActivationEnabled
}

function hasRequestedStrategyActivation(updates: StrategyUpdateInput) {
  return updates.status === "active" || updates.triggerEnabled === true
}

function toStrategyUpdate(
  existing: StrategyRecord,
  updates: StrategyUpdateInput,
  strategyActivationEnabled: boolean
): StrategyUpdate {
  const requestedTriggerState =
    updates.triggerEnabled !== undefined
      ? updates.triggerEnabled
      : existing.trigger_enabled
  const requestedStatus = updates.status ?? existing.status

  return {
    token_name: updates.tokenName ?? existing.token_name,
    token_symbol: updates.tokenSymbol ?? existing.token_symbol,
    token_address: updates.tokenAddress ?? existing.token_address,
    chain: updates.chain ?? existing.chain,
    chain_id: updates.chainId ?? existing.chain_id,
    sell_percentage: updates.sellPercentage ?? existing.sell_percentage,
    take_profit_price:
      updates.takeProfitPrice !== undefined
        ? updates.takeProfitPrice
        : existing.take_profit_price,
    stop_loss_price:
      updates.stopLossPrice !== undefined
        ? updates.stopLossPrice
        : existing.stop_loss_price,
    trigger_enabled: strategyActivationEnabled ? requestedTriggerState : false,
    slippage: updates.slippage ?? existing.slippage,
    notes: updates.notes !== undefined ? updates.notes ?? null : existing.notes,
    status: strategyActivationEnabled ? requestedStatus : "paused",
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ strategyId: string }> }
) {
  const { strategyId } = await context.params
  const strategyIdError = validateIdentifierParam(strategyId, "Strategy ID")

  if (strategyIdError) {
    return jsonValidationError("Strategy request is invalid.", {
      strategyId: strategyIdError,
    })
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from("strategies")
    .select("*")
    .eq("id", strategyId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (error) {
    return getDataErrorResponse("strategy_get_failed", error.message)
  }

  if (!data) {
    return buildOwnedResourceNotFoundResponse("strategy")
  }

  return jsonSuccess(data, {
    meta: {
      resource: "strategy",
    },
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ strategyId: string }> }
) {
  const { strategyId } = await context.params
  const strategyIdError = validateIdentifierParam(strategyId, "Strategy ID")

  if (strategyIdError) {
    return jsonValidationError("Strategy update request is invalid.", {
      strategyId: strategyIdError,
    })
  }

  const payload = await request.json().catch(() => null)
  const validation = validateStrategyUpdatePayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Strategy update payload is invalid. Fix the highlighted fields and try again.",
      validation.fieldErrors
    )
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("strategies")
    .select("*")
    .eq("id", strategyId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (existingError) {
    return getDataErrorResponse("strategy_get_failed", existingError.message)
  }

  if (!existing) {
    return buildOwnedResourceNotFoundResponse("strategy")
  }

  const strategyActivationEnabled = isPhase5StrategyActivationEnabled()

  if (!strategyActivationEnabled && hasRequestedStrategyActivation(validation.data)) {
    return jsonError(
      "phase5_execution_gate_disabled",
      PHASE5_GATE_DISABLED_MESSAGE,
      { status: 403 }
    )
  }

  const { data, error } = await auth.supabase
    .from("strategies")
    .update(toStrategyUpdate(existing, validation.data, strategyActivationEnabled) as never)
    .eq("id", strategyId)
    .eq("user_id", auth.user.id)
    .select()
    .single()

  if (error || !data) {
    return getDataErrorResponse("strategy_update_failed", error?.message ?? "Failed to update strategy.")
  }

  return jsonSuccess(data, {
    meta: {
      resource: "strategy",
      phase5StrategyActivationEnabled: strategyActivationEnabled,
    },
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ strategyId: string }> }
) {
  const { strategyId } = await context.params
  const strategyIdError = validateIdentifierParam(strategyId, "Strategy ID")

  if (strategyIdError) {
    return jsonValidationError("Strategy delete request is invalid.", {
      strategyId: strategyIdError,
    })
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("strategies")
    .select("id")
    .eq("id", strategyId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (existingError) {
    return getDataErrorResponse("strategy_get_failed", existingError.message)
  }

  if (!existing) {
    return buildOwnedResourceNotFoundResponse("strategy")
  }

  const { error } = await auth.supabase
    .from("strategies")
    .delete()
    .eq("id", strategyId)
    .eq("user_id", auth.user.id)

  if (error) {
    return getDataErrorResponse("strategy_delete_failed", error.message)
  }

  return jsonSuccess(
    { id: strategyId },
    {
      meta: {
        resource: "strategy",
      },
    }
  )
}

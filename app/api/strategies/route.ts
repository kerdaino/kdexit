import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { requireRouteUser, withOwnedInsert } from "@/lib/api/route-auth"
import { validateStrategyCreatePayload } from "@/lib/api/validation/strategies"
import {
  PHASE5_STRATEGY_ACTIVATION_DISABLED_MESSAGE,
  getPhase5StrategyActivationFields,
  hasRequestedPhase5StrategyActivation,
  isPhase5StrategyActivationEnabled,
} from "@/lib/config/phase5-server-gates"
import type { StrategyCreateInput } from "@/lib/api/contracts"
import type { StrategyInsert } from "@/types/database-records"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("must be signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  if (message.includes("not enabled")) {
    return jsonError(code, message, { status: 503 })
  }

  return jsonError(code, message, { status: 500 })
}

function toStrategyInsert(
  input: StrategyCreateInput,
  strategyActivationEnabled: boolean
): StrategyInsert {
  const activationFields = getPhase5StrategyActivationFields(
    strategyActivationEnabled,
    input,
    {
      status: "active",
      triggerEnabled: true,
    }
  )

  return {
    token_name: input.tokenName,
    token_symbol: input.tokenSymbol,
    token_address: input.tokenAddress ?? "",
    chain: input.chain,
    chain_id: input.chainId,
    sell_percentage: input.sellPercentage,
    take_profit_price: input.takeProfitPrice ?? null,
    stop_loss_price: input.stopLossPrice ?? null,
    trigger_enabled: activationFields.triggerEnabled,
    slippage: input.slippage ?? 1,
    notes: input.notes ?? null,
    status: activationFields.status,
  }
}

export async function GET() {
  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from("strategies")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return getDataErrorResponse("strategy_list_failed", error.message)
  }

  return jsonSuccess(data, {
    meta: {
      resource: "strategies",
    },
  })
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const validation = validateStrategyCreatePayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Strategy payload is invalid. Fix the highlighted fields and try again.",
      validation.fieldErrors
    )
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const strategyActivationEnabled = isPhase5StrategyActivationEnabled()

  if (
    !strategyActivationEnabled &&
    hasRequestedPhase5StrategyActivation(validation.data)
  ) {
    return jsonError(
      "phase5_execution_gate_disabled",
      PHASE5_STRATEGY_ACTIVATION_DISABLED_MESSAGE,
      { status: 403 }
    )
  }

  const insertPayload = withOwnedInsert(
    auth.user,
    toStrategyInsert(validation.data, strategyActivationEnabled)
  )

  const { data, error } = await auth.supabase
    .from("strategies")
    .insert(insertPayload as never)
    .select()
    .single()

  if (error || !data) {
    return getDataErrorResponse("strategy_create_failed", error?.message ?? "Failed to create strategy.")
  }

  return jsonSuccess(data, {
    status: 201,
    meta: {
      resource: "strategy",
      phase5StrategyActivationEnabled: strategyActivationEnabled,
    },
  })
}

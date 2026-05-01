import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import {
  buildOwnedResourceNotFoundResponse,
  requireRouteUser,
  requireSameOriginMutation,
} from "@/lib/api/route-auth"
import { validateExecutionAuthorizationCreatePayload } from "@/lib/api/validation/execution-authorization"
import { validateIdentifierParam } from "@/lib/api/validation/shared"
import {
  hashExecutionAuthorization,
  verifyExecutionAuthorizationSignature,
} from "@/lib/execution-authorization/typed-data"
import { normalizeWalletAddress } from "@/lib/web3/wallet-address"
import type { StrategyRecord } from "@/types/database-records"
import type { Database } from "@/lib/supabase/types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Hex } from "viem"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("must be signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  if (message.includes("not enabled")) {
    return jsonError(code, message, { status: 503 })
  }

  return jsonError(code, message, { status: 500 })
}

function isExpired(deadline: string, now = new Date()) {
  return BigInt(deadline) <= BigInt(Math.floor(now.getTime() / 1000))
}

async function getOwnedStrategy(input: {
  strategyId: string
  supabase: SupabaseClient<Database>
  userId: string
}) {
  return input.supabase
    .from("strategies")
    .select("*")
    .eq("id", input.strategyId)
    .eq("user_id", input.userId)
    .maybeSingle()
}

export async function POST(
  request: Request,
  context: { params: Promise<{ strategyId: string }> }
) {
  const origin = requireSameOriginMutation(request)

  if (!origin.ok) {
    return origin.response
  }

  const { strategyId } = await context.params
  const strategyIdError = validateIdentifierParam(strategyId, "Strategy ID")

  if (strategyIdError) {
    return jsonValidationError("Authorization request is invalid.", {
      strategyId: strategyIdError,
    })
  }

  const payload = await request.json().catch(() => null)
  const validation = validateExecutionAuthorizationCreatePayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Execution authorization payload is invalid.",
      validation.fieldErrors
    )
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data: strategy, error: strategyError } = await getOwnedStrategy({
    strategyId,
    supabase: auth.supabase,
    userId: auth.user.id,
  })

  if (strategyError) {
    return getDataErrorResponse("strategy_get_failed", strategyError.message)
  }

  if (!strategy) {
    return buildOwnedResourceNotFoundResponse("strategy")
  }

  const typedStrategy = strategy as StrategyRecord

  if (!typedStrategy.token_address) {
    return jsonError(
      "authorization_token_missing",
      "A token contract address is required before signing execution authorization.",
      { status: 422 }
    )
  }

  if (isExpired(validation.data.deadline)) {
    return jsonError(
      "authorization_deadline_expired",
      "Authorization deadline must be in the future.",
      { status: 422 }
    )
  }

  const walletAddress = normalizeWalletAddress(validation.data.walletAddress)
  const { data: wallet, error: walletError } = await auth.supabase
    .from("wallet_links")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("wallet_address", walletAddress)
    .eq("chain_id", typedStrategy.chain_id)
    .maybeSingle()

  if (walletError) {
    return getDataErrorResponse("authorization_wallet_check_failed", walletError.message)
  }

  if (!wallet) {
    return jsonError(
      "linked_wallet_required",
      "Connect and link this wallet for the strategy chain before signing execution authorization.",
      { status: 403 }
    )
  }

  const authorization = {
    adapter: validation.data.adapter,
    chainId: typedStrategy.chain_id,
    deadline: validation.data.deadline,
    maxAmount: validation.data.maxAmount,
    nonce: validation.data.nonce,
    sellPercentage: Number(typedStrategy.sell_percentage),
    strategyId: typedStrategy.id,
    tokenAddress: typedStrategy.token_address,
    walletAddress,
  }
  const digest = hashExecutionAuthorization(authorization)

  if (digest.toLowerCase() !== validation.data.digest.toLowerCase()) {
    return jsonError(
      "authorization_digest_mismatch",
      "The signed authorization digest does not match this strategy.",
      { status: 422 }
    )
  }

  const signatureIsValid = await verifyExecutionAuthorizationSignature({
    authorization,
    signature: validation.data.signature as Hex,
  })

  if (!signatureIsValid) {
    return jsonError(
      "authorization_signature_invalid",
      "The typed-data signature could not be verified for the linked wallet.",
      { status: 422 }
    )
  }

  const now = new Date().toISOString()
  const { data, error } = await auth.supabase
    .from("strategies")
    .update(
      {
        authorization_adapter: validation.data.adapter,
        authorization_cancelled_at: null,
        authorization_deadline: validation.data.deadline,
        authorization_digest: digest,
        authorization_max_amount: validation.data.maxAmount,
        authorization_nonce: validation.data.nonce,
        authorization_reference: digest,
        authorization_signature: validation.data.signature,
        authorization_signed_at: now,
        authorization_status: "signed",
        authorization_wallet_address: walletAddress,
        execution_mode: "live_disabled",
      } as never
    )
    .eq("id", strategyId)
    .eq("user_id", auth.user.id)
    .select("*")
    .single()

  if (error || !data) {
    return getDataErrorResponse(
      "authorization_store_failed",
      error?.message ?? "Failed to store execution authorization."
    )
  }

  return jsonSuccess(data, {
    meta: {
      executionBoundary:
        "Stored typed-data authorization only. No token approval or transaction was requested.",
      resource: "strategy_authorization",
    },
  })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ strategyId: string }> }
) {
  const origin = requireSameOriginMutation(request)

  if (!origin.ok) {
    return origin.response
  }

  const { strategyId } = await context.params
  const strategyIdError = validateIdentifierParam(strategyId, "Strategy ID")

  if (strategyIdError) {
    return jsonValidationError("Authorization cancellation request is invalid.", {
      strategyId: strategyIdError,
    })
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data: strategy, error: strategyError } = await getOwnedStrategy({
    strategyId,
    supabase: auth.supabase,
    userId: auth.user.id,
  })

  if (strategyError) {
    return getDataErrorResponse("strategy_get_failed", strategyError.message)
  }

  if (!strategy) {
    return buildOwnedResourceNotFoundResponse("strategy")
  }

  const { data, error } = await auth.supabase
    .from("strategies")
    .update(
      {
        authorization_cancelled_at: new Date().toISOString(),
        authorization_status: "cancelled",
        execution_mode: "simulation",
      } as never
    )
    .eq("id", strategyId)
    .eq("user_id", auth.user.id)
    .select("*")
    .single()

  if (error || !data) {
    return getDataErrorResponse(
      "authorization_cancel_failed",
      error?.message ?? "Failed to cancel execution authorization."
    )
  }

  return jsonSuccess(data, {
    meta: {
      executionBoundary:
        "Cancelled app-level stored authorization only. No onchain revoke transaction was sent.",
      resource: "strategy_authorization",
    },
  })
}

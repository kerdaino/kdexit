import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { requireRouteUser, withOwnedInsert } from "@/lib/api/route-auth"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { WalletLinkCreateInput } from "@/lib/api/contracts"
import { validateWalletLinkCreatePayload } from "@/lib/api/validation/wallet-links"
import type { Database } from "@/lib/supabase/types"
import type { WalletLinkInsert } from "@/types/database-records"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("must be signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  if (message.includes("not enabled")) {
    return jsonError(code, message, { status: 503 })
  }

  return jsonError(code, message, { status: 500 })
}

function toWalletLinkInsert(input: WalletLinkCreateInput): WalletLinkInsert {
  return {
    wallet_address: input.walletAddress,
    chain_id: input.chainId,
    connector_name: input.connectorName ?? null,
    label: input.label ?? null,
    is_primary: input.isPrimary ?? false,
  }
}

async function clearPrimaryWalletLinks(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { error } = await supabase
    .from("wallet_links")
    .update({
      is_primary: false,
    } as never)
    .eq("user_id", userId)
    .eq("is_primary", true)

  return error?.message ?? null
}

async function getExistingWalletLink(
  supabase: SupabaseClient<Database>,
  userId: string,
  walletAddress: string,
  chainId: number
) {
  const { data, error } = await supabase
    .from("wallet_links")
    .select("id")
    .eq("user_id", userId)
    .eq("wallet_address", walletAddress)
    .eq("chain_id", chainId)
    .maybeSingle()

  return {
    data,
    error: error?.message ?? null,
  }
}

export async function GET() {
  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from("wallet_links")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return getDataErrorResponse("wallet_link_list_failed", error.message)
  }

  return jsonSuccess(data, {
    meta: {
      resource: "wallet_links",
    },
  })
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const validation = validateWalletLinkCreatePayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Wallet link payload is invalid. Fix the highlighted fields and try again.",
      validation.fieldErrors
    )
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const existingWalletLink = await getExistingWalletLink(
    auth.supabase,
    auth.user.id,
    validation.data.walletAddress,
    validation.data.chainId
  )

  if (existingWalletLink.error) {
    return getDataErrorResponse("wallet_link_duplicate_check_failed", existingWalletLink.error)
  }

  if (existingWalletLink.data) {
    return jsonError(
      "wallet_link_duplicate",
      "That wallet is already linked to your account for this chain.",
      {
        status: 409,
      }
    )
  }

  if (validation.data.isPrimary) {
    const primaryClearError = await clearPrimaryWalletLinks(auth.supabase, auth.user.id)

    if (primaryClearError) {
      return getDataErrorResponse("wallet_link_primary_clear_failed", primaryClearError)
    }
  }

  const insertPayload = withOwnedInsert(auth.user, toWalletLinkInsert(validation.data))

  const { data, error } = await auth.supabase
    .from("wallet_links")
    .insert(insertPayload as never)
    .select()
    .single()

  if (error || !data) {
    if (error?.code === "23505") {
      return jsonError(
        "wallet_link_duplicate",
        "That wallet is already linked to your account for this chain.",
        {
          status: 409,
        }
      )
    }

    return getDataErrorResponse(
      "wallet_link_create_failed",
      error?.message ?? "Failed to link wallet."
    )
  }

  return jsonSuccess(data, {
    status: 201,
    meta: {
      resource: "wallet_link",
    },
  })
}

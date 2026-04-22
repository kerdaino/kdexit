import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { requireRouteUser } from "@/lib/api/route-auth"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { WalletLinkUpdateInput } from "@/lib/api/contracts"
import type { Database } from "@/lib/supabase/types"
import { validateIdentifierParam } from "@/lib/api/validation/shared"
import { validateWalletLinkUpdatePayload } from "@/lib/api/validation/wallet-links"
import type { WalletLinkRecord, WalletLinkUpdate } from "@/types/database-records"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("must be signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  if (message.includes("not enabled")) {
    return jsonError(code, message, { status: 503 })
  }

  return jsonError(code, message, { status: 500 })
}

function buildWalletLinkNotFoundResponse() {
  return jsonError("wallet_link_not_found", "Wallet link not found.", {
    status: 404,
  })
}

function toWalletLinkUpdate(
  existing: WalletLinkRecord,
  updates: WalletLinkUpdateInput
): WalletLinkUpdate {
  return {
    label: updates.label !== undefined ? updates.label ?? null : existing.label,
    connector_name:
      updates.connectorName !== undefined
        ? updates.connectorName ?? null
        : existing.connector_name,
    is_primary:
      updates.isPrimary !== undefined ? updates.isPrimary : existing.is_primary,
  }
}

async function clearPrimaryWalletLinks(
  supabase: SupabaseClient<Database>,
  userId: string,
  excludeId: string
) {
  const { error } = await supabase
    .from("wallet_links")
    .update({
      is_primary: false,
    } as never)
    .eq("user_id", userId)
    .eq("is_primary", true)
    .neq("id", excludeId)

  return error?.message ?? null
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ walletLinkId: string }> }
) {
  const { walletLinkId } = await context.params
  const walletLinkIdError = validateIdentifierParam(walletLinkId, "Wallet link ID")

  if (walletLinkIdError) {
    return jsonValidationError("Wallet link request is invalid.", {
      walletLinkId: walletLinkIdError,
    })
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from("wallet_links")
    .select("*")
    .eq("id", walletLinkId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (error) {
    return getDataErrorResponse("wallet_link_get_failed", error.message)
  }

  if (!data) {
    return buildWalletLinkNotFoundResponse()
  }

  return jsonSuccess(data, {
    meta: {
      resource: "wallet_link",
    },
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ walletLinkId: string }> }
) {
  const { walletLinkId } = await context.params
  const walletLinkIdError = validateIdentifierParam(walletLinkId, "Wallet link ID")

  if (walletLinkIdError) {
    return jsonValidationError("Wallet link update request is invalid.", {
      walletLinkId: walletLinkIdError,
    })
  }

  const payload = await request.json().catch(() => null)
  const validation = validateWalletLinkUpdatePayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Wallet link update payload is invalid. Fix the highlighted fields and try again.",
      validation.fieldErrors
    )
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("wallet_links")
    .select("*")
    .eq("id", walletLinkId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (existingError) {
    return getDataErrorResponse("wallet_link_get_failed", existingError.message)
  }

  if (!existing) {
    return buildWalletLinkNotFoundResponse()
  }

  if (validation.data.isPrimary) {
    const primaryClearError = await clearPrimaryWalletLinks(
      auth.supabase,
      auth.user.id,
      walletLinkId
    )

    if (primaryClearError) {
      return getDataErrorResponse("wallet_link_primary_clear_failed", primaryClearError)
    }
  }

  const { data, error } = await auth.supabase
    .from("wallet_links")
    .update(toWalletLinkUpdate(existing, validation.data) as never)
    .eq("id", walletLinkId)
    .eq("user_id", auth.user.id)
    .select()
    .single()

  if (error || !data) {
    return getDataErrorResponse(
      "wallet_link_update_failed",
      error?.message ?? "Failed to update wallet link."
    )
  }

  return jsonSuccess(data, {
    meta: {
      resource: "wallet_link",
    },
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ walletLinkId: string }> }
) {
  const { walletLinkId } = await context.params
  const walletLinkIdError = validateIdentifierParam(walletLinkId, "Wallet link ID")

  if (walletLinkIdError) {
    return jsonValidationError("Wallet link delete request is invalid.", {
      walletLinkId: walletLinkIdError,
    })
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("wallet_links")
    .select("id")
    .eq("id", walletLinkId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (existingError) {
    return getDataErrorResponse("wallet_link_get_failed", existingError.message)
  }

  if (!existing) {
    return buildWalletLinkNotFoundResponse()
  }

  const { error } = await auth.supabase
    .from("wallet_links")
    .delete()
    .eq("id", walletLinkId)
    .eq("user_id", auth.user.id)

  if (error) {
    return getDataErrorResponse("wallet_link_delete_failed", error.message)
  }

  return jsonSuccess(
    { id: walletLinkId },
    {
      meta: {
        resource: "wallet_link",
      },
    }
  )
}

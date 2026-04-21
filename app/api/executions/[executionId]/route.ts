import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import {
  buildOwnedResourceNotFoundResponse,
  requireRouteUser,
} from "@/lib/api/route-auth"
import type { ExecutionUpdateInput } from "@/lib/api/contracts"
import { validateIdentifierParam } from "@/lib/api/validation/shared"
import { validateExecutionUpdatePayload } from "@/lib/api/validation/executions"
import type { ExecutionRecord, ExecutionUpdate } from "@/types/database-records"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("must be signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  if (message.includes("not enabled")) {
    return jsonError(code, message, { status: 503 })
  }

  return jsonError(code, message, { status: 500 })
}

function parseAmountSold(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/)

  if (!match) {
    return null
  }

  return Number(match[0])
}

function toExecutionUpdate(
  existing: ExecutionRecord,
  updates: ExecutionUpdateInput
): ExecutionUpdate {
  return {
    token_symbol: updates.tokenSymbol ?? existing.token_symbol,
    trigger_type: updates.triggerType ?? existing.trigger_type,
    amount_sold:
      updates.amountSold !== undefined
        ? parseAmountSold(updates.amountSold)
        : existing.amount_sold,
    status: updates.status ?? existing.status,
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await context.params
  const executionIdError = validateIdentifierParam(executionId, "Execution ID")

  if (executionIdError) {
    return jsonValidationError("Execution request is invalid.", {
      executionId: executionIdError,
    })
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from("executions")
    .select("*")
    .eq("id", executionId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (error) {
    return getDataErrorResponse("execution_get_failed", error.message)
  }

  if (!data) {
    return buildOwnedResourceNotFoundResponse("execution")
  }

  return jsonSuccess(data, {
    meta: {
      resource: "execution",
    },
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await context.params
  const executionIdError = validateIdentifierParam(executionId, "Execution ID")

  if (executionIdError) {
    return jsonValidationError("Execution update request is invalid.", {
      executionId: executionIdError,
    })
  }

  const payload = await request.json().catch(() => null)
  const validation = validateExecutionUpdatePayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Execution update payload is invalid. Fix the highlighted fields and try again.",
      validation.fieldErrors
    )
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("executions")
    .select("*")
    .eq("id", executionId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (existingError) {
    return getDataErrorResponse("execution_get_failed", existingError.message)
  }

  if (!existing) {
    return buildOwnedResourceNotFoundResponse("execution")
  }

  const { data, error } = await auth.supabase
    .from("executions")
    .update(toExecutionUpdate(existing, validation.data) as never)
    .eq("id", executionId)
    .eq("user_id", auth.user.id)
    .select()
    .single()

  if (error || !data) {
    return getDataErrorResponse("execution_update_failed", error?.message ?? "Failed to update execution.")
  }

  return jsonSuccess(data, {
    meta: {
      resource: "execution",
    },
  })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await context.params
  const executionIdError = validateIdentifierParam(executionId, "Execution ID")

  if (executionIdError) {
    return jsonValidationError("Execution delete request is invalid.", {
      executionId: executionIdError,
    })
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("executions")
    .select("id")
    .eq("id", executionId)
    .eq("user_id", auth.user.id)
    .maybeSingle()

  if (existingError) {
    return getDataErrorResponse("execution_get_failed", existingError.message)
  }

  if (!existing) {
    return buildOwnedResourceNotFoundResponse("execution")
  }

  const { error } = await auth.supabase
    .from("executions")
    .delete()
    .eq("id", executionId)
    .eq("user_id", auth.user.id)

  if (error) {
    return getDataErrorResponse("execution_delete_failed", error.message)
  }

  return jsonSuccess(
    { id: executionId },
    {
      meta: {
        resource: "execution",
      },
    }
  )
}

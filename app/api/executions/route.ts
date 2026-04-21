import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { requireRouteUser, withOwnedInsert } from "@/lib/api/route-auth"
import type { ExecutionCreateInput } from "@/lib/api/contracts"
import { validateExecutionCreatePayload } from "@/lib/api/validation/executions"
import type { ExecutionInsert } from "@/types/database-records"

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

function toExecutionInsert(input: ExecutionCreateInput): ExecutionInsert {
  return {
    token_symbol: input.tokenSymbol,
    trigger_type: input.triggerType,
    amount_sold: parseAmountSold(input.amountSold),
    status: input.status,
  }
}

export async function GET() {
  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from("executions")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("executed_at", { ascending: false })

  if (error) {
    return getDataErrorResponse("execution_list_failed", error.message)
  }

  return jsonSuccess(data, {
    meta: {
      resource: "executions",
    },
  })
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const validation = validateExecutionCreatePayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Execution payload is invalid. Fix the highlighted fields and try again.",
      validation.fieldErrors
    )
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const insertPayload = withOwnedInsert(auth.user, toExecutionInsert(validation.data))

  const { data, error } = await auth.supabase
    .from("executions")
    .insert(insertPayload as never)
    .select()
    .single()

  if (error || !data) {
    return getDataErrorResponse("execution_create_failed", error?.message ?? "Failed to create execution.")
  }

  return jsonSuccess(data, {
    status: 201,
    meta: {
      resource: "execution",
    },
  })
}

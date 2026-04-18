import { listExecutions } from "@/lib/data"
import { jsonError, jsonNotImplemented, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { validateExecutionCreatePayload } from "@/lib/api/validation/executions"

export async function GET() {
  const result = await listExecutions()

  if (result.error) {
    return jsonError("execution_list_failed", result.error, { status: 500 })
  }

  return jsonSuccess(result.data, {
    meta: {
      resource: "executions",
      isPlaceholderData: result.isPlaceholder,
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

  return jsonNotImplemented("Execution creation")
}

import { listStrategies } from "@/lib/data"
import { jsonError, jsonNotImplemented, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { validateStrategyCreatePayload } from "@/lib/api/validation/strategies"

export async function GET() {
  const result = await listStrategies()

  if (result.error) {
    return jsonError("strategy_list_failed", result.error, { status: 500 })
  }

  return jsonSuccess(result.data, {
    meta: {
      resource: "strategies",
      isPlaceholderData: result.isPlaceholder,
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

  return jsonNotImplemented("Strategy creation")
}

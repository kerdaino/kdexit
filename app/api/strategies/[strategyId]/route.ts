import { jsonNotImplemented, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { validateIdentifierParam } from "@/lib/api/validation/shared"
import { validateStrategyUpdatePayload } from "@/lib/api/validation/strategies"

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

  return jsonSuccess(
    {
      id: strategyId,
    },
    {
      meta: {
        resource: "strategy",
        mode: "placeholder",
      },
    }
  )
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

  return jsonNotImplemented("Strategy update")
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

  return jsonNotImplemented("Strategy deletion")
}

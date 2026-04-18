import { jsonNotImplemented, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { validateIdentifierParam } from "@/lib/api/validation/shared"
import { validateExecutionUpdatePayload } from "@/lib/api/validation/executions"

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

  return jsonSuccess(
    {
      id: executionId,
    },
    {
      meta: {
        resource: "execution",
        mode: "placeholder",
      },
    }
  )
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

  return jsonNotImplemented("Execution update")
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

  return jsonNotImplemented("Execution deletion")
}

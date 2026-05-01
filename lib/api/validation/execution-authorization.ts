import { executionAuthorizationCreateSchema } from "@/lib/api/schemas/execution-authorization"
import { validateWithSchema } from "@/lib/api/validation/shared"

export function validateExecutionAuthorizationCreatePayload(payload: unknown) {
  return validateWithSchema(executionAuthorizationCreateSchema, payload)
}

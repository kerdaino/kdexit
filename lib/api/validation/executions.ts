import { executionCreateSchema, executionUpdateSchema } from "@/lib/api/schemas/execution"
import { validateWithSchema } from "@/lib/api/validation/shared"

export function validateExecutionCreatePayload(payload: unknown) {
  return validateWithSchema(executionCreateSchema, payload)
}

export function validateExecutionUpdatePayload(payload: unknown) {
  return validateWithSchema(executionUpdateSchema, payload)
}

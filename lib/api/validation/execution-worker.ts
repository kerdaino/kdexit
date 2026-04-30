import { executionWorkerDryRunRequestSchema } from "@/lib/api/schemas/execution-worker"
import { validateWithSchema } from "@/lib/api/validation/shared"

export function validateExecutionWorkerDryRunPayload(payload: unknown) {
  return validateWithSchema(executionWorkerDryRunRequestSchema, payload)
}

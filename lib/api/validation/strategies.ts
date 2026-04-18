import { strategyCreateSchema, strategyUpdateSchema } from "@/lib/api/schemas/strategy"
import { validateWithSchema } from "@/lib/api/validation/shared"

export function validateStrategyCreatePayload(payload: unknown) {
  return validateWithSchema(strategyCreateSchema, payload)
}

export function validateStrategyUpdatePayload(payload: unknown) {
  return validateWithSchema(strategyUpdateSchema, payload)
}

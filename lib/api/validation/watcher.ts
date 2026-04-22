import { watcherSimulationRequestSchema } from "@/lib/api/schemas/watcher"
import { validateWithSchema } from "@/lib/api/validation/shared"

export function validateWatcherSimulationPayload(payload: unknown) {
  return validateWithSchema(watcherSimulationRequestSchema, payload)
}

import { jsonError, jsonSuccess, jsonValidationError } from "@/lib/api/http"
import { requireInternalWatcherSimulationAccess } from "@/lib/api/internal-access"
import { validateWatcherSimulationPayload } from "@/lib/api/validation/watcher"
import { runAuthenticatedWatcherSimulation } from "@/lib/watcher/manual-simulation"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  return jsonError(code, message, { status: 500 })
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  const validation = validateWatcherSimulationPayload(payload)

  if (!validation.success) {
    return jsonValidationError(
      "Watcher simulation payload is invalid. Fix the highlighted fields and try again.",
      validation.fieldErrors
    )
  }

  const auth = await requireInternalWatcherSimulationAccess()

  if (!auth.ok) {
    return auth.response
  }

  try {
    const result = await runAuthenticatedWatcherSimulation(
      auth.supabase,
      auth.user.id,
      validation.data
    )

    return jsonSuccess(result, {
      status: 201,
      meta: {
        mode: "simulation",
        route: "internal",
        resource: "watcher_simulation",
      },
    })
  } catch (error) {
    return getDataErrorResponse(
      "watcher_simulation_failed",
      error instanceof Error ? error.message : "Watcher simulation failed."
    )
  }
}

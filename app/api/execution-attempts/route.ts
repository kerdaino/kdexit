import { jsonError, jsonSuccess } from "@/lib/api/http"
import { requireRouteUser } from "@/lib/api/route-auth"

type ExecutionAttemptQueryMode = "all" | "simulation" | "live"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("must be signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  if (message.includes("not enabled")) {
    return jsonError(code, message, { status: 503 })
  }

  return jsonError(code, message, { status: 500 })
}

function getExecutionAttemptQueryMode(request: Request): ExecutionAttemptQueryMode | null {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("mode")

  if (mode === null || mode === "all" || mode === "simulation" || mode === "live") {
    return mode ?? "all"
  }

  return null
}

export async function GET(request: Request) {
  const mode = getExecutionAttemptQueryMode(request)

  if (!mode) {
    return jsonError(
      "execution_attempt_list_invalid_mode",
      "Execution attempt mode must be one of: all, simulation, live.",
      { status: 400 }
    )
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  let query = auth.supabase
    .from("execution_attempts")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false })

  if (mode === "simulation") {
    query = query.eq("simulation_mode", true)
  }

  if (mode === "live") {
    query = query.eq("simulation_mode", false)
  }

  const { data, error } = await query

  if (error) {
    return getDataErrorResponse("execution_attempt_list_failed", error.message)
  }

  return jsonSuccess(data, {
    meta: {
      resource: "execution_attempts",
      mode,
    },
  })
}

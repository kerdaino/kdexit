import { jsonError, jsonSuccess } from "@/lib/api/http"
import { requireRouteUser } from "@/lib/api/route-auth"

function getDataErrorResponse(code: string, message: string) {
  if (message.includes("must be signed in")) {
    return jsonError(code, message, { status: 401 })
  }

  if (message.includes("not enabled")) {
    return jsonError(code, message, { status: 503 })
  }

  return jsonError(code, message, { status: 500 })
}

export async function GET() {
  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from("execution_attempts")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    return getDataErrorResponse("execution_attempt_list_failed", error.message)
  }

  return jsonSuccess(data, {
    meta: {
      resource: "execution_attempts",
    },
  })
}

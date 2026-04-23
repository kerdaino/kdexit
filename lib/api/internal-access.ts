import { jsonError } from "@/lib/api/http"
import { isWatcherSimulationModeEnabled } from "@/lib/config/execution-readiness"
import { requireRouteUser } from "@/lib/api/route-auth"

function parseCsvList(value: string | undefined) {
  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function isInternalWatcherSimulationEnabled() {
  return isWatcherSimulationModeEnabled()
}

function isUserAllowlisted(user: { id: string; email?: string | null }) {
  if (process.env.NODE_ENV === "development") {
    return true
  }

  const allowedUserIds = parseCsvList(process.env.KDEXIT_INTERNAL_ADMIN_USER_IDS)
  const allowedEmails = parseCsvList(process.env.KDEXIT_INTERNAL_ADMIN_EMAILS).map((email) =>
    email.toLowerCase()
  )

  if (allowedUserIds.includes(user.id)) {
    return true
  }

  if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
    return true
  }

  return false
}

export async function requireInternalWatcherSimulationAccess() {
  if (process.env.NODE_ENV === "production") {
    return {
      ok: false as const,
      response: jsonError("not_found", "Not found.", { status: 404 }),
    }
  }

  if (!isInternalWatcherSimulationEnabled()) {
    return {
      ok: false as const,
      response: jsonError(
        "internal_simulation_disabled",
        "Internal watcher simulation is disabled in this environment.",
        { status: 403 }
      ),
    }
  }

  const auth = await requireRouteUser()

  if (!auth.ok) {
    return auth
  }

  if (!isUserAllowlisted(auth.user)) {
    return {
      ok: false as const,
      response: jsonError(
        "forbidden",
        "You are not allowed to use the internal watcher simulation route.",
        { status: 403 }
      ),
    }
  }

  return auth
}

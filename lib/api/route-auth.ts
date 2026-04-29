import type { User } from "@supabase/supabase-js"
import { jsonError } from "@/lib/api/http"
import { getConfiguredAppUrl } from "@/lib/site/url"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function requireRouteUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false as const,
      response: jsonError("unauthorized", "You must be signed in to access this resource.", {
        status: 401,
      }),
    }
  }

  return {
    ok: true as const,
    supabase,
    user,
  }
}

export function buildOwnedResourceNotFoundResponse(resource: string) {
  return jsonError(
    `${resource}_not_found`,
    `${resource.charAt(0).toUpperCase()}${resource.slice(1)} not found.`,
    { status: 404 }
  )
}

export function withOwnedInsert<T extends object>(
  user: User,
  payload: T
) {
  return {
    ...payload,
    user_id: user.id,
  }
}

export function requireSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin")

  if (!origin) {
    return { ok: true as const }
  }

  const requestOrigin = new URL(request.url).origin
  const configuredOrigin = getConfiguredAppUrl()
  const allowedOrigins = new Set(
    [requestOrigin, configuredOrigin].filter(Boolean)
  )

  if (allowedOrigins.has(origin)) {
    return { ok: true as const }
  }

  return {
    ok: false as const,
    response: jsonError(
      "forbidden_origin",
      "This request origin is not allowed.",
      { status: 403 }
    ),
  }
}

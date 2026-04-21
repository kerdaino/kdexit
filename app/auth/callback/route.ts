import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getConfiguredAppUrl } from "@/lib/site/url"

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/dashboard"
  }

  return value
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"))

  if (code) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const redirectBaseUrl = getConfiguredAppUrl() ?? requestUrl.origin

  return NextResponse.redirect(new URL(next, redirectBaseUrl))
}

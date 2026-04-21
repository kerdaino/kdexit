"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"

type AccountState = {
  email: string | null
  status: "loading" | "signed_in" | "signed_out" | "unavailable"
}

export default function AccountStatusCard() {
  const [accountState, setAccountState] = useState<AccountState>({
    email: null,
    status: "loading",
  })

  useEffect(() => {
    async function initializeSessionState() {
      if (!hasSupabaseEnv()) {
        setAccountState({
          email: null,
          status: "unavailable",
        })
        return
      }

      const supabase = getSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setAccountState({
        email: session?.user.email ?? null,
        status: session?.user ? "signed_in" : "signed_out",
      })
 
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setAccountState({
          email: nextSession?.user.email ?? null,
          status: nextSession?.user ? "signed_in" : "signed_out",
        })
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    let cleanup: (() => void) | undefined

    void initializeSessionState().then((result) => {
      cleanup = result
    })

    return () => {
      cleanup?.()
    }
  }, [])

  let statusLabel = "Checking"
  let heading = "Looking up your account"
  let description = "Refreshing the current session state."

  if (accountState.status === "unavailable") {
    statusLabel = "Unavailable"
    heading = "Supabase auth is not configured"
    description =
      "Add the public Supabase environment variables to enable signed-in account awareness."
  } else if (accountState.status === "signed_in") {
    statusLabel = "Signed In"
    heading = accountState.email ?? "Authenticated account"
    description =
      "This dashboard can now reflect a real authenticated session as the beta backend is introduced."
  } else if (accountState.status === "signed_out") {
    statusLabel = "Signed Out"
    heading = "No account session yet"
    description =
      "You can still browse the dashboard today, but protected Supabase-backed data will be added in follow-up steps."
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          Account
        </p>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
            accountState.status === "signed_in"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-white/10 bg-black/20 text-gray-300"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <p className="mt-3 text-lg font-semibold text-white">{heading}</p>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>

      {accountState.status === "signed_out" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
          >
            Create Account
          </Link>
        </div>
      ) : null}
    </div>
  )
}

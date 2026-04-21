"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"

type AuthSessionControlsProps = {
  compact?: boolean
  variant?: "landing" | "dashboard"
}

type SessionState = {
  email: string | null
  status: "loading" | "signed_in" | "signed_out" | "unavailable"
}

function formatEmail(email: string | null) {
  if (!email) {
    return "Signed In"
  }

  if (email.length <= 24) {
    return email
  }

  return `${email.slice(0, 12)}...${email.slice(-9)}`
}

export default function AuthSessionControls({
  compact = false,
  variant = "landing",
}: AuthSessionControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sessionState, setSessionState] = useState<SessionState>({
    email: null,
    status: "loading",
  })
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    async function initializeSessionState() {
      if (!hasSupabaseEnv()) {
        setSessionState({
          email: null,
          status: "unavailable",
        })
        return
      }

      const supabase = getSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSessionState({
        email: session?.user.email ?? null,
        status: session?.user ? "signed_in" : "signed_out",
      })
 
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSessionState({
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

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      setSessionState({
        email: null,
        status: "signed_out",
      })
      router.refresh()

      if (variant === "dashboard" || pathname === "/dashboard") {
        router.push("/")
      }
    } finally {
      setIsSigningOut(false)
    }
  }

  const sharedButtonClassName = compact
    ? "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition"
    : "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition"

  if (sessionState.status === "unavailable") {
    return (
      <span
        className={`${sharedButtonClassName} border border-white/10 bg-black/20 text-gray-500`}
      >
        Auth Unavailable
      </span>
    )
  }

  if (sessionState.status === "loading") {
    return (
      <span
        className={`${sharedButtonClassName} border border-white/10 bg-black/20 text-gray-400`}
      >
        Checking Session...
      </span>
    )
  }

  if (sessionState.status === "signed_in") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Link
          href="/dashboard"
          className={`${sharedButtonClassName} border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15`}
        >
          {formatEmail(sessionState.email)}
        </Link>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          className={`${sharedButtonClassName} border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <Link
        href="/login"
        className={`${sharedButtonClassName} border border-white/10 bg-white/5 text-white hover:bg-white/10`}
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className={`${sharedButtonClassName} bg-emerald-500 text-black hover:bg-emerald-400`}
      >
        Create Account
      </Link>
    </div>
  )
}

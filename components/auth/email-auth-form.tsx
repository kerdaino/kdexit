"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import ActionFeedback from "@/components/shared/action-feedback"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"

type EmailAuthFormProps = {
  mode: "login" | "signup"
  redirectPath?: string
}

type FeedbackState = {
  message: string
  tone: "success" | "error"
}

function getFormCopy(mode: "login" | "signup") {
  if (mode === "signup") {
    return {
      title: "Create your KDEXIT account",
      description:
        "Start with email and password so your dashboard can move toward real authenticated Supabase storage.",
      submitLabel: "Create Account",
      alternateLabel: "Already have an account?",
      alternateHref: "/login",
      alternateCta: "Log in",
    }
  }

  return {
    title: "Log in to KDEXIT",
    description:
      "Sign back in to continue working from the same dashboard foundation without changing the current product flow.",
    submitLabel: "Log In",
    alternateLabel: "Need an account?",
    alternateHref: "/signup",
    alternateCta: "Create one",
  }
}

function getSafeRedirectPath(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard"
  }

  return next
}

export default function EmailAuthForm({
  mode,
  redirectPath = "/dashboard",
}: EmailAuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const copy = getFormCopy(mode)
  const safeRedirectPath = getSafeRedirectPath(redirectPath)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const supabase = getSupabaseBrowserClient()

      if (mode === "signup") {
        const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          safeRedirectPath
        )}`
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo,
          },
        })

        if (error) {
          setFeedback({ message: error.message, tone: "error" })
          return
        }

        if (data.session) {
          router.push(safeRedirectPath)
          router.refresh()
          return
        }

        setFeedback({
          message:
            "Account created. Check your email to confirm your address before continuing.",
          tone: "success",
        })
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setFeedback({ message: error.message, tone: "error" })
        return
      }

      router.push(safeRedirectPath)
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-7">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Auth</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">{copy.description}</p>
      </div>

      {feedback ? (
        <div className="mt-5">
          <ActionFeedback message={feedback.message} tone={feedback.tone} />
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={isSubmitting}
            placeholder="you@company.com"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            disabled={isSubmitting}
            placeholder="At least 8 characters"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? mode === "signup"
              ? "Creating account..."
              : "Logging in..."
            : copy.submitLabel}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {copy.alternateLabel}{" "}
          <Link href={copy.alternateHref} className="font-medium text-emerald-400">
            {copy.alternateCta}
          </Link>
        </p>
        <Link href="/" className="font-medium text-gray-300 transition hover:text-white">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

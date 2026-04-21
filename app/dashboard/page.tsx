import Link from "next/link"
import { redirect } from "next/navigation"
import DashboardPageClient from "@/components/dashboard/dashboard-page-client"
import Footer from "@/components/shared/footer"
import TopNavigation from "@/components/shared/top-navigation"
import { ensureProfileForUser } from "@/lib/profiles/bootstrap"
import { hasSupabaseEnv } from "@/lib/supabase/env"
import { getSupabaseUser } from "@/lib/supabase/server"

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
        <TopNavigation variant="dashboard" />
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-400">
              Dashboard Access
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Sign-in protection is not configured yet.
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-400 sm:text-base">
              The dashboard now expects authenticated access before loading private
              strategy and execution data. Add the required public Supabase auth
              environment variables to enable protected dashboard access.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Back to Home
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400"
              >
                Open Login
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const user = await getSupabaseUser()

  if (!user) {
    redirect("/login?next=%2Fdashboard")
  }

  const profileBootstrap = await ensureProfileForUser(user)

  if (!profileBootstrap.ok) {
    return (
      <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
        <TopNavigation variant="dashboard" />
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-400">
              Account Setup
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              We could not prepare your KDEXIT profile.
            </h1>
            <p className="mt-4 text-sm leading-7 text-gray-400 sm:text-base">
              {profileBootstrap.message}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <DashboardPageClient />
  )
}

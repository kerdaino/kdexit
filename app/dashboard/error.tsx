"use client"

import { useEffect } from "react"
import { DashboardFailedRequestPanel } from "@/components/dashboard/dashboard-state-panels"
import Footer from "@/components/shared/footer"
import TopNavigation from "@/components/shared/top-navigation"
import { reportClientError } from "@/lib/monitoring/client"

type DashboardErrorProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function DashboardError({
  error,
  unstable_retry,
}: DashboardErrorProps) {
  useEffect(() => {
    void reportClientError({
      error,
      severity: "error",
      context: {
        route: "/dashboard",
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#E5E7EB]">
      <TopNavigation variant="dashboard" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <DashboardFailedRequestPanel
          eyebrow="Dashboard Error"
          title="The dashboard could not be rendered."
          description="This looks like an unexpected interface failure. Retry will re-render the dashboard without submitting any strategy, wallet, or execution action."
          issues={[
            {
              resource: "Dashboard",
              message:
                "The dashboard could not finish rendering. No strategy or execution action was submitted.",
            },
          ]}
          onRetry={unstable_retry}
        />
      </div>
      <Footer />
    </main>
  )
}
